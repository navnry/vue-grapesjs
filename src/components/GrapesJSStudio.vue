<script lang="ts" setup>
import { ref, computed, watch } from 'vue'
import { useGrapes, useSelectedComponent, usePages } from '@/composables'
import '@/assets/vue-grapes.css'
import { Icon } from '@iconify/vue'
import Traits from '@/components/Traits.vue'
import DeviceSwitcher from '@/components/DeviceSwitcher.vue'
import BlocksPanel from '@/components/BlocksPanel.vue'
import StylesPropertiesPanel from '@/components/StylesPropertiesPanel.vue'
import PagesPanel from '@/components/PagesPanel.vue'
import LayersPanel from '@/components/LayersPanel.vue'
import grapesjsTailwind from 'grapesjs-tailwind'
// Use ref to determine container for the canvas
const canvas = ref(null)
const escapeName = (name: string) => `${name}`.trim().replace(/([^a-z0-9\w-:/]+)/gi, '-')

// Pass GrapesJS configuration object to useGrapes
const grapes = useGrapes({
  container: canvas,
  deviceManager: {
    devices: [
      { id: 'desktop', name: 'Desktop', icon: 'lucide:monitor' },
      { id: 'mobile', name: 'Mobile', width: '375px' },
    ],
  },
  selectorManager: { escapeName },
  plugins: [grapesjsTailwind],
})
const editorRef = ref<any>(null)
grapes.onInit((editor) => {
  editorRef.value = editor
})
const selected = useSelectedComponent(grapes)
const pagesMgr = usePages(grapes)
const hasSelection = computed(() => {
  const comp = selected.component
  return !!(comp?._model || typeof comp?.get === 'function')
})
const selectedKey = computed(() => {
  const comp = selected.component as any
  return comp?.cid ?? comp?._model?.cid ?? null
})
const activePanel = ref<'blocks' | 'styles' | 'pages'>('blocks')
watch(
  selectedKey,
  (key) => {
    if (key) {
      activePanel.value = 'styles'
    } else if (activePanel.value === 'styles') {
      activePanel.value = 'blocks'
    }
  },
  { immediate: true },
)

const showMenu = ref(false)
const toggleMenu = () => {
  showMenu.value = !showMenu.value
}

const showLayers = ref(true)
const toggleLayers = () => {
  showLayers.value = !showLayers.value
}

const handlePublish = () => {
  const editor = editorRef.value
  if (!editor) {
    console.warn('[Publish] Editor not ready')
    return
  }
  const data = editor.getProjectData?.() ?? editor.getComponents?.()
  console.log('[Publish] data', data)
}

const showPageSettings = ref(false)
const pageSettings = ref({
  id: '',
  name: '',
  slug: '',
  tdkTitle: '',
  tdkDescription: '',
  tdkKeywords: '',
  customHead: '',
  customBody: '',
})

const getCustomMeta = (page: any) => {
  const custom = page?.get?.('custom') ?? page?.custom ?? {}
  const tdk = custom.tdk ?? {}
  return {
    slug: page?.get?.('slug') ?? page?.slug ?? custom.slug ?? '',
    tdkTitle: custom.tdkTitle ?? tdk.title ?? '',
    tdkDescription: custom.tdkDescription ?? tdk.description ?? '',
    tdkKeywords: custom.tdkKeywords ?? tdk.keywords ?? '',
    customHead: custom.customHead ?? custom.head ?? '',
    customBody: custom.customBody ?? custom.body ?? '',
  }
}

const openPageSettings = () => {
  const page = pagesMgr.selected
  const id = page?.get?.('id') ?? page?.id ?? ''
  const name = page?.get?.('name') ?? page?.name ?? ''
  const meta = getCustomMeta(page)
  pageSettings.value = {
    id,
    name,
    ...meta,
  }
  showPageSettings.value = true
}

const closePageSettings = () => {
  showPageSettings.value = false
}

const savePageSettings = () => {
  const page = pagesMgr.selected
  const custom = page?.get?.('custom') ?? page?.custom ?? {}
  if (page?.set) {
    page.set('name', pageSettings.value.name)
    page.set('slug', pageSettings.value.slug)
    page.set('custom', {
      ...custom,
      slug: pageSettings.value.slug,
      tdkTitle: pageSettings.value.tdkTitle,
      tdkDescription: pageSettings.value.tdkDescription,
      tdkKeywords: pageSettings.value.tdkKeywords,
      customHead: pageSettings.value.customHead,
      customBody: pageSettings.value.customBody,
    })
  } else if (page?.name !== undefined) {
    page.name = pageSettings.value.name
    page.slug = pageSettings.value.slug
    page.custom = {
      ...custom,
      slug: pageSettings.value.slug,
      tdkTitle: pageSettings.value.tdkTitle,
      tdkDescription: pageSettings.value.tdkDescription,
      tdkKeywords: pageSettings.value.tdkKeywords,
      customHead: pageSettings.value.customHead,
      customBody: pageSettings.value.customBody,
    }
  }
  showPageSettings.value = false
}
</script>

