<script lang="ts" setup>
import { ref } from 'vue'
import { Icon } from '@iconify/vue'
import DeviceSwitcher from '@/components/DeviceSwitcher.vue'

const props = defineProps<{
  activePanel: 'blocks' | 'pages' | 'styles' | 'global'
  showMenu: boolean
  showLayers: boolean
  grapes: any
}>()

const emit = defineEmits<{
  (e: 'toggle-menu'): void
  (e: 'select-panel', panel: 'blocks' | 'pages' | 'global'): void
  (e: 'open-page-settings'): void
  (e: 'toggle-layers'): void
  (e: 'preview'): void
  (e: 'save-draft'): void
  (e: 'publish'): void
}>()

const showPublishMenu = ref(false)
</script>

<template>
  <div class="h-12 flex-shrink-0 bg-editor-panel grid grid-cols-[1fr_auto_1fr] items-center">
    <div class="flex items-center gap-2 pl-3 relative">
      <button
        type="button"
        class="aspect-square px-2 py-1 rounded bg-white text-editor-primary"
        @click="emit('toggle-menu')"
      >
        <Icon icon="hugeicons:menu-05" />
      </button>
      <div
        v-show="props.showMenu"
        class="absolute left-3 top-10 z-10 bg-white border rounded shadow text-xs min-w-[140px]"
      >
        <button
          type="button"
          class="w-full text-left px-3 py-2 hover:bg-gray-50"
          @click="emit('select-panel', 'global')"
        >
          全局设置
        </button>
        <button type="button" class="w-full text-left px-3 py-2 hover:bg-gray-50">返回后台</button>
      </div>
      <button
        type="button"
        class="px-2 aspect-square py-1 rounded text-white"
        :class="props.activePanel === 'blocks' ? 'bg-editor-btn-active' : ''"
        @click="emit('select-panel', 'blocks')"
      >
        <Icon icon="cuida:plus-outline" />
      </button>
      <button
        type="button"
        class="aspect-square px-2 py-1 rounded text-white"
        :class="props.activePanel === 'pages' ? 'bg-editor-btn-active' : ''"
        @click="emit('select-panel', 'pages')"
      >
        <Icon icon="iconoir:multiple-pages-empty" />
      </button>
    </div>
    <div class="flex gap-3">
      <button
        type="button"
        class="w-8 h-8 self-center flex items-center justify-center rounded hover:bg-editor-btn-active text-white"
        @click="emit('open-page-settings')"
        aria-label="Page settings"
      >
        <Icon icon="qlementine-icons:page-setup-16" />
      </button>
      <DeviceSwitcher :grapes="props.grapes" />
    </div>
    <div class="flex h-full justify-end pl-3 gap-3 relative">
      <button
        type="button"
        class="w-8 h-8 self-center flex items-center justify-center rounded hover:bg-editor-btn-hover"
        :class="props.showLayers ? 'bg-editor-btn-active text-white' : 'text-white'"
        @click="emit('toggle-layers')"
        :aria-pressed="props.showLayers"
        aria-label="Toggle layers"
      >
        <Icon icon="si:layers-line" />
      </button>
      <button
        type="button"
        class="w-8 h-8 self-center flex items-center justify-center rounded hover:bg-[#ffffff29] text-white"
        @click="emit('preview')"
        aria-label="Preview"
      >
        <Icon icon="mdi:eye-outline" />
      </button>
      <div class="flex">
        <button
          class="h-full text-sm px-8 py-1 bg-editor-primary text-white hover:bg-blue-600"
          @click="emit('publish')"
        >
          Publish
        </button>
        <button
          class="h-full flex border-l border-white/20 items-center justify-center aspect-square py-1 bg-editor-primary text-white hover:bg-blue-600"
          @click="showPublishMenu = !showPublishMenu"
        >
          <Icon icon="ep:arrow-down" />
        </button>
      </div>
      <div
        v-show="showPublishMenu"
        class="absolute right-0 top-12 z-20 bg-white border rounded shadow text-xs min-w-[140px]"
      >
        <button
          type="button"
          class="w-full text-left px-3 py-2 hover:bg-gray-50"
          @click="emit('save-draft')"
        >
          保存草稿
        </button>
      </div>
    </div>
  </div>
</template>
