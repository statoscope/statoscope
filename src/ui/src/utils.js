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

module.exports = {
    getSize: getSize,
    getPostfix: getPostfix,
    roundSize: roundSize,
    sharePartOfPaths: sharePartOfPaths
};
