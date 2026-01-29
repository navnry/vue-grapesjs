<script lang="ts" setup>
import { ref, computed, watch } from 'vue'
import { useGrapes, useSelectedComponent, usePages } from '@/components/WebBuilder/composables'
import '@/assets/vue-grapes.css'
import { Icon } from '@iconify/vue'
import BlocksPanel from '@/components/WebBuilder/components/BlocksPanel.vue'
import StylesPropertiesPanel from '@/components/WebBuilder/components/StylesPropertiesPanel.vue'
import GlobalSettingsPanel from '@/components/WebBuilder/components/GlobalSettingsPanel.vue'
import PagesPanel from '@/components/WebBuilder/components/PagesPanel.vue'
import LayersPanel from '@/components/WebBuilder/components/LayersPanel.vue'
import PageSettingsModal from '@/components/WebBuilder/components/PageSettingsModal.vue'
import TopBar from '@/components/WebBuilder/components/TopBar.vue'
import grapesjsTailwind from 'grapesjs-tailwind'
import {
  type PageSettings,
  getPageSettingsFromPage,
  applyPageSettingsToPage,
} from '@/components/WebBuilder/utils/pageSettings'
import { buildPublishPayload } from '@/components/WebBuilder/utils/publish'
import { collectUsedClasses, buildTailwindCss } from '@/components/WebBuilder/utils/tailwind'
import { saveDraft } from '@/components/WebBuilder/utils/draftStorage'
// Use ref to determine container for the canvas
const canvas = ref(null)
const escapeName = (name: string) => `${name}`.trim().replace(/([^a-z0-9\w-:/]+)/gi, '-')

// Pass GrapesJS configuration object to useGrapes
const grapes = useGrapes({
  container: canvas,
  canvas: {
    styles: [
      'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap',
    ],
  },
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
const isEditorReady = ref(false)
const hasEditorLoad = ref(false)
const hasFrameLoad = ref(false)
grapes.onInit((editor) => {
  editorRef.value = editor
  const fontProp = editor.StyleManager?.getProperty?.('typography', 'font-family')
  if (fontProp?.addOption) {
    const options = fontProp.getOptions?.() ?? []
    const hasPoppins = options.some((opt: any) => {
      const value = fontProp.getOptionId?.(opt) ?? opt?.value ?? opt
      return `${value}`.toLowerCase().includes('poppins')
    })
    if (!hasPoppins) {
      fontProp.addOption({ id: 'Poppins', label: 'Poppins' })
    }
  }
  editor.on('load', () => {
    hasEditorLoad.value = true
    updateReady()
  })
  editor.on('canvas:frame:load', () => {
    hasFrameLoad.value = true
    updateReady()
  })
})

const READY_DELAY_MS = 1000
const updateReady = () => {
  if (hasEditorLoad.value && hasFrameLoad.value) {
    requestAnimationFrame(() => {
      setTimeout(() => {
        isEditorReady.value = true
      }, READY_DELAY_MS)
    })
  }
}
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
const activePanel = ref<'blocks' | 'styles' | 'pages' | 'global'>('blocks')
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

const handleSelectPanel = (panel: 'blocks' | 'pages' | 'global') => {
  activePanel.value = panel
  showMenu.value = false
}

const showLayers = ref(true)
const toggleLayers = () => {
  showLayers.value = !showLayers.value
}

const handlePublish = async () => {
  const editor = editorRef.value
  if (!editor) {
    console.warn('[Publish] Editor not ready')
    return
  }
  const data = buildPublishPayload(editor)
  const classes = collectUsedClasses(editor)

  try {
    const tailwindCss = await buildTailwindCss(classes)
    console.log('[Publish] data', { ...data, tailwind: { classes, css: tailwindCss } })
  } catch (error) {
    console.warn('[Publish] tailwind generation skipped (requires Node.js)', error)
    console.log('[Publish] data', { ...data, tailwind: { classes, css: '' } })
  }
}

const openPreview = async () => {
  const editor = editorRef.value
  if (!editor) return
  const page = editor.Pages?.getSelected?.()
  const component = page?.getMainComponent?.()
  const html = component ? editor.getHtml({ component }) : editor.getHtml()
  const css = component ? editor.getCss({ component }) : editor.getCss()

  const classes = collectUsedClasses(editor)
  let tailwindCss = ''
  try {
    tailwindCss = await buildTailwindCss(classes)
  } catch (error) {
    console.warn('[Preview] tailwind generation skipped (requires Node.js)', error)
  }

  const win = window.open('', '_blank')
  if (!win) return
  win.document.open()
  win.document.write(
    `<!doctype html><html><head><style>${tailwindCss}\n${css}</style></head><body>${html}</body></html>`
  )
  win.document.close()
}

const handleSaveDraft = async () => {
  const editor = editorRef.value
  if (!editor) return
  const data = buildPublishPayload(editor)
  await saveDraft('draft', data)
  console.log('[Draft] saved')
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

const savePageSettings = () => {
  const page = pagesMgr.selected
  applyPageSettingsToPage(page, pageSettings.value)
  showPageSettings.value = false
}
</script>

<template>
  <div class="h-screen relative" v-loading="!isEditorReady">
      <div class="h-full flex flex-col" v-show="isEditorReady">
        <TopBar
          :active-panel="activePanel"
          :show-menu="showMenu"
          :show-layers="showLayers"
          :grapes="grapes"
          @toggle-menu="toggleMenu"
          @select-panel="handleSelectPanel"
          @open-page-settings="openPageSettings"
          @toggle-layers="toggleLayers"
          @preview="openPreview"
          @save-draft="handleSaveDraft"
          @publish="handlePublish"
        />
        <div class="flex-1 min-h-0 grid grid-cols-[280px_1fr]">
          <div class="min-h-0 overflow-y-auto overflow-x-hidden border-r">
            <BlocksPanel v-show="activePanel === 'blocks'" :grapes="grapes" />
            <PagesPanel v-show="activePanel === 'pages'" :grapes="grapes" />
            <GlobalSettingsPanel v-show="activePanel === 'global'" :grapes="grapes" />
            <StylesPropertiesPanel v-show="activePanel === 'styles'" :grapes="grapes" />
          </div>
          <div class="relative">
            <div ref="canvas" class="absolute inset-0" />
          </div>
        </div>
        <LayersPanel v-show="showLayers" :grapes="grapes" @close="showLayers = false" />

        <PageSettingsModal
          v-model="showPageSettings"
          :settings="pageSettings"
          @save="savePageSettings"
        />
      </div>
  </div>
</template>
