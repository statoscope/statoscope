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

module.exports = {
    getSize: getSize,
    getPostfix: getPostfix,
    roundSize: roundSize
};
