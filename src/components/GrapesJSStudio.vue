<script lang="ts" setup>
import { ref, computed, watch } from 'vue'
import { useGrapes, useSelectedComponent, usePages } from '@/composables'
import '@/assets/vue-grapes.css'
import Traits from '@/components/Traits.vue'
import BlocksPanel from '@/components/BlocksPanel.vue'
import StylesPropertiesPanel from '@/components/StylesPropertiesPanel.vue'
import PagesPanel from '@/components/PagesPanel.vue'
import LayersPanel from '@/components/LayersPanel.vue'
import PageSettingsModal from '@/components/PageSettingsModal.vue'
import TopBar from '@/components/TopBar.vue'
import grapesjsTailwind from 'grapesjs-tailwind'
import {
  type PageSettings,
  getPageSettingsFromPage,
  applyPageSettingsToPage,
} from '@/utils/pageSettings'
import { buildPublishPayload } from '@/utils/publish'
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
  const data = buildPublishPayload(editor)
  console.log('[Publish] data', data)
}

const showPageSettings = ref(false)
const pageSettings = ref<PageSettings>({
  id: '',
  name: '',
  slug: '',
  tdkTitle: '',
  tdkDescription: '',
  tdkKeywords: '',
  customHead: '',
  customBody: '',
})

const openPageSettings = () => {
  const page = pagesMgr.selected
  pageSettings.value = getPageSettingsFromPage(page)
  showPageSettings.value = true
}

const closePageSettings = () => {
  showPageSettings.value = false
}

const savePageSettings = () => {
  const page = pagesMgr.selected
  applyPageSettingsToPage(page, pageSettings.value)
  showPageSettings.value = false
}
</script>

<template>
  <div class="h-screen flex flex-col relative">
    <TopBar
      :active-panel="activePanel"
      :show-menu="showMenu"
      :show-layers="showLayers"
      :grapes="grapes"
      @toggle-menu="toggleMenu"
      @select-panel="activePanel = $event"
      @open-page-settings="openPageSettings"
      @toggle-layers="toggleLayers"
      @publish="handlePublish"
    />
    <div class="flex-1 min-h-0 grid grid-cols-[280px_1fr]">
      <div class="min-h-0 overflow-y-auto overflow-x-hidden border-r">
        <BlocksPanel v-show="activePanel === 'blocks'" :grapes="grapes" />
        <PagesPanel v-show="activePanel === 'pages'" :grapes="grapes" />
        <StylesPropertiesPanel v-show="activePanel === 'styles'" :grapes="grapes" />
      </div>
      <div ref="canvas"></div>
    </div>
    <LayersPanel v-show="showLayers" :grapes="grapes" />

    <PageSettingsModal
      v-model="showPageSettings"
      :settings="pageSettings"
      @save="savePageSettings"
    />
  </div>
</template>
