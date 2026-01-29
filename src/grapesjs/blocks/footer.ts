const footerHtml = `
  <footer class="fo-footer">
    <div class="fo-footer__inner">
      <div class="fo-footer__brand">
        <div class="fo-footer__logo">FOCA</div>
        <p class="fo-footer__tagline">
          Sustainable by Design, Artisan-Crafted for the Bathroom of Tomorrow.
        </p>
        <div class="fo-footer__divider"></div>
        <div class="fo-footer__contact">
          <div>Email: info@foca.com</div>
          <div>Tel: +86 18355248224</div>
          <div>Address: 2407 Chico Ave, Unit A, Building 9, CCC 91733</div>
        </div>
        <div class="fo-footer__socials">
          <a href="#" aria-label="Facebook">f</a>
          <a href="#" aria-label="Twitter">t</a>
          <a href="#" aria-label="Instagram">in</a>
          <a href="#" aria-label="LinkedIn">in</a>
        </div>
      </div>
      <div class="fo-footer__columns">
        <div class="fo-footer__col">
          <h4>Service</h4>
          <a href="#">Solutions</a>
          <a href="#">Products</a>
          <a href="#">Cases</a>
          <a href="#">Customization</a>
        </div>
        <div class="fo-footer__col">
          <h4>Support</h4>
          <a href="#">Partnerships</a>
          <a href="#">Technical Support</a>
          <a href="#">FAQs</a>
          <a href="#">Contact us</a>
          <a href="#">Blog</a>
        </div>
        <div class="fo-footer__col">
          <h4>About</h4>
          <a href="#">About FOCA</a>
          <a href="#">Company Structure</a>
          <a href="#">FOCA Team</a>
          <a href="#">Location</a>
        </div>
      </div>
    </div>
    <div class="fo-footer__bottom">
      <span>© 2025 Foca. All rights reserved. Designed and developed by toototech.</span>
      <div class="fo-footer__links">
        <a href="#">Terms & Conditions</a>
        <a href="#">Privacy Policy</a>
      </div>
    </div>
  </footer>
`

const footerCss = `
.fo-footer {
  background: #083453;
  color: #cbd7e2;
  font-family: "Inter", system-ui, -apple-system, sans-serif;
}
.fo-footer__inner {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 48px;
  padding: 48px 72px 32px;
}
.fo-footer__logo {
  font-size: 32px;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 8px;
}
.fo-footer__tagline {
  font-size: 14px;
  margin: 0 0 20px;
  color: rgba(255, 255, 255, 0.7);
}
.fo-footer__divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.15);
  margin: 16px 0 20px;
}
.fo-footer__contact {
  display: grid;
  gap: 10px;
  font-size: 14px;
}
.fo-footer__socials {
  display: flex;
  gap: 12px;
  margin-top: 16px;
}
.fo-footer__socials a {
  width: 32px;
  height: 32px;
  border-radius: 999px;
  background: #ffffff;
  color: #083453;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  font-weight: 700;
}
.fo-footer__columns {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 32px;
}
.fo-footer__col h4 {
  margin: 0 0 16px;
  font-size: 18px;
  color: #ffffff;
}
.fo-footer__col a {
  display: block;
  color: #cbd7e2;
  text-decoration: none;
  margin-bottom: 10px;
}
.fo-footer__bottom {
  border-top: 1px solid rgba(255, 255, 255, 0.15);
  padding: 20px 72px 26px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6);
}
.fo-footer__links {
  display: flex;
  gap: 24px;
}
.fo-footer__links a {
  color: inherit;
  text-decoration: none;
}
@media (max-width: 900px) {
  .fo-footer__inner {
    grid-template-columns: 1fr;
    padding: 40px 24px 24px;
  }
  .fo-footer__columns {
    grid-template-columns: 1fr;
  }
  .fo-footer__bottom {
    flex-direction: column;
    gap: 12px;
    padding: 20px 24px 24px;
    align-items: flex-start;
  }
}
`

const ensureFooterStyles = (editor: any) => {
  if (!editor?.getCss) return
  const css = editor.getCss() || ''
  if (!css.includes('.fo-footer')) {
    editor.addStyle(footerCss)
  }
}

export const registerFooterBlock = (editor: any) => {
  const typeId = 'fo-footer'
  const domc = editor.DomComponents

  if (!domc.getType(typeId)) {
    domc.addType(typeId, {
      model: {
        defaults: {
          name: 'FOCA Footer',
          tagName: 'footer',
          classes: ['fo-footer'],
          components: footerHtml,
        },
      },
    })
  }

  editor.BlockManager.add(typeId, {
    label: 'Footer (FOCA)',
    category: 'Custom',
    content: { type: typeId },
  })

  ensureFooterStyles(editor)
  editor.on?.('load', () => ensureFooterStyles(editor))
}
