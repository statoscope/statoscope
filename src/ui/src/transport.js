// in PROD mode UI is distributed as `script` and sandbox add rempl to global
// in DEV mode UI is distributed as `url` and we need include a rempl script
/** @cut */ var rempl = require('../../../node_modules/rempl/dist/rempl.js');

module.exports = {
    api: rempl.getSubscriber(),
    editorEnv: rempl.getEnv('editor'),
    openInEditor: function(path) {
        if (!this.api) {
            return;
        }

        this.api.callRemote('openInEditor', path, function(result) {
            if (!result.ok) {
                if (result.error) {
                    alert(result.error);
                } else {
                    alert('Unknown error while opening in editor');
                }
            }
        });
    }
};
