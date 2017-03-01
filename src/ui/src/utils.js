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

module.exports = {
    getSize: getSize,
    getPostfix: getPostfix
};
