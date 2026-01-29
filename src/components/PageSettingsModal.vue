<script lang="ts" setup>
import type { PageSettings } from '@/utils/pageSettings'

const props = defineProps<{
  modelValue: boolean
  settings: PageSettings
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'save'): void
}>()

const close = () => emit('update:modelValue', false)
const save = () => emit('save')
</script>

<template>
  <div v-if="props.modelValue" class="absolute inset-0 z-20 flex items-center justify-center">
    <div class="absolute inset-0 bg-black/60" @click="close"></div>
    <div class="relative bg-white rounded shadow w-[480px]">
      <div class="px-4 py-3 border-b text-sm font-medium text-center">页面设置</div>
      <div class="p-4 space-y-3">
        <div>
          <div class="text-xs text-gray-500 mb-1">页面 ID</div>
          <input
            class="w-full border rounded px-2 py-1 text-xs bg-gray-50"
            :value="props.settings.id"
            disabled
          />
        </div>
        <div>
          <div class="text-xs text-gray-500 mb-1">页面名称</div>
          <input
            v-model="props.settings.name"
            class="w-full border rounded px-2 py-1 text-xs"
            placeholder="请输入页面名称"
          />
        </div>
        <div>
          <div class="text-xs text-gray-500 mb-1">Slug</div>
          <input
            v-model="props.settings.slug"
            class="w-full border rounded px-2 py-1 text-xs"
            placeholder="例如：about-us"
          />
        </div>
        <div>
          <div class="text-xs text-gray-500 mb-1">Title</div>
          <input
            v-model="props.settings.tdkTitle"
            class="w-full border rounded px-2 py-1 text-xs"
            placeholder="页面标题"
          />
        </div>
        <div>
          <div class="text-xs text-gray-500 mb-1">Description</div>
          <textarea
            v-model="props.settings.tdkDescription"
            class="w-full border rounded px-2 py-1 text-xs"
            rows="2"
            placeholder="页面描述"
          ></textarea>
        </div>
        <div>
          <div class="text-xs text-gray-500 mb-1">Keywords</div>
          <input
            v-model="props.settings.tdkKeywords"
            class="w-full border rounded px-2 py-1 text-xs"
            placeholder="关键词，用逗号分隔"
          />
        </div>
        <div>
          <div class="text-xs text-gray-500 mb-1">Custom HTML head</div>
          <textarea
            v-model="props.settings.customHead"
            class="w-full border rounded px-2 py-1 text-xs font-mono"
            rows="3"
            placeholder="<style>...</style>"
          ></textarea>
        </div>
        <div>
          <div class="text-xs text-gray-500 mb-1">Custom HTML body</div>
          <textarea
            v-model="props.settings.customBody"
            class="w-full border rounded px-2 py-1 text-xs font-mono"
            rows="3"
            placeholder="<script>...</script>"
          ></textarea>
        </div>
      </div>
      <div class="px-4 py-3 border-t flex justify-end gap-2">
        <button class="text-xs px-3 py-1 rounded text-gray-600" @click="close">
          取消
        </button>
        <button
          class="text-xs px-3 py-1 rounded bg-blue-500 text-white hover:bg-blue-600"
          @click="save"
        >
          保存
        </button>
      </div>
    </div>
  </div>
</template>
