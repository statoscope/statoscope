var Value = require('basis.data').Value;
var LS_KEY_HIDE_3RD_PARTY_MODULES = 'wraHide3rdPartyModules';

var hide3rdPartyModules = new Value({
    handler: {
        change: function() {
            localStorage.setItem(LS_KEY_HIDE_3RD_PARTY_MODULES, this.value);
        }
    },
    init: function() {
        Value.prototype.init.call(this);

        var savedValue = localStorage.getItem(LS_KEY_HIDE_3RD_PARTY_MODULES);
        var value = true;

        if (savedValue == 'false') {
            value = false;
        }

        this.set(value);
    }
});

module.exports = {
    hide3rdPartyModules: hide3rdPartyModules
};
