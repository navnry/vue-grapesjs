<script lang="ts" setup>
import { computed, isRef, ref, onBeforeUnmount } from 'vue'
import { Icon } from '@iconify/vue'
import { useLayers, useSelectedComponent } from '@/composables'
import LayersTree from '@/components/LayersTree.vue'

const props = defineProps<{
  grapes: any
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const layers = useLayers(props.grapes)
const selected = useSelectedComponent(props.grapes)
const treeRef = ref<InstanceType<typeof LayersTree> | null>(null)
const allExpanded = ref(false)

const normalizeNodes = (value: any) => {
  const raw = isRef(value) ? value.value : value
  if (!raw) return []
  if (Array.isArray(raw)) return raw
  if (Array.isArray(raw.models)) return raw.models
  if (Array.isArray(raw.value)) return raw.value
  return []
}

const nodes = computed(() => {
  const wrapper = layers.wrapper as any
  const fromProxy = normalizeNodes(wrapper?.components)
  if (fromProxy.length) return fromProxy
  const raw = wrapper?._model ?? wrapper
  const rawChildren = raw?.get?.('components') ?? raw?.components
  return normalizeNodes(rawChildren)
})

const selectedKey = computed(() => {
  const comp = selected.component as any
  return comp?.cid ?? comp?._model?.cid ?? null
})

const toggleAll = () => {
  allExpanded.value = !allExpanded.value
  treeRef.value?.toggleAll(allExpanded.value)
}

const pos = ref({ x: 0, y: 64 })
const panelWidth = 256
const panelMargin = 16

const updateDefaultPos = () => {
  pos.value = {
    x: Math.max(panelMargin, window.innerWidth - panelWidth - panelMargin),
    y: pos.value.y,
  }
}
const dragging = ref(false)
const dragOffset = { x: 0, y: 0 }

const onMouseMove = (e: MouseEvent) => {
  if (!dragging.value) return
  pos.value = {
    x: e.clientX - dragOffset.x,
    y: e.clientY - dragOffset.y,
  }
}

const onMouseUp = () => {
  dragging.value = false
  window.removeEventListener('mousemove', onMouseMove)
  window.removeEventListener('mouseup', onMouseUp)
}

const onDragStart = (e: MouseEvent) => {
  dragging.value = true
  dragOffset.x = e.clientX - pos.value.x
  dragOffset.y = e.clientY - pos.value.y
  window.addEventListener('mousemove', onMouseMove)
  window.addEventListener('mouseup', onMouseUp)
}

updateDefaultPos()
window.addEventListener('resize', updateDefaultPos)

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateDefaultPos)
  window.removeEventListener('mousemove', onMouseMove)
  window.removeEventListener('mouseup', onMouseUp)
})
</script>

<template>
  <div
    class="absolute w-64 bg-white/95 backdrop-blur border rounded shadow z-10"
    :style="{ left: `${pos.x}px`, top: `${pos.y}px` }"
  >
    <div
      class="px-3 py-2 border-b text-sm font-medium text-gray-700 grid grid-cols-[1fr_auto_1fr] items-center gap-2 cursor-move select-none"
      @mousedown="onDragStart"
    >
      <button
        type="button"
        class="size-5 border flex items-center justify-center rounded hover:bg-gray-50"
        @click="toggleAll"
        :aria-label="allExpanded ? 'Collapse all' : 'Expand all'"
      >
        <Icon
          icon="icon-park-solid:right-one"
          class="transition-transform duration-200"
          :class="{ 'rotate-90': allExpanded }"
        />
      </button>
      <span>Layers</span>
      <button
        type="button"
        class="size-5 justify-self-end flex items-center justify-center rounded hover:bg-gray-50"
        @click.stop="emit('close')"
      >
        <Icon
          icon="uiw:close"
          class="text-xs transition-transform duration-200"
        />
      </button>
    </div>
    <div class="h-80 overflow-auto p-2">
      <LayersTree
        ref="treeRef"
        :nodes="nodes"
        :on-select="layers.select"
        :selected-key="selectedKey"
      />
    </div>
  </div>
</template>
