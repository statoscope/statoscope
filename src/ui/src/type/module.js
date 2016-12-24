var entity = require('basis.entity');

var Module = entity.createType('Module', {
    id: entity.IntId,
    name: String,
    size: Number,
    files: Object,
    reasons: entity.createSetType('Module')
});

Module.extendReader(function(data) {
    if (data.reasons) {
        data.reasons = data.reasons.map(function(reason) {
            return reason.moduleId;
        });
    }
});

module.exports = Module;
