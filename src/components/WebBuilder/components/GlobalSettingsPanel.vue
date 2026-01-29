<script lang="ts" setup>
import { onMounted, ref } from 'vue'

const props = defineProps<{
  grapes: any
}>()

const editorRef = ref<any>(null)
const fontOptions = ref<Array<{ label: string; value: string }>>([])
const bodyFont = ref('')
const headingFont = ref('')
const pendingBodyFont = ref('')
const pendingHeadingFont = ref('')

const normalizeOption = (prop: any, opt: any) => {
  const value = prop?.getOptionId?.(opt) ?? opt?.value ?? opt
  const label = prop?.getOptionLabel?.(opt) ?? opt?.label ?? opt?.value ?? opt
  return { value: `${value}`, label: `${label}` }
}

const loadFontOptions = (editor: any) => {
  const prop = editor.StyleManager?.getProperty?.('typography', 'font-family')
  const opts = prop?.getOptions?.() ?? []
  fontOptions.value = opts.map((opt: any) => normalizeOption(prop, opt))
  if (!fontOptions.value.length) {
    fontOptions.value = [
      { label: 'Arial', value: 'Arial, sans-serif' },
      { label: 'Helvetica', value: 'Helvetica, sans-serif' },
      { label: 'Times New Roman', value: '"Times New Roman", serif' },
      { label: 'Georgia', value: 'Georgia, serif' },
      { label: 'Poppins', value: 'Poppins, sans-serif' },
    ]
  }
}

const getOrCreateRule = (editor: any, selector: string) => {
  const css = editor.CssComposer
  const rule = css.getRule ? css.getRule(selector) : null
  return rule || css.add(selector, { style: {} })
}

const readRuleFont = (editor: any, selector: string) => {
  const rule = editor.CssComposer?.getRule?.(selector)
  const style = rule?.getStyle?.() ?? {}
  return style['font-family'] ?? ''
}

const applyFont = (editor: any, selector: string, font: string) => {
  const rule = getOrCreateRule(editor, selector)
  const style = rule.getStyle?.() ?? {}
  rule.setStyle({ ...style, 'font-family': font })
}

const initValues = (editor: any) => {
  const bodyValue = readRuleFont(editor, 'body')
  const headingValue = readRuleFont(editor, 'h1,h2,h3,h4,h5,h6')
  bodyFont.value = bodyValue || fontOptions.value[0]?.value || ''
  headingFont.value = headingValue || fontOptions.value[0]?.value || ''
  pendingBodyFont.value = bodyFont.value
  pendingHeadingFont.value = headingFont.value
}

onMounted(() => {
  props.grapes.onInit((editor: any) => {
    editorRef.value = editor
    loadFontOptions(editor)
    initValues(editor)
  })
})

const applyHeadings = (editor: any, font: string) => {
  const selectors = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']
  selectors.forEach((selector) => applyFont(editor, selector, font))
}

const handleSave = () => {
  const editor = editorRef.value
  if (!editor) return
  if (pendingBodyFont.value) {
    applyFont(editor, 'body', pendingBodyFont.value)
    const bodyEl = editor.Canvas?.getBody?.()
    if (bodyEl) bodyEl.style.fontFamily = pendingBodyFont.value
    bodyFont.value = pendingBodyFont.value
  }
  if (pendingHeadingFont.value) {
    applyHeadings(editor, pendingHeadingFont.value)
    headingFont.value = pendingHeadingFont.value
  }
}
</script>

<template>
  <div class="p-3 space-y-4">
    <div>
      <div class="text-xs font-medium text-gray-600 mb-2">全局字体 - 文本</div>
      <el-select v-model="pendingBodyFont" class="w-full" size="small" placeholder="选择字体">
        <el-option v-for="opt in fontOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
      </el-select>
    </div>
    <div>
      <div class="text-xs font-medium text-gray-600 mb-2">全局字体 - 标题 (H1-H6)</div>
      <el-select v-model="pendingHeadingFont" class="w-full" size="small" placeholder="选择字体">
        <el-option v-for="opt in fontOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
      </el-select>
    </div>
    <div class="pt-2">
      <el-button type="primary" size="small" @click="handleSave">保存</el-button>
    </div>
  </div>
</template>
