
export default {
  bootstrap: () => import('./main.server.mjs').then(m => m.default),
  inlineCriticalCss: true,
  baseHref: '/<brivel-sport-website>/',
  locale: undefined,
  routes: [
  {
    "renderMode": 2,
    "route": "/%3Cbrivel-sport-website%3E"
  },
  {
    "renderMode": 2,
    "route": "/%3Cbrivel-sport-website%3E/services"
  },
  {
    "renderMode": 2,
    "route": "/%3Cbrivel-sport-website%3E/cars"
  },
  {
    "renderMode": 2,
    "route": "/%3Cbrivel-sport-website%3E/contact"
  },
  {
    "renderMode": 2,
    "redirectTo": "/%3Cbrivel-sport-website%3E",
    "route": "/%3Cbrivel-sport-website%3E/**"
  }
],
  entryPointToBrowserMapping: undefined,
  assets: {
    'index.csr.html': {size: 11609, hash: '540fec128be0080501e119482981c71876ae78191fa46ef2362ec99e15101dfd', text: () => import('./assets-chunks/index_csr_html.mjs').then(m => m.default)},
    'index.server.html': {size: 976, hash: 'e4adb4a0da68938938949db1543f667f5f34667342e8096b98af2fe1d6a0c268', text: () => import('./assets-chunks/index_server_html.mjs').then(m => m.default)},
    'styles-HCVWSJHO.css': {size: 11463, hash: 'DcT3Ut6Jrl0', text: () => import('./assets-chunks/styles-HCVWSJHO_css.mjs').then(m => m.default)}
  },
};
