import '@testing-library/jest-dom'

// jsdom neimplementuje matchMedia. Aplikace ho používá pro responzivní
// výchozí stavy (sbalené hero na mobilu), takže bez téhle náhrady by testy
// padaly na chybějícím API prohlížeče, ne na chybě v kódu.
// Výchozí odpověď je "neshoduje se", takže testy běží v desktopové větvi.
if (!window.matchMedia) {
  window.matchMedia = (query: string): MediaQueryList =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList;
}
