<script lang="ts" setup>
import { computed, reactive } from 'vue'
import { Icon } from '@iconify/vue'
import { useBlockManager } from '@/composables'

const props = defineProps<{
  grapes: any
}>()

const blockMgr = useBlockManager(props.grapes)
const openState = reactive<Record<string, boolean>>({})

const getBlockCategory = (block: any) => {
  const category =
    typeof block?.get === 'function' ? block.get('category') : block?.category
  if (!category) {
    return { id: 'uncategorized', label: '未分类', open: true }
  }
  if (typeof category === 'string') {
    return { id: category, label: category, open: true }
  }
  const id = category.id ?? category.get?.('id') ?? 'uncategorized'
  const label = category.label ?? category.get?.('label') ?? id
  const open = category.open ?? category.get?.('open') ?? true
  return { id, label, open }
}

const groupedBlocks = computed(() => {
  const groups = new Map<string, { id: string; label: string; open: boolean; items: any[] }>()
  const blocks = blockMgr.renderedBlocks ?? []
  for (const block of blocks) {
    const category = getBlockCategory(block)
    const key = category.id
    if (!groups.has(key)) {
      groups.set(key, {
        id: category.id,
        label: category.label,
        open: category.open,
        items: [],
      })
    }
    groups.get(key)!.items.push(block)
  }
  return Array.from(groups.values())
})

const isOpen = (group: { id: string; open: boolean }) =>
  openState[group.id] ?? group.open

const toggleGroup = (group: { id: string; open: boolean }) => {
  openState[group.id] = !isOpen(group)
}

const getBlockMedia = (block: any) => {
  const raw =
    typeof block?.get === 'function' ? block.get('media') : block?.media
  if (!raw) return ''
  if (typeof raw === 'string') return raw
  if (typeof raw === 'function') return raw()
  if (raw.value) return raw.value
  if (raw.content) return raw.content
  return ''
}
</script>

<template>
  <div class="p-3">
    <div class="text-sm font-medium text-gray-700 mb-2 text-center">Blocks</div>
    <div class="grid grid-cols-1 gap-4">
      <div v-for="group in groupedBlocks" :key="group.id">
        <button
          type="button"
          class="w-full flex items-center justify-between text-xs font-medium text-gray-500 mb-2"
          @click="toggleGroup(group)"
          :aria-expanded="isOpen(group)"
        >
          <span>{{ group.label }}</span>
          <Icon
            icon="lucide:chevron-down"
            class="transition-transform duration-200"
            :class="{ 'rotate-180': isOpen(group) }"
          />
        </button>
        <div class="collapse-wrapper" :class="{ open: isOpen(group) }">
          <div class="collapse-content">
            <div class="grid grid-cols-2 gap-2">
              <button
                v-for="block in group.items"
                :key="block.id"
                class="border rounded px-2 py-2 text-left hover:bg-gray-50"
                draggable="true"
                @dragstart="blockMgr.dragStart(block, $event)"
                @dragend="blockMgr.dragStop()"
                :title="block.label"
                :aria-label="block.label"
              >
                <div class="w-full flex items-center justify-center">
                  <div class="block-media" v-html="getBlockMedia(block)"></div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.collapse-wrapper {
  display: grid;
  grid-template-rows: 0fr;
  opacity: 0;
  transition: grid-template-rows 200ms ease, opacity 200ms ease;
}
.collapse-wrapper.open {
  grid-template-rows: 1fr;
  opacity: 1;
}
.collapse-content {
  overflow: hidden;
  min-height: 0;
}
</style>
