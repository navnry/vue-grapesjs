export type PageSettings = {
  id: string
  name: string
  slug: string
  tdkTitle: string
  tdkDescription: string
  tdkKeywords: string
  customHead: string
  customBody: string
}

export const getPageSettingsFromPage = (page: any): PageSettings => {
  const custom = page?.get?.('custom') ?? page?.custom ?? {}
  const tdk = custom.tdk ?? {}

  return {
    id: page?.get?.('id') ?? page?.id ?? '',
    name: page?.get?.('name') ?? page?.name ?? '',
    slug: page?.get?.('slug') ?? page?.slug ?? custom.slug ?? '',
    tdkTitle: custom.tdkTitle ?? tdk.title ?? '',
    tdkDescription: custom.tdkDescription ?? tdk.description ?? '',
    tdkKeywords: custom.tdkKeywords ?? tdk.keywords ?? '',
    customHead: custom.customHead ?? custom.head ?? '',
    customBody: custom.customBody ?? custom.body ?? '',
  }
}

export const applyPageSettingsToPage = (page: any, settings: PageSettings) => {
  const custom = page?.get?.('custom') ?? page?.custom ?? {}
  const nextCustom = {
    ...custom,
    slug: settings.slug,
    tdkTitle: settings.tdkTitle,
    tdkDescription: settings.tdkDescription,
    tdkKeywords: settings.tdkKeywords,
    customHead: settings.customHead,
    customBody: settings.customBody,
  }

  if (page?.set) {
    page.set('name', settings.name)
    page.set('slug', settings.slug)
    page.set('custom', nextCustom)
  } else if (page?.name !== undefined) {
    page.name = settings.name
    page.slug = settings.slug
    page.custom = nextCustom
  }
}
