<script lang="ts" setup>
import { ref, computed, watch } from 'vue'
import { useGrapes, useSelectedComponent } from '@/composables'
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
</script>

<template>
  <div class="h-screen flex flex-col relative">
    <div class="h-12 flex-shrink-0 bg-blue-100 grid grid-cols-[1fr_auto_1fr] items-center">
      <div class="flex items-center gap-2 pl-3 relative">
        <button
          type="button"
          class="text-xs px-2 py-1 rounded bg-white/70 hover:bg-white"
          @click="toggleMenu"
        >
          菜单
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
          class="text-xs px-2 py-1 rounded"
          :class="activePanel === 'blocks' ? 'bg-blue-200 text-blue-700' : 'bg-white/70'"
          @click="activePanel = 'blocks'"
        >
          Blocks
        </button>
        <button
          type="button"
          class="text-xs px-2 py-1 rounded"
          :class="activePanel === 'pages' ? 'bg-blue-200 text-blue-700' : 'bg-white/70'"
          @click="activePanel = 'pages'"
        >
          Pages
        </button>
      </div>
      <DeviceSwitcher :grapes="grapes" />
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
  </div>
</template>
