function getSize(bytes) {
    var kBytes = bytes / 1024;
    var mBytes = bytes / 1024 / 1024;

    if (mBytes >= 1) {
        return mBytes;
    } else if (kBytes >= 1) {
        return kBytes;
    }

    return bytes;
}

function getPostfix(bytes) {
    var kBytes = bytes / 1024;
    var mBytes = bytes / 1024 / 1024;

    if (mBytes >= 1) {
        return 'MB';
    } else if (kBytes >= 1) {
        return 'KB';
    }

    return 'B';
}

module.exports = {
    getSize: getSize,
    getPostfix: getPostfix
};
