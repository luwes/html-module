# HTML Module

**npm**: `npm i html-modul`  
**cdn**: https://cdn.jsdelivr.net/npm/html-modul

Implementation of how native HTML modules could work.
Based on discussions at [HTML Modules](https://github.com/WICG/webcomponents/issues/645).


```html
<!-- index.html -->
<script type="module" src="https://cdn.jsdelivr.net/npm/html-modul"></script>

<!-- import via link, runs scripts in HTML module -->
<link rel="preload" href="./counter.html" as="fetch" crossorigin>
<link rel="html-module" href="./counter.html">

<!-- OR -->

<!-- import via script -->
<script type="module">
  const counterModule = await importHTMLModule('./counter.html');
  console.log(counterModule.document);
  console.log(counterModule.counter.default);
</script>

<w-counter count="0"></w-counter>
```

```html
<!-- counter.html -->
<script type="module" export="counter">
  const htmlModule = getCurrentHtmlModule(import.meta.url);
  const currentDocument = htmlModule.document ?? document;

  const template = currentDocument.querySelector('template');
  
  // rest of code...
  
  export default WCounter;
</script>

<template>
  <button>+</button>
  <div>0</div>
  <button>-</button>
</template>
```


## Related

- [HTML Modules issue](https://github.com/WICG/webcomponents/issues/645)
- [importAs and HTML modules](https://github.com/AshleyScirra/import-as-and-html-modules)
