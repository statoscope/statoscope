module.exports = {
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
