<script lang="ts" setup>
import { ref, watch, nextTick, computed, onMounted, onBeforeUnmount } from 'vue'
import { ElDialog, ElTabs, ElTabPane, ElButton } from 'element-plus'
import { codeToHtml } from 'shiki'
import loader from '@monaco-editor/loader'
import type { editor } from 'monaco-editor'

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

const htmlEditorRef = ref<HTMLElement | null>(null)
const cssEditorRef = ref<HTMLElement | null>(null)
const jsEditorRef = ref<HTMLElement | null>(null)
const jsMonacoContainerRef = ref<HTMLElement | null>(null)
let jsMonacoEditor: editor.IStandaloneCodeEditor | null = null

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
      await initMonacoEditor()
    }
  },
  { immediate: true },
)

watch([htmlCode, cssCode], () => {
  nextTick(() => {
    highlightCode()
  })
})

watch(jsCode, (newValue) => {
  if (jsMonacoEditor && jsMonacoEditor.getValue() !== newValue) {
    jsMonacoEditor.setValue(newValue)
  }
})

watch(activeTab, async (newTab) => {
  if (newTab === 'js') {
    await nextTick()
    await initMonacoEditor()
  }
})

const highlightCode = async () => {
  try {
    if (htmlEditorRef.value) {
      const html = await codeToHtml(htmlCode.value || '', {
        lang: 'html',
        theme: 'github-light',
      })
      const wasFocused = document.activeElement === htmlEditorRef.value
      const selection = saveSelection(htmlEditorRef.value)
      htmlEditorRef.value.innerHTML = html
      if (wasFocused) {
        restoreSelection(htmlEditorRef.value, selection)
      }
    }
    if (cssEditorRef.value) {
      const css = await codeToHtml(cssCode.value || '', {
        lang: 'css',
        theme: 'github-light',
      })
      const wasFocused = document.activeElement === cssEditorRef.value
      const selection = saveSelection(cssEditorRef.value)
      cssEditorRef.value.innerHTML = css
      if (wasFocused) {
        restoreSelection(cssEditorRef.value, selection)
      }
    }
    // JavaScript 使用 Monaco Editor，不需要 Shiki 高亮
  } catch (error) {
    console.error('[CodeModal] Error highlighting code:', error)
  }
}

const saveSelection = (containerEl: HTMLElement) => {
  const selection = window.getSelection()
  if (!selection || selection.rangeCount === 0) return null

  const range = selection.getRangeAt(0)
  if (!range || !containerEl.contains(range.commonAncestorContainer)) return null

  const preSelectionRange = range.cloneRange()
  preSelectionRange.selectNodeContents(containerEl)
  preSelectionRange.setEnd(range.startContainer, range.startOffset)
  const start = preSelectionRange.toString().length

  return {
    start,
    end: start + range.toString().length,
  }
}

const restoreSelection = (containerEl: HTMLElement, savedSel: { start: number; end: number } | null) => {
  if (!savedSel) return

  let nodeStack: Node[] = [containerEl]
  let node: Node | undefined
  let foundStart = false
  let stop = false
  let charCount = 0

  while (!stop && (node = nodeStack.pop())) {
    if (node.nodeType === Node.TEXT_NODE) {
      const nextCharCount = charCount + (node.textContent?.length || 0)
      if (!foundStart && savedSel.start >= charCount && savedSel.start <= nextCharCount) {
        const range = document.createRange()
        const sel = window.getSelection()
        range.setStart(node, savedSel.start - charCount)
        sel?.removeAllRanges()
        sel?.addRange(range)
        foundStart = true
      }
      if (foundStart && savedSel.end >= charCount && savedSel.end <= nextCharCount) {
        const range = window.getSelection()?.getRangeAt(0)
        if (range) {
          range.setEnd(node, savedSel.end - charCount)
          stop = true
        }
      }
      charCount = nextCharCount
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as Element
      let i = element.childNodes.length
      while (i--) {
        const childNode = element.childNodes[i]
        if (childNode) {
          nodeStack.push(childNode)
        }
      }
    }
  }
}

