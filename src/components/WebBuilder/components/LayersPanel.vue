<script lang="ts" setup>
import { computed, isRef, ref, onBeforeUnmount, onMounted, nextTick } from 'vue'
import { Icon } from '@iconify/vue'
import { useLayers, useSelectedComponent } from '@/components/WebBuilder/composables'
import LayersTree from '@/components/WebBuilder/components/LayersTree.vue'
import interact from 'interactjs'

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

const contextMenu = ref<{ visible: boolean; x: number; y: number; node: any | null }>({
  visible: false,
  x: 0,
  y: 0,
  node: null,
})

const openContextMenu = (payload: { node: any; x: number; y: number }) => {
  contextMenu.value = { visible: true, x: payload.x, y: payload.y, node: payload.node }
}

const closeContextMenu = () => {
  contextMenu.value.visible = false
  contextMenu.value.node = null
}

const handleCopy = () => {
  const node = contextMenu.value.node
  if (!node?.clone) return
  const parent = node.parent?.()
  const collection = parent?.components?.()
  if (!collection?.add) return
  const index = collection.indexOf ? collection.indexOf(node) : collection.models?.indexOf(node)
  const clone = node.clone()
  collection.add(clone, typeof index === 'number' ? { at: index + 1 } : {})
  closeContextMenu()
}

const handleDelete = () => {
  const node = contextMenu.value.node
  if (node?.remove) node.remove()
  closeContextMenu()
}

const toggleAll = () => {
  allExpanded.value = !allExpanded.value
  treeRef.value?.toggleAll(allExpanded.value)
}

const panelRef = ref<HTMLElement | null>(null)
const pos = ref({ x: 0, y: 64 })
const panelWidth = 256
const panelMargin = 16
let interactInstance: any = null

const updateDefaultPos = () => {
  pos.value = {
    x: Math.max(panelMargin, window.innerWidth - panelWidth - panelMargin),
    y: pos.value.y,
  }
}

onMounted(() => {
  updateDefaultPos()
  window.addEventListener('resize', updateDefaultPos)
  
  nextTick(() => {
    if (panelRef.value) {
      interactInstance = interact(panelRef.value)
        .draggable({
          allowFrom: '.cursor-move',
          listeners: {
            start() {
              // 拖拽开始
            },
            move(event: any) {
              const newX = pos.value.x + event.dx
              const newY = pos.value.y + event.dy
              
              // 限制在窗口内
              const minX = 0
              const minY = 0
              const maxX = window.innerWidth - panelWidth
              const maxY = window.innerHeight - 100 // 假设面板高度约 400px
              
              pos.value.x = Math.max(minX, Math.min(maxX, newX))
              pos.value.y = Math.max(minY, Math.min(maxY, newY))
            },
            end() {
              // 拖拽结束，可以在这里保存位置到 localStorage
            },
          },
        })
    }
  })
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateDefaultPos)
  if (interactInstance) {
    interactInstance.unset()
    interactInstance = null
  }
})

onMounted(() => {
  window.addEventListener('click', closeContextMenu)
})

onBeforeUnmount(() => {
  window.removeEventListener('click', closeContextMenu)
})
</script>

<template>
  <div>
    <div
      ref="panelRef"
      class="absolute w-64 bg-white/80 backdrop-blur-[5px] border rounded shadow z-10"
      :style="{ left: `${pos.x}px`, top: `${pos.y}px` }"
    >
      <div
        class="px-3 py-2 border-b text-sm font-medium text-gray-700 grid grid-cols-[1fr_auto_1fr] items-center gap-2 cursor-move select-none"
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
          <Icon icon="uiw:close" class="text-xs transition-transform duration-200" />
        </button>
      </div>
      <div class="h-80 overflow-auto p-2">
        <LayersTree
          ref="treeRef"
          :nodes="nodes"
          :on-select="layers.select"
          :selected-key="selectedKey"
          :parent-collection="(layers.wrapper as any)?.components ?? (layers.wrapper as any)?._model?.get?.('components')"
          @context="openContextMenu"
        />
      </div>
    </div>

    <div
      v-show="contextMenu.visible"
      class="fixed z-20 bg-white border rounded shadow text-xs min-w-[120px]"
      :style="{ left: `${contextMenu.x}px`, top: `${contextMenu.y}px` }"
      @click.stop
    >
      <button class="w-full text-left px-3 py-2 hover:bg-gray-50" @click="handleCopy">
        复制
      </button>
      <button class="w-full text-left px-3 py-2 hover:bg-gray-50" @click="handleDelete">
        删除
      </button>
    </div>
  </div>
</template>
