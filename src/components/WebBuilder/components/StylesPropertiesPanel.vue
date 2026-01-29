<script lang="ts" setup>
import { computed, ref } from 'vue'
import { useSelectedComponent, useStyleProps, useStyles } from '@/components/WebBuilder/composables'
import StylePropField from '@/components/WebBuilder/components/StylePropField.vue'

const props = defineProps<{
  grapes: any
}>()

const selected = useSelectedComponent(props.grapes)
const styleProps = useStyleProps(props.grapes)
const styles = useStyles(props.grapes)
const editorRef = ref<any>(null)

const activeTab = ref<'styles' | 'properties'>('styles')
const openSectors = ref<string[]>([])

const getSectorId = (sector: any) => sector.getId?.() ?? sector.id ?? sector.get?.('id') ?? ''

const ensureOpenSectors = () => {
  if (openSectors.value.length) return
  openSectors.value = styleProps.sectors.map((sector: any) => getSectorId(sector)).filter(Boolean)
}

ensureOpenSectors()

const hasSelection = computed(() => {
  return !!selected.component?._model || typeof selected.component?.get === 'function'
})

const selectedStyles = computed<Record<string, any>>(() => {
  const model = styles.selected?.rule?._model ?? styles.selected?.rule
  if (model && typeof model.getStyle === 'function') {
    return model.getStyle() || {}
  }
  return {}
})

const updateStyleValue = (key: string, value: string) => {
  const model = styles.selected?.rule?._model ?? styles.selected?.rule
  if (!model || typeof model.getStyle !== 'function') return
  const next = { ...(model.getStyle() || {}), [key]: value }
  model.setStyle(next)
}

props.grapes.onInit((editor: any) => {
  editorRef.value = editor
})

</script>

<template>
  <div v-if="hasSelection" class="border-t">
    <div class="flex items-center gap-2 px-3 py-2 border-b">
      <button
        type="button"
        class="text-xs px-2 py-1 rounded"
        :class="activeTab === 'styles' ? 'bg-blue-100 text-blue-700' : 'text-gray-500'"
        @click="activeTab = 'styles'"
      >
        Styles
      </button>
      <button
        type="button"
        class="text-xs px-2 py-1 rounded"
        :class="activeTab === 'properties' ? 'bg-blue-100 text-blue-700' : 'text-gray-500'"
        @click="activeTab = 'properties'"
      >
        Properties
      </button>
    </div>

    <div v-if="activeTab === 'styles'" class="p-3">
      <el-collapse v-model="openSectors">
        <el-collapse-item
          v-for="sector in styleProps.sectors"
          :key="getSectorId(sector)"
          :name="getSectorId(sector)"
        >
          <template #title>
            {{ sector.get?.('name') ?? sector.get?.('label') ?? sector.name ?? sector.label ?? 'Section' }}
          </template>
          <div class="grid grid-cols-1 gap-2">
            <StylePropField
              v-for="prop in sector.getProperties?.() ?? sector.properties ?? []"
              :key="prop.getId?.() ?? prop.id"
              :prop="prop"
              :editor="editorRef"
            />
          </div>
        </el-collapse-item>
      </el-collapse>
    </div>

    <div v-else class="p-3 space-y-2">
      <div class="text-xs text-gray-500">
        {{ styles.selected?.selector || 'No selector' }}
      </div>
      <div v-if="Object.keys(selectedStyles).length === 0" class="text-xs text-gray-400">
        暂无样式
      </div>
      <div v-else class="grid grid-cols-1 gap-2">
        <div
          v-for="(value, key) in selectedStyles"
          :key="key"
          class="grid grid-cols-[1fr_1fr] gap-2 items-center"
        >
          <div class="text-xs text-gray-600 truncate">{{ key }}</div>
          <input
            class="border rounded px-2 py-1 text-xs"
            :value="value"
            @input="updateStyleValue(key, ($event.target as HTMLInputElement).value)"
          />
        </div>
      </div>
    </div>
  </div>
</template>
