<script lang="ts" setup>
import { computed, isRef, reactive, watch, nextTick, provide, inject } from 'vue'
import { Icon } from '@iconify/vue'

const props = defineProps<{
  nodes: any[]
  onSelect: (node: any) => void
  selectedKey?: string | null
}>()

const emit = defineEmits<{
  (e: 'context', payload: { node: any; x: number; y: number }): void
}>()

const getLabel = (node: any) =>
  node?.getName?.() ??
  node?.get?.('name') ??
  node?.get?.('customName') ??
  node?.get?.('type') ??
  node?.get?.('tagName') ??
  node?.get?.('content') ??
  node?.name ??
  node?.type ??
  'Component'

const normalizeNodes = (value: any) => {
  const raw = isRef(value) ? value.value : value
  if (!raw) return []
  if (Array.isArray(raw)) return raw
  if (Array.isArray(raw.models)) return raw.models
  if (Array.isArray(raw.value)) return raw.value
  return []
}

const getChildrenNodes = (node: any) => {
  const childRef = node?.components ?? node?.get?.('components')
  return normalizeNodes(childRef)
}

type TreeStore = {
  openState: Record<string, boolean>
  toggleAll: (expand: boolean, nodes: any[]) => void
}

const treeStore = inject<TreeStore | null>('layersTreeStore', null)
const localStore: TreeStore = treeStore ?? {
  openState: reactive<Record<string, boolean>>({}),
  toggleAll: (expand: boolean, nodes: any[]) => {
    const walk = (listNodes: any[]) => {
      for (const node of listNodes) {
        const key = getNodeKey(node)
        if (key) localStore.openState[key] = expand
        const children = getChildrenNodes(node)
        if (children.length) walk(children)
      }
    }
    walk(nodes)
  },
}

if (!treeStore) {
  provide('layersTreeStore', localStore)
}

const nodeEls = new Map<string, HTMLElement>()

const getNodeKey = (node: any) => node?.cid ?? node?.id ?? node?.get?.('id')

const isOpen = (node: any) => localStore.openState[getNodeKey(node)] ?? false

const toggleNode = (node: any) => {
  const key = getNodeKey(node)
  if (!key) return
  localStore.openState[key] = !isOpen(node)
}


const list = computed(() => normalizeNodes(props.nodes))

const findPath = (nodes: any[], targetKey: string, path: string[] = []): string[] | null => {
  for (const node of nodes) {
    const key = getNodeKey(node)
    if (!key) continue
    const nextPath = [...path, key]
    if (key === targetKey) return nextPath
    const children = getChildrenNodes(node)
    if (children.length) {
      const found = findPath(children, targetKey, nextPath)
      if (found) return found
    }
  }
  return null
}

watch(
  () => [list.value, props.selectedKey],
  ([nodes, key]) => {
    if (!key) return
    const path = findPath(nodes as any[], key)
    if (!path) return
    path.forEach((k) => {
      localStore.openState[k] = true
    })
  },
  { immediate: true }
)

watch(
  () => props.selectedKey,
  async (key) => {
    if (!key) return
    await nextTick()
    const el = nodeEls.get(key)
    if (el) el.scrollIntoView({ block: 'nearest' })
  },
  { immediate: true }
)

const toggleAll = (expand: boolean) => {
  localStore.toggleAll(expand, list.value as any[])
}

defineExpose({ toggleAll })
</script>

<template>
  <ul class="space-y-1">
    <li
      v-for="node in list"
      :key="getNodeKey(node)"
      :ref="(el) => { const key = getNodeKey(node); if (key && el) nodeEls.set(key, el as HTMLElement) }"
      class="relative group"
    >
      <div class="flex items-center pointer-events-none">
        <button
          v-if="getChildrenNodes(node).length"
          type="button"
          class="w-5 h-5 flex items-center justify-center rounded hover:bg-gray-50 pointer-events-auto"
          @click.stop="toggleNode(node)"
          :aria-label="isOpen(node) ? 'Collapse' : 'Expand'"
        >
          <Icon
            icon="tabler:caret-right-filled"
            class="transition-transform duration-200"
            :class="{ 'rotate-90': isOpen(node) }"
          />
        </button>
        <span v-else class="w-5 h-5 inline-block"></span>
        <button
          type="button"
          class="flex-1 text-left text-xs px-2 py-1 rounded hover:bg-gray-50 pointer-events-auto"
          :class="getNodeKey(node) === props.selectedKey ? 'bg-blue-50 text-blue-700' : ''"
          @click="props.onSelect(node._model ?? node)"
          @contextmenu.prevent="emit('context', { node, x: $event.clientX, y: $event.clientY })"
        >
          {{ getLabel(node) }}
        </button>
      </div>
      <div
        v-if="getChildrenNodes(node).length"
        class="pl-3 collapse-wrapper"
        :class="{ open: isOpen(node) }"
      >
        <div class="collapse-content">
          <LayersTree
            v-show="isOpen(node)"
            :nodes="getChildrenNodes(node)"
            :on-select="props.onSelect"
            :selected-key="props.selectedKey"
            @context="emit('context', $event)"
          />
        </div>
      </div>
    </li>
  </ul>
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
