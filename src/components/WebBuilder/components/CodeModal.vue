<script lang="ts" setup>
import { ref, watch, nextTick, computed } from 'vue'
import { ElDialog, ElTabs, ElTabPane, ElButton } from 'element-plus'
import { codeToHtml } from 'shiki'

const props = defineProps<{
  modelValue: boolean
  html: string
  css: string
  js: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'save', data: { html: string; css: string; js: string }): void
}>()

const activeTab = ref('html')
const htmlCode = ref('')
const cssCode = ref('')
const jsCode = ref('')

const htmlRef = ref<HTMLElement | null>(null)
const cssRef = ref<HTMLElement | null>(null)
const jsRef = ref<HTMLElement | null>(null)
const htmlTextareaRef = ref<HTMLTextAreaElement | null>(null)
const cssTextareaRef = ref<HTMLTextAreaElement | null>(null)
const jsTextareaRef = ref<HTMLTextAreaElement | null>(null)
const htmlPreviewRef = ref<HTMLElement | null>(null)
const cssPreviewRef = ref<HTMLElement | null>(null)
const jsPreviewRef = ref<HTMLElement | null>(null)

const visible = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value),
})

watch(
  () => props.modelValue,
  async (val) => {
    if (val) {
      htmlCode.value = props.html
      cssCode.value = props.css
      jsCode.value = props.js
      await nextTick()
      await highlightCode()
      syncScroll(htmlTextareaRef.value, htmlPreviewRef.value)
      syncScroll(cssTextareaRef.value, cssPreviewRef.value)
      syncScroll(jsTextareaRef.value, jsPreviewRef.value)
    }
  },
  { immediate: true },
)

watch([htmlCode, cssCode, jsCode], () => {
  nextTick(() => {
    highlightCode()
  })
})

const highlightCode = async () => {
  try {
    if (htmlRef.value) {
      const html = await codeToHtml(htmlCode.value, {
        lang: 'html',
        theme: 'github-dark',
      })
      htmlRef.value.innerHTML = html
    }
    if (cssRef.value) {
      const css = await codeToHtml(cssCode.value, {
        lang: 'css',
        theme: 'github-dark',
      })
      cssRef.value.innerHTML = css
    }
    if (jsRef.value) {
      const js = await codeToHtml(jsCode.value, {
        lang: 'javascript',
        theme: 'github-dark',
      })
      jsRef.value.innerHTML = js
    }
  } catch (error) {
    console.error('[CodeModal] Error highlighting code:', error)
  }
}

const handleSave = () => {
  emit('save', {
    html: htmlCode.value,
    css: cssCode.value,
    js: jsCode.value,
  })
  visible.value = false
}

const syncScroll = (textarea: HTMLTextAreaElement | null, preview: HTMLElement | null) => {
  if (!textarea || !preview) return

  let isScrolling = false

  textarea.addEventListener('scroll', () => {
    if (isScrolling) return
    isScrolling = true
    preview.scrollTop = textarea.scrollTop
    preview.scrollLeft = textarea.scrollLeft
    requestAnimationFrame(() => {
      isScrolling = false
    })
  })

  preview.addEventListener('scroll', () => {
    if (isScrolling) return
    isScrolling = true
    textarea.scrollTop = preview.scrollTop
    textarea.scrollLeft = preview.scrollLeft
    requestAnimationFrame(() => {
      isScrolling = false
    })
  })
}
</script>

<template>
  <div class="code-modal">
    <ElDialog
      v-model="visible"
      width="80%"
      :showClose="false"
      :title="''"
      :append-to-body="false"
      align-center
      :close-on-click-modal="false"
      class=""
    >
      <ElTabs v-model="activeTab" class="code-tabs">
        <ElTabPane label="HTML" name="html">
          <div class="code-editor-wrapper h-[60vh]">
            <pre
              ref="htmlPreviewRef"
              class="h-full"
            ><code ref="htmlRef" class="language-html"></code></pre>
          </div>
        </ElTabPane>
        <ElTabPane label="CSS" name="css">
          <div class="code-editor-wrapper h-[60vh]">
            <textarea
              ref="cssTextareaRef"
              v-model="cssCode"
              class="code-textarea"
              placeholder="CSS 代码..."
              spellcheck="false"
            ></textarea>
            <pre
              ref="cssPreviewRef"
              class="code-preview h-full"
            ><code ref="cssRef" class="language-css"></code></pre>
          </div>
        </ElTabPane>
        <ElTabPane label="JavaScript" name="js">
          <div class="code-editor-wrapper h-[60vh]">
            <textarea
              ref="jsTextareaRef"
              v-model="jsCode"
              class="code-textarea"
              placeholder="JavaScript 代码..."
              spellcheck="false"
            ></textarea>
            <pre
              ref="jsPreviewRef"
              class="code-preview h-full"
            ><code ref="jsRef" class="language-javascript"></code></pre>
          </div>
        </ElTabPane>
      </ElTabs>
      <template #footer>
        <div class="flex justify-end p-4">
          <ElButton size="large" class="min-w-28" @click="visible = false">Cancel</ElButton>
          <ElButton size="large" color="#2251FF" class="min-w-28" @click="handleSave">Save</ElButton>
        </div>
      </template>
    </ElDialog>
  </div>
</template>

<style lang="scss" scoped>
:deep(.el-dialog) {
  background-color: #1E1E1E;
  padding: 0;
  .el-dialog__header{
    padding: 0;
  }
  .el-tabs__nav{
    float: none;
    justify-content: center;
  }
  .el-tabs__item{
    color: #ffffff;
    font-weight: 400;
    &.is-active{
      color: #2251FF;
    }
  }
  .el-tabs__nav-wrap:after{
    height: 1px;
    background-color: #ffffff29;
  }
  .el-tabs__active-bar{
    background-color: #2251FF;
  }
  .el-dialog__footer{
    padding-top: 0;
  }
  .el-tabs__header{
    margin-bottom: 0;
  }
  .el-tabs__content{
    //padding-inline: 15px;
  }
}
:deep(.shiki) {
  overflow: auto;
  height: 100%;
  padding: 20px;
}
</style>
