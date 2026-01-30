import { ref } from 'vue'

/**
 * Hook for managing code editor (HTML/CSS/JS)
 */
export default function useCodeEditor(grapes: any) {
  const editorRef = ref<any>(null)
  const html = ref('')
  const css = ref('')
  const js = ref('')

  const refreshCode = () => {
    const editor = editorRef.value
    if (!editor) return
    
    try {
      const page = editor.Pages?.getSelected?.()
      const component = page?.getMainComponent?.()
      html.value = component ? editor.getHtml({ component }) : editor.getHtml()
      css.value = component ? editor.getCss({ component }) : editor.getCss()
      js.value = editor.getJs() || ''
    } catch (error) {
      console.warn('[useCodeEditor] Error refreshing code:', error)
    }
  }

  const updateCode = (type: 'html' | 'css' | 'js', value: string) => {
    const editor = editorRef.value
    if (!editor) return
    
    try {
      if (type === 'html') {
        editor.setComponents(value)
        html.value = value
      } else if (type === 'css') {
        editor.setStyle(value)
        css.value = value
      } else if (type === 'js') {
        editor.setJs(value)
        js.value = value
      }
    } catch (error) {
      console.error('[useCodeEditor] Error updating code:', error)
    }
  }

  grapes.onInit((editor: any) => {
    editorRef.value = editor
    refreshCode()
  })

  return {
    html,
    css,
    js,
    updateCode,
    refreshCode,
  }
}