<template>
  <div class="h-screen flex flex-col relative">
    <div class="h-12 flex-shrink-0 bg-blue-100 grid grid-cols-[1fr_auto_1fr] items-center">
      <div class="flex items-center gap-2 pl-3 relative">
        <button
          type="button"
          class="aspect-square px-2 py-1 rounded-full bg-white/70 hover:bg-white"
          @click="toggleMenu"
        >
          <Icon icon="hugeicons:menu-05"></Icon>
        </button>
        <div
          v-show="showMenu"
          class="absolute left-3 top-10 z-10 bg-white border rounded shadow text-xs min-w-[140px]"
        >
          <button type="button" class="w-full text-left px-3 py-2 hover:bg-gray-50">
            全局设置
          </button>
          <button type="button" class="w-full text-left px-3 py-2 hover:bg-gray-50">
            返回后台
          </button>
        </div>
        <button
          type="button"
          class="px-2 aspect-square py-1 rounded"
          :class="activePanel === 'blocks' ? 'bg-blue-200 text-blue-700' : 'bg-white/70'"
          @click="activePanel = 'blocks'"
        >
          <Icon icon="cuida:plus-outline" />
        </button>
        <button
          type="button"
          class="aspect-square px-2 py-1 rounded"
          :class="activePanel === 'pages' ? 'bg-blue-200 text-blue-700' : 'bg-white/70'"
          @click="activePanel = 'pages'"
        >
          <Icon icon="iconoir:multiple-pages-empty"></Icon>
        </button>
      </div>
        <div class="flex gap-3">
          <button
            type="button"
            class="w-8 h-8 self-center flex items-center justify-center rounded bg-white/70 hover:bg-white text-gray-600"
            @click="openPageSettings"
            aria-label="Page settings"
          >
            <Icon icon="qlementine-icons:page-setup-16" />
          </button>
        <DeviceSwitcher :grapes="grapes" />
      </div>
      <div class="flex h-full justify-end pl-3 gap-3">
        <button
          type="button"
          class="w-8 h-8 self-center flex items-center justify-center rounded bg-white/70 hover:bg-white"
          :class="showLayers ? 'text-blue-700' : 'text-gray-500'"
          @click="toggleLayers"
          :aria-pressed="showLayers"
          aria-label="Toggle layers"
        >
          <Icon icon="si:layers-line" />
        </button>
        <div class="flex">
          <button
            class="h-full text-sm px-8 py-1 bg-blue-500 text-white hover:bg-blue-600"
            @click="handlePublish"
          >
            发布
          </button>
          <button class="h-full flex border-l border-gray-300 items-center justify-center aspect-square py-1 bg-blue-500 text-white hover:bg-blue-600">
            <Icon icon="ep:arrow-down" />
          </button>
        </div>
      </div>
    </div>
    <div class="flex-1 min-h-0 grid grid-cols-[280px_1fr]">
      <div class="min-h-0 overflow-y-auto overflow-x-hidden border-r">
        <BlocksPanel v-show="activePanel === 'blocks'" :grapes="grapes" />
        <PagesPanel v-show="activePanel === 'pages'" :grapes="grapes" />
        <StylesPropertiesPanel v-show="activePanel === 'styles'" :grapes="grapes" />
      </div>
      <div ref="canvas"></div>
    </div>
    <LayersPanel v-show="showLayers" :grapes="grapes" />

    <div v-if="showPageSettings" class="absolute inset-0 z-20 flex items-center justify-center">
      <div class="absolute inset-0 bg-black/30" @click="closePageSettings"></div>
      <div class="relative bg-white rounded shadow w-[360px]">
        <div class="px-4 py-3 border-b text-sm font-medium">页面设置</div>
        <div class="p-4 space-y-3">
          <div>
            <div class="text-xs text-gray-500 mb-1">页面 ID</div>
            <input class="w-full border rounded px-2 py-1 text-xs bg-gray-50" :value="pageSettings.id" disabled />
          </div>
          <div>
            <div class="text-xs text-gray-500 mb-1">页面名称</div>
            <input
              v-model="pageSettings.name"
              class="w-full border rounded px-2 py-1 text-xs"
              placeholder="请输入页面名称"
            />
          </div>
          <div>
            <div class="text-xs text-gray-500 mb-1">Slug</div>
            <input
              v-model="pageSettings.slug"
              class="w-full border rounded px-2 py-1 text-xs"
              placeholder="例如：about-us"
            />
          </div>
          <div>
            <div class="text-xs text-gray-500 mb-1">Title</div>
            <input
              v-model="pageSettings.tdkTitle"
              class="w-full border rounded px-2 py-1 text-xs"
              placeholder="页面标题"
            />
          </div>
          <div>
            <div class="text-xs text-gray-500 mb-1">Description</div>
            <textarea
              v-model="pageSettings.tdkDescription"
              class="w-full border rounded px-2 py-1 text-xs"
              rows="2"
              placeholder="页面描述"
            ></textarea>
          </div>
          <div>
            <div class="text-xs text-gray-500 mb-1">Keywords</div>
            <input
              v-model="pageSettings.tdkKeywords"
              class="w-full border rounded px-2 py-1 text-xs"
              placeholder="关键词，用逗号分隔"
            />
          </div>
          <div>
            <div class="text-xs text-gray-500 mb-1">Custom HTML head</div>
            <textarea
              v-model="pageSettings.customHead"
              class="w-full border rounded px-2 py-1 text-xs font-mono"
              rows="3"
              placeholder="<style>...</style>"
            ></textarea>
          </div>
          <div>
            <div class="text-xs text-gray-500 mb-1">Custom HTML body</div>
            <textarea
              v-model="pageSettings.customBody"
              class="w-full border rounded px-2 py-1 text-xs font-mono"
              rows="3"
              placeholder="<script>...</script>"
            ></textarea>
          </div>
        </div>
        <div class="px-4 py-3 border-t flex justify-end gap-2">
          <button class="text-xs px-3 py-1 rounded text-gray-600" @click="closePageSettings">取消</button>
          <button class="text-xs px-3 py-1 rounded bg-blue-500 text-white hover:bg-blue-600" @click="savePageSettings">
            保存
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
