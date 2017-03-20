var entity = require('basis.entity');
var Filter = require('basis.data.dataset').Filter;
var Module = require('./module');

var ModuleLink = entity.createType('ModuleLink', {
    from: entity.StringId,
    to: entity.StringId
});

var HANDLER_REASONS = {
    itemsChanged: function(sender, delta) {
        if (delta.inserted) {
            delta.inserted.forEach(function(reason) {
                ModuleLink({
                    from: reason.data.module.getId(),
                    to: this.getId()
                });
            }.bind(this));
        }

        if (delta.deleted) {
            delta.deleted.forEach(function(reason) {
                ModuleLink({
                    from: reason.data.module.getId(),
                    to: this.getId()
                }).destroy();
            }.bind(this));
        }
    }
};

var HANDLER_MODULE = {
    update: function(sender, delta) {
        if (delta.hasOwnProperty('reasons') && module.data.reasons) {
            module.data.reasons.forEach(function(reason) {
                ModuleLink({
                    from: reason.data.module.getId(),
                    to: module.data.module.getId()
                });
            });
            module.data.reasons.addHandler(HANDLER_REASONS, module);
        }
    }
};

Module.all.addHandler({
    itemsChanged: function(denser, delta) {
        if (delta.inserted) {
            delta.inserted.forEach(function(module) {
                if (module.data.reasons) {
                    module.data.reasons.forEach(function(reason) {
                        ModuleLink({
                            from: reason.getId(),
                            to: module.getId()
                        });
                    });
                    module.data.reasons.addHandler(HANDLER_REASONS, module);
                } else {
                    module.addHandler(HANDLER_MODULE);
                }
            });
        }
    }
});

ModuleLink.allWrapper = new Filter({
    source: ModuleLink.all,
    rule: function(link) {
        return Module.allWrapper.has(Module(link.data.from)) && Module.allWrapper.has(Module(link.data.to))
    }
});
Module.allWrapper.addHandler({
    itemsChanged: function() {
        ModuleLink.allWrapper.applyRule();
    }
});

module.exports = ModuleLink;
