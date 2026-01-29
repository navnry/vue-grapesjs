export const collectUsedClasses = (editor: any) => {
  const classes = new Set<string>()

  const addClasses = (value?: string) => {
    if (!value) return
    value
      .split(/\s+/)
      .map((c) => c.trim())
      .filter(Boolean)
      .forEach((c) => classes.add(c))
  }

  const addFromHtml = (html?: string) => {
    if (!html) return
    const classAttrRegex = /class\s*=\s*["']([^"']+)["']/g
    let match: RegExpExecArray | null
    while ((match = classAttrRegex.exec(html))) {
      addClasses(match[1])
    }
  }

  const walk = (comp: any) => {
    if (!comp) return
    if (typeof comp.getClasses === 'function') {
      comp.getClasses().forEach((cls: any) => {
        const name = cls?.get?.('name') ?? cls?.name
        if (name) classes.add(name)
      })
    }
    if (typeof comp.getAttributes === 'function') {
      const attrs = comp.getAttributes()
      addClasses(attrs?.class)
    }
    const children = comp.get?.('components') ?? comp.components
    const list = Array.isArray(children?.models) ? children.models : children
    if (Array.isArray(list)) list.forEach(walk)
  }

  walk(editor?.getWrapper?.())

  // Fallback: extract classes from rendered HTML
  try {
    addFromHtml(editor?.getHtml?.())
  } catch {
    // noop
  }

  return Array.from(classes)
}

export const buildTailwindCss = async (classList: string[]) => {
  if (typeof window === 'undefined') {
    const [{ default: postcss }, { default: tailwindcss }, { default: autoprefixer }] =
      await Promise.all([import('postcss'), import('tailwindcss'), import('autoprefixer')])

    const raw = classList.map((cls) => `<div class="${cls}"></div>`).join('\n')
    const config = {
      content: [{ raw, extension: 'html' }],
      corePlugins: { preflight: false },
    }

    const input = '@tailwind utilities;'
    const result = await postcss([tailwindcss(config), autoprefixer]).process(input, {
      from: undefined,
    })

    return result.css
  }

  const res = await fetch('/api/tailwind', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ classes: classList }),
  })
  if (!res.ok) {
    throw new Error(`Tailwind API failed: ${res.status}`)
  }
  const data = await res.json()
  return data.css || ''
}
