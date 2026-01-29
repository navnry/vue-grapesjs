<script lang="ts" setup>
import { computed, ref } from 'vue'
import { usePages } from '@/composables'

const props = defineProps<{
  grapes: any
}>()

const pagesMgr = usePages(props.grapes)
const newPageName = ref('')
const editingId = ref<string | null>(null)
const editingName = ref('')

const getPageId = (page: any) =>
  page?.get?.('id') ?? page?.id ?? page?.get?.('name') ?? page?.name

const getPageLabel = (page: any) =>
  page?.get?.('name') ?? page?.name ?? page?.get?.('id') ?? page?.id ?? 'Page'

const selectedId = computed(() => getPageId(pagesMgr.selected))

const addPage = () => {
  const name = newPageName.value.trim()
  if (!name) return
  const id = name.toLowerCase().replace(/\s+/g, '-')
  pagesMgr.add({ id, name })
  pagesMgr.select(id)
  newPageName.value = ''
}

const startEdit = (page: any) => {
  const id = getPageId(page)
  editingId.value = id
  editingName.value = getPageLabel(page)
}

const cancelEdit = () => {
  editingId.value = null
  editingName.value = ''
}

const saveEdit = (page: any) => {
  const name = editingName.value.trim()
  if (!name) return
  if (typeof page?.set === 'function') {
    page.set('name', name)
  } else if (page?.name !== undefined) {
    page.name = name
  }
  cancelEdit()
}

const removePage = (page: any) => {
  pagesMgr.remove(page)
}
</script>

<template>
  <div class="p-3">
    <div class="text-sm font-medium text-gray-700 mb-2">Pages</div>
    <div class="flex gap-2 mb-3">
      <input
        v-model="newPageName"
        class="flex-1 border rounded px-2 py-1 text-xs"
        placeholder="New page name"
        @keyup.enter="addPage"
      />
      <button class="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700" @click="addPage">
        添加
      </button>
    </div>
    <div class="grid grid-cols-1 gap-2">
      <div
        v-for="page in pagesMgr.pages"
        :key="getPageId(page)"
        class="border rounded px-2 py-2 text-left text-xs hover:bg-gray-50"
        :class="selectedId === getPageId(page) ? 'bg-blue-50 border-blue-200' : ''"
      >
        <div class="flex items-center justify-between gap-2">
          <button class="flex-1 text-left truncate" @click="pagesMgr.select(page)">
            {{ getPageLabel(page) }}
          </button>
          <span class="text-[10px] text-gray-400">{{ getPageId(page) }}</span>
        </div>
        <div v-if="editingId === getPageId(page)" class="mt-2 flex gap-2">
          <input
            v-model="editingName"
            class="flex-1 border rounded px-2 py-1 text-xs"
            @keyup.enter="saveEdit(page)"
          />
          <button class="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700" @click="saveEdit(page)">
            保存
          </button>
          <button class="text-xs px-2 py-1 rounded text-gray-500" @click="cancelEdit">
            取消
          </button>
        </div>
        <div v-else class="mt-2 flex gap-2">
          <button class="text-xs px-2 py-1 rounded bg-white/70" @click="startEdit(page)">
            编辑
          </button>
          <button class="text-xs px-2 py-1 rounded text-red-600" @click="removePage(page)">
            删除
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
