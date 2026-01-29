const navbarHtml = `
  <div class="fo-navbar__inner">
    <div class="fo-navbar__logo">
      <span class="fo-logo-mark">FOCA</span>
    </div>
    <nav class="fo-navbar__menu">
      <ul class="fo-navbar__menu-list">
        <li class="fo-menu-item has-mega">
          <a class="fo-menu-link" href="#">Solution</a>
          <div class="fo-mega">
            <div class="fo-mega__list">
              <a href="#" class="fo-mega__item">Public & Commercial Buildings</a>
              <a href="#" class="fo-mega__item">High-end Residences & Real Estate</a>
              <a href="#" class="fo-mega__item">Healthcare & Wellness Spaces</a>
              <a href="#" class="fo-mega__item">Hotels & Resorts</a>
              <a href="#" class="fo-mega__item">Customization</a>
            </div>
            <div class="fo-mega__media">
              <img
                src="https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=900&q=60"
                alt="Mega menu preview"
              />
            </div>
          </div>
        </li>
        <li class="fo-menu-item has-dropdown">
          <a class="fo-menu-link" href="#">Product</a>
          <ul class="fo-dropdown">
            <li><a href="#" class="fo-dropdown__item">Series A</a></li>
            <li><a href="#" class="fo-dropdown__item">Series B</a></li>
            <li><a href="#" class="fo-dropdown__item">Series C</a></li>
          </ul>
        </li>
        <li class="fo-menu-item"><a class="fo-menu-link" href="#">Case</a></li>
        <li class="fo-menu-item"><a class="fo-menu-link" href="#">Support</a></li>
        <li class="fo-menu-item"><a class="fo-menu-link" href="#">About</a></li>
        <li class="fo-menu-item"><a class="fo-menu-link" href="#">Partnership</a></li>
      </ul>
    </nav>
    <div class="fo-navbar__actions">
      <button class="fo-action-btn" aria-label="Search">
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M11 3a8 8 0 1 0 4.9 14.3l4.4 4.4 1.4-1.4-4.4-4.4A8 8 0 0 0 11 3zm0 2a6 6 0 1 1 0 12 6 6 0 0 1 0-12z"/>
        </svg>
      </button>
      <details class="fo-mobile">
        <summary class="fo-navbar__toggle" aria-label="Open menu">
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M4 7h16v2H4V7zm0 5h16v2H4v-2zm0 5h16v2H4v-2z"/>
          </svg>
        </summary>
        <div class="fo-mobile__drawer">
          <a href="#">Solution</a>
          <a href="#">Product</a>
          <a href="#">Case</a>
          <a href="#">Support</a>
          <a href="#">About</a>
          <a href="#">Partnership</a>
        </div>
      </details>
    </div>
  </div>
`

const navbarCss = `
.fo-navbar {
  background: rgba(8, 34, 52, 1);
  color: #fff;
  font-family: "Inter", system-ui, -apple-system, sans-serif;
  position: relative;
}
.fo-navbar__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding: 18px 40px;
}
.fo-navbar__logo {
  display: flex;
  align-items: center;
  font-weight: 700;
  letter-spacing: 2px;
}
.fo-logo-mark {
  font-size: 20px;
}
.fo-navbar__menu {
  flex: 1;
}
.fo-navbar__menu-list {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 28px;
  list-style: none;
  margin: 0;
  padding: 0;
}
.fo-menu-link {
  color: #fff;
  text-decoration: none;
  font-size: 14px;
  letter-spacing: 0.3px;
}
.fo-menu-item {
  position: relative;
}
.fo-menu-item.has-dropdown:hover .fo-dropdown,
.fo-menu-item.has-mega:hover .fo-mega {
  opacity: 1;
  pointer-events: auto;
  transform: translateY(0);
}
.fo-dropdown {
  position: absolute;
  top: 36px;
  left: 0;
  background: #fff;
  color: #0d1f2d;
  padding: 12px 0;
  border-radius: 8px;
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.12);
  min-width: 180px;
  list-style: none;
  margin: 0;
  opacity: 0;
  pointer-events: none;
  transform: translateY(8px);
  transition: 0.2s ease;
  z-index: 10;
}
.fo-dropdown__item {
  display: block;
  padding: 10px 16px;
  color: inherit;
  text-decoration: none;
}
.fo-dropdown__item:hover {
  background: rgba(8, 34, 52, 0.08);
}
.fo-mega {
  position: absolute;
  top: 44px;
  left: 50%;
  transform: translate(-50%, 8px);
  width: min(980px, 90vw);
  background: #fff;
  color: #0d1f2d;
  border-radius: 12px;
  padding: 28px;
  display: grid;
  grid-template-columns: 1.1fr 1fr;
  gap: 24px;
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.15);
  opacity: 0;
  pointer-events: none;
  transition: 0.2s ease;
  z-index: 10;
}
.fo-mega__list {
  display: grid;
  gap: 14px;
  font-size: 18px;
  font-weight: 600;
}
.fo-mega__item {
  color: inherit;
  text-decoration: none;
}
.fo-mega__item:hover {
  color: rgba(8, 34, 52, 0.7);
}
.fo-mega__media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 10px;
}
.fo-navbar__actions {
  display: flex;
  align-items: center;
  gap: 12px;
}
.fo-action-btn,
.fo-navbar__toggle {
  width: 36px;
  height: 36px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: #fff;
  border-radius: 999px;
  cursor: pointer;
}
.fo-action-btn svg,
.fo-navbar__toggle svg {
  width: 18px;
  height: 18px;
}
.fo-mobile {
  display: none;
}
.fo-mobile__drawer {
  position: absolute;
  right: 16px;
  top: 64px;
  background: #0b2a3c;
  border-radius: 12px;
  padding: 16px;
  display: grid;
  gap: 12px;
  min-width: 200px;
  box-shadow: 0 16px 32px rgba(0, 0, 0, 0.35);
}
.fo-mobile__drawer a {
  color: #fff;
  text-decoration: none;
}
.fo-mobile[open] .fo-navbar__toggle {
  background: rgba(255, 255, 255, 0.12);
}
@media (max-width: 900px) {
  .fo-navbar__menu {
    display: none;
  }
  .fo-mobile {
    display: block;
  }
}
`

const ensureNavbarStyles = (editor: any) => {
  if (!editor?.getCss) return
  const css = editor.getCss() || ''
  if (!css.includes('.fo-navbar')) {
    editor.addStyle(navbarCss)
  }
}

export const registerNavbarBlock = (editor: any) => {
  const typeId = 'fo-navbar'
  const domc = editor.DomComponents

  if (!domc.getType(typeId)) {
    domc.addType(typeId, {
      model: {
        defaults: {
          name: 'FOCA Navbar',
          tagName: 'header',
          classes: ['fo-navbar'],
          components: navbarHtml,
        },
      },
    })
  }

  editor.BlockManager.add(typeId, {
    label: 'Navbar (FOCA)',
    category: 'Custom',
    content: { type: typeId },
  })

  ensureNavbarStyles(editor)
  editor.on?.('load', () => ensureNavbarStyles(editor))
}
