// in PROD mode UI is distributed as `script` and sandbox add rempl to global
// in DEV mode UI is distributed as `url` and we need include a rempl script
if (process.env.NODE_ENV === 'development') {
  window.rempl = require('rempl/dist/rempl.js');
}

const api = rempl.getSubscriber();
const openInEditor = path => {
  if (!api) {
    return;
  }

  api.callRemote('openInEditor', path, function (result) {
    if (!result.ok) {
      if (result.error) {
        alert(result.error);
      } else {
        alert('Unknown error while opening in editor');
      }
    }
  });
};

export default api;
export { openInEditor };