const handleInput = (event: Event, type: 'html' | 'css' | 'js') => {
  const target = event.target as HTMLElement
  const text = target.innerText || target.textContent || ''

  if (type === 'html') {
    htmlCode.value = text
  } else if (type === 'css') {
    cssCode.value = text
  } else if (type === 'js') {
    jsCode.value = text
  }

  nextTick(() => {
    highlightCode()
  })
}

const initMonacoEditor = async () => {
  if (!jsMonacoContainerRef.value || jsMonacoEditor) return

  try {
    const monaco = await loader.init()
    
    jsMonacoEditor = monaco.editor.create(jsMonacoContainerRef.value, {
      value: jsCode.value,
      language: 'javascript',
      theme: 'vs',
      automaticLayout: true,
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      wordWrap: 'on',
      fontSize: 14,
      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
      lineHeight: 1.5,
      suggestOnTriggerCharacters: true,
      quickSuggestions: {
        other: true,
        comments: true,
        strings: true,
      },
      acceptSuggestionOnCommitCharacter: true,
      acceptSuggestionOnEnter: 'on',
      tabCompletion: 'on',
      wordBasedSuggestions: 'allDocuments',
    })

    if (jsMonacoEditor) {
      jsMonacoEditor.onDidChangeModelContent(() => {
        if (jsMonacoEditor) {
          const value = jsMonacoEditor.getValue()
          if (jsCode.value !== value) {
            jsCode.value = value
          }
        }
      })
    }
  } catch (error) {
    console.error('[CodeModal] Error initializing Monaco Editor:', error)
  }
}

const handleSave = () => {
  // 从 Monaco Editor 获取最新值
  if (jsMonacoEditor) {
    jsCode.value = jsMonacoEditor.getValue()
  }
  
  emit('save', {
    html: htmlCode.value,
    css: cssCode.value,
    js: jsCode.value,
  })
  visible.value = false
}

onBeforeUnmount(() => {
  if (jsMonacoEditor) {
    jsMonacoEditor.dispose()
    jsMonacoEditor = null
  }
})

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
          <div
            ref="htmlEditorRef"
            contenteditable
            class="code-editor"
            @input="handleInput($event, 'html')"
            spellcheck="false"
          ></div>
        </ElTabPane>
        <ElTabPane label="CSS" name="css">
          <div
            ref="cssEditorRef"
            contenteditable
            class="code-editor"
            @input="handleInput($event, 'css')"
            spellcheck="false"
          ></div>
        </ElTabPane>
        <ElTabPane label="JavaScript" name="js">
          <div
            ref="jsMonacoContainerRef"
            class="monaco-editor-container"
          ></div>
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
  //background-color: #1E1E1E;
  padding: 0;
  .el-dialog__header{
    padding: 0;
  }
  .el-tabs__nav{
    float: none;
    justify-content: center;
  }
  .el-tabs__item{
    //color: #ffffff;
    font-weight: 400;
    &.is-active{
      color: #2251FF;
    }
  }
  .el-tabs__nav-wrap:after{
    height: 1px;
    //background-color: #ffffff29;
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
}
.code-editor {
  min-height: 60vh;
  max-height: 60vh;
  padding: 20px;
  overflow-x: hidden;
  overflow-y: auto;
  //background: #1E1E1E;
  border-radius: 4px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.5;
  font-weight: 300;
  white-space: pre-wrap;
  word-wrap: break-word;
  word-break: break-all;
  outline: none;
  scrollbar-width: none;
  -ms-overflow-style: none;
  caret-color: #333;
}

.code-editor::-webkit-scrollbar {
  display: none;
}

:deep(.shiki) {
  margin: 0;
  padding: 0;
  background: transparent !important;
  overflow: visible;
}

:deep(.shiki pre) {
  margin: 0;
  padding: 0;
  background: transparent !important;
  overflow: visible;
  white-space: pre-wrap;
  word-wrap: break-word;
  word-break: break-all;
}

:deep(.shiki code) {
  font-family: inherit;
  font-size: inherit;
  line-height: inherit;
  white-space: pre-wrap;
  word-wrap: break-word;
  word-break: break-all;
}

.monaco-editor-container {
  min-height: 60vh;
  max-height: 60vh;
  width: 100%;
}
</style>
