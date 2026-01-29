import { reactive } from 'vue'
import reactiveCollection from '../utils/reactiveCollection'
import reactiveModel from '../utils/reactiveModel'

/**
 * Reactive representation of the GrapesJS pages state
 * @typedef ReactivePages
 * @memberof module:usePages
 * @inner
 * @property {Object[]} pages A reactive list of all pages
 * @property {Object} selected The currently selected page
 * @property {Function} select Select page
 * @property {Function} add Add page
 * @property {Function} remove Remove page
 */

/**
 * Provide reactive object that contains the state of the GrapesJs pages.
 * @exports usePages
 * @param {VGCconfig} grapes Response of useGrapes
 * @returns {module:usePages~ReactivePages}
 */
export default function usePages(grapes: any) {
  if (!grapes._cache.pages) {
    const pm = (grapes._cache.pages = reactive({
      pages: [] as any[],
      selected: {} as any,
      select() {},
      add() {},
      remove() {},
    }))

    grapes.onInit((editor: any) => {
      pm.select = editor.Pages.select.bind(editor.Pages)
      pm.add = editor.Pages.add.bind(editor.Pages)
      pm.remove = editor.Pages.remove.bind(editor.Pages)

      function updateSelected(page: any) {
        if (pm.selected._decouple) pm.selected._decouple()
        if (!page || typeof page.get !== 'function' || !page.attributes) {
          pm.selected = page ?? {}
          return
        }
        pm.selected = reactiveModel(page)
      }

      pm.pages = reactiveCollection(editor.Pages.getAll())
      updateSelected(editor.Pages.getSelected())

      const refreshPages = () => {
        pm.pages = reactiveCollection(editor.Pages.getAll())
        updateSelected(editor.Pages.getSelected())
      }

      editor.on('page', refreshPages)
    })
  }

  return grapes._cache.pages
}
