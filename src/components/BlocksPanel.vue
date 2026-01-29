<script lang="ts" setup>
import { computed, reactive, ref } from 'vue'
import { Icon } from '@iconify/vue'
import { useBlockManager } from '@/composables'
import { componentCategories, componentTemplates } from '@/utils/template-library'

const props = defineProps<{
  grapes: any
}>()

const blockMgr = useBlockManager(props.grapes)
const editorRef = ref<any>(null)
props.grapes.onInit((editor: any) => {
  editorRef.value = editor
})

const activeTab = ref<'blocks' | 'templates'>('blocks')
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

const templateCategories = computed(() => {
  return componentCategories.map((category) => ({
    ...category,
    items: componentTemplates.filter((tpl) => tpl.category === category.id),
  }))
})

const templateFilter = ref('all')

const filteredTemplateGroups = computed(() => {
  if (templateFilter.value === 'all') return templateCategories.value
  return templateCategories.value
    .map((category) => ({
      ...category,
      items: category.items.filter((tpl) => tpl.category === templateFilter.value),
    }))
    .filter((category) => category.items.length > 0)
})

const addTemplate = (template: any) => {
  const editor = editorRef.value
  if (!editor) return
  editor.addComponents(template.content)
}

const addBlockToCanvas = (block: any) => {
  const editor = editorRef.value
  if (!editor) return
  const content = block?.get?.('content') ?? block?.content
  if (!content) return
  editor.addComponents(content)
}
</script>

<template>
  <div class="p-3">
    <div class="flex items-center justify-center gap-2 mb-3">
      <button
        type="button"
        class="text-xs px-2 py-1 rounded"
        :class="activeTab === 'blocks' ? 'bg-blue-100 text-blue-700' : 'text-gray-500'"
        @click="activeTab = 'blocks'"
      >
        Blocks
      </button>
      <button
        type="button"
        class="text-xs px-2 py-1 rounded"
        :class="activeTab === 'templates' ? 'bg-blue-100 text-blue-700' : 'text-gray-500'"
        @click="activeTab = 'templates'"
      >
        Templates
      </button>
    </div>
    <div v-show="activeTab === 'blocks'" class="grid grid-cols-1 gap-4">
      <template v-for="group in groupedBlocks" :key="group.id">
        <div class="border-b">
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
              <div class="grid grid-cols-2 gap-2 py-3">
                <template v-for="block in group.items" :key="block.id">
                  <button
                    class="border rounded px-2 py-2 text-left hover:bg-gray-50"
                    draggable="true"
                    @dragstart="blockMgr.dragStart(block, $event)"
                    @dragend="blockMgr.dragStop()"
                    @click="addBlockToCanvas(block)"
                    :title="block.label"
                    :aria-label="block.label"
                  >
                    <div class="w-full flex items-center justify-center">
                      <div class="block-media" v-html="getBlockMedia(block)"></div>
                    </div>
                  </button>
                </template>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>
    <div v-show="activeTab === 'templates'" class="grid grid-cols-1 gap-4">
      <div class="flex flex-wrap gap-2">
        <button
          type="button"
          class="text-[11px] px-2 py-1 rounded-full"
          :class="templateFilter === 'all' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'"
          @click="templateFilter = 'all'"
        >
          全部
        </button>
        <button
          v-for="category in templateCategories"
          :key="category.id"
          type="button"
          class="text-[11px] px-2 py-1 rounded-full"
          :class="templateFilter === category.id ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'"
          @click="templateFilter = category.id"
        >
          {{ category.label }}
        </button>
      </div>
      <div v-for="group in filteredTemplateGroups" :key="group.id">
        <div class="text-xs font-medium text-gray-500 mb-2">{{ group.label }}</div>
        <div class="grid grid-cols-1 gap-2">
          <button
            v-for="tpl in group.items"
            :key="tpl.id"
            class="border rounded p-2 text-left hover:bg-gray-50"
            @click="addTemplate(tpl)"
            :title="tpl.label"
            :aria-label="tpl.label"
          >
            <div class="w-full aspect-[2/1] bg-gray-50 rounded mb-2 overflow-hidden">
              <img
                v-if="tpl.thumbnail"
                :src="tpl.thumbnail"
                :alt="tpl.label"
                class="w-full h-full object-cover"
              />
            </div>
            <div class="text-xs text-gray-700 truncate">{{ tpl.label }}</div>
          </button>
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
