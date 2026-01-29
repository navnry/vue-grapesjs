<script lang="ts" setup>
import { Icon } from '@iconify/vue'
import DeviceSwitcher from '@/components/DeviceSwitcher.vue'

const props = defineProps<{
  activePanel: 'blocks' | 'pages' | 'styles'
  showMenu: boolean
  showLayers: boolean
  grapes: any
}>()

const emit = defineEmits<{
  (e: 'toggle-menu'): void
  (e: 'select-panel', panel: 'blocks' | 'pages'): void
  (e: 'open-page-settings'): void
  (e: 'toggle-layers'): void
  (e: 'publish'): void
}>()
</script>

<template>
  <div class="h-12 flex-shrink-0 bg-blue-100 grid grid-cols-[1fr_auto_1fr] items-center">
    <div class="flex items-center gap-2 pl-3 relative">
      <button
        type="button"
        class="aspect-square px-2 py-1 rounded-full bg-white/70 hover:bg-white"
        @click="emit('toggle-menu')"
      >
        <Icon icon="hugeicons:menu-05" />
      </button>
      <div
        v-show="props.showMenu"
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
        :class="props.activePanel === 'blocks' ? 'bg-blue-200 text-blue-700' : 'bg-white/70'"
        @click="emit('select-panel', 'blocks')"
      >
        <Icon icon="cuida:plus-outline" />
      </button>
      <button
        type="button"
        class="aspect-square px-2 py-1 rounded"
        :class="props.activePanel === 'pages' ? 'bg-blue-200 text-blue-700' : 'bg-white/70'"
        @click="emit('select-panel', 'pages')"
      >
        <Icon icon="iconoir:multiple-pages-empty" />
      </button>
    </div>
    <div class="flex gap-3">
      <button
        type="button"
        class="w-8 h-8 self-center flex items-center justify-center rounded bg-white/70 hover:bg-white text-gray-600"
        @click="emit('open-page-settings')"
        aria-label="Page settings"
      >
        <Icon icon="qlementine-icons:page-setup-16" />
      </button>
      <DeviceSwitcher :grapes="props.grapes" />
    </div>
    <div class="flex h-full justify-end pl-3 gap-3">
      <button
        type="button"
        class="w-8 h-8 self-center flex items-center justify-center rounded bg-white/70 hover:bg-white"
        :class="props.showLayers ? 'text-blue-700' : 'text-gray-500'"
        @click="emit('toggle-layers')"
        :aria-pressed="props.showLayers"
        aria-label="Toggle layers"
      >
        <Icon icon="si:layers-line" />
      </button>
      <div class="flex">
        <button
          class="h-full text-sm px-8 py-1 bg-blue-500 text-white hover:bg-blue-600"
          @click="emit('publish')"
        >
          发布
        </button>
        <button
          class="h-full flex border-l border-gray-300 items-center justify-center aspect-square py-1 bg-blue-500 text-white hover:bg-blue-600"
        >
          <Icon icon="ep:arrow-down" />
        </button>
      </div>
    </div>
  </div>
</template>
