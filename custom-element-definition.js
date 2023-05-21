
import { importHTMLModule } from './html-module.js';

const ceDefinitions = document.querySelectorAll('definition');
const modulePromises = [...ceDefinitions].map(def => {
  return importHTMLModule(def.getAttribute('src'));
});

Promise.all(modulePromises).then(modules => {

  for (let [i, mod] of modules.entries()) {

    const template = document.createElement('template');
    template.content.append(
      ...mod.document.head.childNodes,
      ...mod.document.body.childNodes,
    );

    const name = ceDefinitions[i].getAttribute('name');
    if (name) {

      if (!customElements.get(name)) {
        customElements.define(name, class extends (mod.default ?? HTMLElement) {
          static observedAttributes = super.observedAttributes;

          constructor() {
            super();

            if (!this.shadowRoot) {
              this.attachShadow({ mode: 'open' });
              this.shadowRoot.append(template.content.cloneNode(true));
            }
          }

          connectedCallback() {
            super.connectedCallback?.();
          }

          disconnectedCallback() {
            super.disconnectedCallback?.();
          }

          attributeChangedCallback(name, oldVal, newVal) {
            super.attributeChangedCallback?.(name, oldVal, newVal);
          }
        });
      }
    }

  }
});
