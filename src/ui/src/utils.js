var Merge = require('basis.data.dataset').Merge;

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

function roundSize(size) {
    if (!isNaN(size)) {
        switch (getPostfix(size)) {
            case 'bytes':
                return size;
            case 'KB':
                return Math.round(getSize(size));
            case 'MB':
                return getSize(size).toFixed(2);
        }
    }
}

function formatSize(size) {
    var unit = getPostfix(size);

    switch (unit) {
        case 'KB':
            size = Math.round(getSize(size));
            break;
        case 'MB':
            size = getSize(size).toFixed(2);
            break;
    }

    return size + '\xA0' + unit;
}

function sharePartOfPaths(paths) {
    var partsCount = [];

    paths.forEach(function(path) {
        var parts = path.split('/');

        for (var i = 0; i < parts.length; i++) {
            if (partsCount[i]) {
                if (partsCount[i].name == parts[i]) {
                    partsCount[i].count++;
                } else {
                    break;
                }
            } else {
                partsCount[i] = {
                    name: parts[i], count: 1
                };
            }
        }
    });

    return partsCount
        .filter(function(part) {
            return part.count == paths.length;
        })
        .map(function(part) {
            return part.name;
        })
        .join('/');
}

var mergeFromDataSource = (function() {
    var HANDLER_DATASOURCE = {
        itemsChanged: function(sender) {
            this.setSources(sender.getValues(this.getter).filter(Boolean))
        },
        destroy: function() {
            this.destroy();
        }
    };

    return function(dataSource, getter) {
        if (!dataSource) {
            return null;
        }

        var merge = new Merge({
            getter: getter
        });

        dataSource.addHandler(HANDLER_DATASOURCE, merge);
        merge.setSources(dataSource.getValues(getter).filter(Boolean));

        return merge;
    }
})();

var typeByExt = {
    '.js': 'script',
    '.jsx': 'script',
    '.es6': 'script',
    '.ts': 'script',
    '.tsx': 'script',
    '.coffee': 'script',
    '.dart': 'script',
    '.json': 'json',
    '.css': 'style',
    '.html': 'html',
    '.eot': 'font',
    '.ttf': 'font',
    '.woff': 'font',
    '.woff2': 'font',
    '.svg': 'image',
    '.jpg': 'image',
    '.jpeg': 'image',
    '.png': 'image',
    '.gif': 'image',
    '.tmpl': 'template',
    '.l10n': 'l10n'
};

module.exports = {
    getSize: getSize,
    getPostfix: getPostfix,
    roundSize: roundSize,
    formatSize: formatSize,
    sharePartOfPaths: sharePartOfPaths,
    typeByExt: typeByExt,
    mergeFromDataSource: mergeFromDataSource
};
