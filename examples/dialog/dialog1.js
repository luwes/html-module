
// Determine associated HTML module using global method getCurrentHtmlModule().
// This lets us access DOM elements like the <dialog> we are interested in.
const htmlModule = globalThis.getCurrentHtmlModule(import.meta.url);
const currentDocument = htmlModule.document ?? document;

const dialogElem = currentDocument.getElementById('dialog1');
const Dialog2 = htmlModule.dialog2.default;

// When the dialog is closed, append it back to the original document. This
// removes it from the main document so it does not clutter up its DOM.
dialogElem.addEventListener('close', () => {
	currentDocument.body.appendChild(dialogElem);
});

// Handle open and close buttons.
const closeButton = dialogElem.querySelector('.close');
closeButton.addEventListener('click', () => Dialog1.hide());

const dialog2Button = dialogElem.querySelector('.dialog2');
dialog2Button.addEventListener('click', () => Dialog2.show());

// Export the dialog class with some methods to hide and show it.
export default class Dialog1 {
	static show() {
		// Dialogs can't be shown unless they are in the main document, so transfer
		// the <dialog> tag to the main document before calling showModal().
		// It's transferred back in the 'close' event.
		document.body.appendChild(dialogElem);
		dialogElem.showModal();
	}
	
	static hide() {
		dialogElem.close();
	}
}
