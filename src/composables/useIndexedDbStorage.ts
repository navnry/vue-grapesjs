import { reactive } from 'vue'
import { getItem, setItem } from '@/utils/indexedDbStorage'

export default function useIndexedDbStorage(grapes: any) {
  if (grapes.initialized)
    throw new Error(
      'useIndexedDbStorage must be executed before GrapesJs is initialised (onMount where useGrapes is executed)'
    )

  if (!grapes._cache.indexedDbStorage) {
    grapes.config.storageManager = {
      type: 'indexeddb',
      id: 'gjsProject',
      autosave: true,
      autoload: true,
      stepsBeforeSave: 1,
    }

    const storage = (grapes._cache.indexedDbStorage = reactive({}))

    grapes.onInit((editor: any) => {
      const key = grapes.config.storageManager?.id || 'gjsProject'
      editor.StorageManager.add('indexeddb', {
        async load(keys: string[], clb: (data: Record<string, any>) => void, clbErr?: (err: any) => void) {
          try {
            const data = await getItem(key)
            const result: Record<string, any> = {}
            keys.forEach((k) => {
              if (data && data[k] != null) result[k] = data[k]
            })
            clb(result)
          } catch (err) {
            if (clbErr) clbErr(err)
          }
        },
        async store(data: Record<string, any>, clb: () => void, clbErr?: (err: any) => void) {
          try {
            await setItem(key, data)
            clb()
          } catch (err) {
            if (clbErr) clbErr(err)
          }
        },
      })

      editor.StorageManager.setCurrent('indexeddb')
      editor.load()

      let storeTimer: number | null = null
      const scheduleStore = () => {
        if (storeTimer) window.clearTimeout(storeTimer)
        storeTimer = window.setTimeout(() => {
          editor.store()
        }, 500)
      }

      editor.on('update', scheduleStore)
      editor.on('component:update', scheduleStore)
      editor.on('asset:update', scheduleStore)
    })

    return storage
  }

  return grapes._cache.indexedDbStorage
}
