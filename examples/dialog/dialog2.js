const htmlModule = globalThis.getCurrentHtmlModule(import.meta.url);
const currentDocument = htmlModule.document ?? document;

const dialogElem = currentDocument.getElementById('dialog2');

dialogElem.addEventListener('close', () => {
  currentDocument.body.appendChild(dialogElem);
});

const closeButton = dialogElem.querySelector('.close');
closeButton.addEventListener('click', () => Dialog2.hide());

export default class Dialog2 {
  static show() {
    document.body.appendChild(dialogElem);
    dialogElem.showModal();
  }

  static hide() {
    dialogElem.close();
  }
}
