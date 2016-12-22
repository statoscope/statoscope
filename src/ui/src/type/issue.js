var entity = require('basis.entity');

var Issue = entity.createType('Issue', {
    header: String,
    text: String,
    footer: String
});

Issue.extendReader(function(data) {
    var parts = data.text.split('\n');
    var header = parts.shift();
    var footer = parts.pop();

    if (!/^ @/.test(footer)) {
        parts.push(footer);
        footer = '';
    }

    data.header = header;
    data.text = parts.join('\n');
    data.footer = footer;
});

module.exports = Issue;
