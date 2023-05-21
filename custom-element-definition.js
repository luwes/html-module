
import { importHTMLModule } from './html-module.js';

const ceDefinitions = document.querySelectorAll('link[rel="preload"][definition]');
const modulePromises = [...ceDefinitions].map(link => importHTMLModule(link.href));

Promise.all(modulePromises).then(modules => {

  for (let [i, mod] of modules.entries()) {

    const template = document.createElement('template');
    template.content.append(
      ...mod.document.head.childNodes,
      ...mod.document.body.childNodes,
    );

    const name = ceDefinitions[i].getAttribute('definition');
    if (name) {

      if (!customElements.get(name)) {
        customElements.define(name, class extends HTMLElement {
          static observedAttributes = mod.observedAttributes;

          constructor() {
            super();

            if (!this.shadowRoot) {
              this.attachShadow({ mode: 'open' });
              this.shadowRoot.appendChild(template.content.cloneNode(true));
            }
          }

          connectedCallback() {
            mod.connectedCallback?.();
          }

          disconnectedCallback() {
            mod.disconnectedCallback?.();
          }

          attributeChangedCallback(name, oldVal, newVal) {
            mod.attributeChangedCallback?.(name, oldVal, newVal);
          }
        });
      }
    }

  }
});
