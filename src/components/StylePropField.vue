<script lang="ts" setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = defineProps<{
  prop: any
  editor?: any
}>()

const propType = computed(() => props.prop?.getType?.() ?? props.prop?.get?.('type') ?? props.prop?.type)
const propLabel = computed(
  () =>
    props.prop?.getLabel?.() ??
    props.prop?.get?.('label') ??
    props.prop?.label ??
    props.prop?.getName?.() ??
    props.prop?.get?.('name') ??
    props.prop?.name ??
    'Property'
)
const propValue = ref<any>('')

const syncValue = () => {
  if (props.prop?.hasValue?.()) {
    propValue.value = props.prop?.getValue?.()
    return
  }
  propValue.value = props.prop?.getValue?.() ?? props.prop?.getDefaultValue?.() ?? ''
}

const attachListeners = (prop: any) => {
  if (!prop?.on) return () => {}
  const handler = () => syncValue()
  prop.on('change:value', handler)
  prop.on('change', handler)
  return () => {
    prop.off?.('change:value', handler)
    prop.off?.('change', handler)
  }
}

let detach: (() => void) | null = null

onMounted(() => {
  syncValue()
  detach = attachListeners(props.prop)
})

watch(
  () => props.prop,
  () => {
    if (detach) detach()
    syncValue()
    detach = attachListeners(props.prop)
  }
)

onBeforeUnmount(() => {
  if (detach) detach()
})

const options = computed(() => props.prop?.getOptions?.() ?? props.prop?.get?.('options') ?? props.prop?.options ?? [])

const handleChange = (value: any) => {
  if (props.prop?.upValue) {
    props.prop.upValue(value)
    return
  }
  if (props.prop?.set) props.prop.set('value', value)
}

const handleInput = (value: any) => {
  if (props.prop?.upValue) {
    props.prop.upValue(value, { partial: true })
    return
  }
  if (props.prop?.set) props.prop.set('value', value)
}

const openAssets = () => {
  const Assets = props.editor?.Assets
  if (!Assets) return
  Assets.open({
    select: (asset: any, complete: boolean) => {
      handleInput(asset.getSrc?.() ?? asset?.src ?? '')
      if (complete) Assets.close()
    },
    types: ['image'],
    accept: 'image/*',
  })
}

const subProps = computed(() => props.prop?.getProperties?.() ?? props.prop?.get?.('properties') ?? [])
const layers = computed(() => props.prop?.getLayers?.() ?? [])
</script>

<template>
  <div class="mb-3">
    <div class="text-xs text-gray-600 mb-1">{{ propLabel }}</div>

    <el-input
      v-if="propType === 'number'"
      size="small"
      class="w-full"
      :model-value="propValue"
      @update:modelValue="handleChange"
    />

    <el-radio-group
      v-else-if="propType === 'radio'"
      size="small"
      :model-value="propValue"
      @update:modelValue="handleChange"
    >
      <el-radio
        v-for="opt in options"
        :key="prop?.getOptionId?.(opt) ?? opt.value ?? opt"
        :value="prop?.getOptionId?.(opt) ?? opt.value ?? opt"
      >
        {{ prop?.getOptionLabel?.(opt) ?? opt.label ?? opt.value ?? opt }}
      </el-radio>
    </el-radio-group>

    <el-select
      v-else-if="propType === 'select'"
      size="small"
      class="w-full"
      :model-value="propValue"
      @update:modelValue="handleChange"
    >
      <el-option
        v-for="opt in options"
        :key="prop?.getOptionId?.(opt) ?? opt.value ?? opt"
        :label="prop?.getOptionLabel?.(opt) ?? opt.label ?? opt.value ?? opt"
        :value="prop?.getOptionId?.(opt) ?? opt.value ?? opt"
      />
    </el-select>

    <el-color-picker
      v-else-if="propType === 'color'"
      size="small"
      :model-value="propValue"
      @update:modelValue="handleInput"
    />

    <el-slider
      v-else-if="propType === 'slider'"
      :model-value="Number.isFinite(Number(propValue)) ? Number(propValue) : (props.prop?.getMin?.() ?? 0)"
      :min="props.prop?.getMin?.() ?? 0"
      :max="props.prop?.getMax?.() ?? 100"
      :step="props.prop?.getStep?.() ?? 1"
      @update:modelValue="handleChange"
    />

    <div v-else-if="propType === 'file'">
      <el-button size="small" class="w-full" @click="openAssets">选择图片</el-button>
    </div>

    <div v-else-if="propType === 'composite'" class="pl-2 border-l border-gray-200">
      <StylePropField v-for="p in subProps" :key="p.getId?.() ?? p.id" :prop="p" :editor="props.editor" />
    </div>

    <div v-else-if="propType === 'stack'" class="border rounded p-2">
      <div class="flex items-center justify-between mb-2 text-xs text-gray-500">
        <span>Layers</span>
        <el-button size="small" text @click="props.prop?.addLayer?.({}, { at: 0 })">添加</el-button>
      </div>
      <div v-for="layer in layers" :key="layer.getId?.() ?? layer.id" class="mb-2">
        <div class="flex items-center gap-2 text-xs">
          <el-button size="small" text @click="layer.move?.(layer.getIndex?.() - 1)">上移</el-button>
          <el-button size="small" text @click="layer.move?.(layer.getIndex?.() + 1)">下移</el-button>
          <button class="flex-1 text-left" @click="layer.select?.()">
            {{ layer.getLabel?.() ?? 'Layer' }}
          </button>
          <el-button size="small" text @click="layer.remove?.()">删除</el-button>
        </div>
        <div v-if="layer.isSelected?.()" class="pl-2 border-l border-gray-200 mt-2">
          <StylePropField v-for="p in subProps" :key="p.getId?.() ?? p.id" :prop="p" :editor="props.editor" />
        </div>
      </div>
    </div>

    <el-input
      v-else
      size="small"
      :model-value="propValue"
      @update:modelValue="handleInput"
    />
  </div>
</template>
