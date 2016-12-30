var Value = require('basis.data').Value;
var Expression = require('basis.data.value').Expression;
var type = require('app.type');

function getSize(size) {
    if (size >= 1024) {
        size /= 1024;

        if (size >= 1024) {
            size /= 1024;
        }
    }

    return size;
}

function getPostfix(size) {
    if (size >= 1024) {
        size /= 1024;

        if (size >= 1024) {
            return 'MB';
        }

        return 'KB';
    }

    return 'bytes';
}

function trimContextExpression(formValue) {
    return new Expression(
        formValue,
        Value.query(type.Source, 'data.profile.data.context'),
        function(from, context) {
            return (from || '').replace(new RegExp('^' + basis.string.forRegExp(context || '')), '') || '/';
        }
    );
}

module.exports = {
    getSize: getSize,
    getPostfix: getPostfix,
    trimContextExpression: trimContextExpression
};
