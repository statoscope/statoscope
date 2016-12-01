var Value = require('basis.data').Value;
var EntityTable = require('../../modules/entityTable/index');

module.exports = EntityTable.subclass({
    init: function() {
        EntityTable.prototype.init.call(this);
        Value.query(this, 'delegate.data.profile').link(this, function(profile) {
            if (profile) {
                this.setChildNodes(profile.data.assets);
            }
        });
    }
});
