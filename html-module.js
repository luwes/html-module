
const baseUrl = location.href.replace(/[^/]*$/, '');
const requestQueue = [];
const htmlModuleRequests = {};
const scriptUrlToModule = {};

globalThis.getCurrentHtmlModule = getCurrentHtmlModule;
globalThis.importHTMLModule = importHTMLModule;

importHTMLModules(document);

export function getCurrentHtmlModule(scriptUrl) {
  return scriptUrlToModule[scriptUrl ?? document.currentScript.src];
}

export async function importHTMLModules(doc) {
  doc.querySelectorAll('link[import],link[export]')
    .forEach(link => importHTMLModule(link.href));
}

export async function importHTMLModule(url) {
  const urlObj = new URL(url, baseUrl);

  let cacheUrl = new URL(urlObj);
  cacheUrl.search = '';
  cacheUrl.hash = '';
  cacheUrl = String(cacheUrl);

  const cached = htmlModuleRequests[cacheUrl];
  if (cached) return cached;

  return (htmlModuleRequests[cacheUrl] = new Promise((resolve, reject) => {
    const request = fetch(String(urlObj)).then(r => r.text());
    requestQueue.push({ request, resolve, reject });
    processQueue(requestQueue, processRequestQueue);
  }));
}

async function processRequestQueue(moduleInfo) {
  const { request, resolve, reject } = moduleInfo;

  try {
    const html = await request;

    const htmlModule = Object.create(null, {
      [Symbol.toStringTag]: { get: () => 'HTMLModule' },
      toString: { value: Object.prototype.toString },
    });

    // Create a document from the fetched HTML.
    const doc = new DOMParser().parseFromString(html, 'text/html');
    htmlModule.document = doc;

    for (let submodule of doc.querySelectorAll('link[rel="preload"],script[type="module"][src]')) {
      if (submodule.rel) {
        document.head.append(submodule.cloneNode(true));
      } else {
        modulePreload(submodule.src);
      }
    }

    // Create an ESM module from the inline script elements and
    // save the script url to module map entry.
    for (let submodule of doc.querySelectorAll('link[import],link[export],script')) {
      const isScript = submodule.localName === 'script';
      let src = submodule.src ?? submodule.href;

      // Classic script tag
      if (isScript && !submodule.type) {
        if (src) {
          await addScript(src);
        } else {
          addInlineScript(submodule.textContent);
        }
        continue;
      }

      if (!src) {
        const scriptBlob = new Blob(
          [ replaceImport(submodule.textContent, baseUrl) ],
          { type: 'text/javascript' }
        );
        src = URL.createObjectURL(scriptBlob);
      }

      scriptUrlToModule[src] = htmlModule;
      const namedExports = await (isScript ? import(src) : importHTMLModule(src));

      const exportName = submodule.getAttribute('export');

      if (exportName === 'default') {

        Object.assign(htmlModule, namedExports);

      } else if (exportName) {

        htmlModule[exportName] = namedExports;
      }
    }

    resolve(Object.seal(htmlModule));

  } catch (error) {

    reject(error);
  }
}

function modulePreload(url) {
  const preloadLink = document.createElement('link');
  preloadLink.href = url;
  preloadLink.rel = 'modulepreload';
  document.head.append(preloadLink);
}

function addScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.onload = resolve;
    script.onerror = reject;
    script.src = src;
    document.head.appendChild(script);
  });
}

function addInlineScript(textContent) {
  const script = document.createElement('script');
  script.textContent = textContent;
  document.head.appendChild(script);
}

function replaceImport(code, baseUrl) {
  const importExp = /^(\s*import\s+[\s\S]*?from\s*)(['"`])([\s\S]*?)(\2)/g;
  return code.replace(importExp, (a, b, c, d, e) => {
    return `${b}${c}${baseUrl}${d}${e}`;
  });
}

async function processQueue(queue, callback) {
  let item;
  while ((item = queue.shift())) {
    await callback(item);
  }
}
