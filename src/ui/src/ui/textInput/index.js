var TextField = require('basis.ui.field').TextField;
var templates = require('basis.template').define('app.ui', {
    textInput: resource('./template/template.tmpl')
});

module.exports = TextField.subclass({
    template: templates.textInput
});
