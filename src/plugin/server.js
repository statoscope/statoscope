var path = require('path');
var server = require('basisjs-tools-server');
var rempl = require('rempl/server');
var remplPath = path.dirname(require.resolve('rempl'));

process.once('message', function startServer(options) {
    var serverOptions = {
        dev: Boolean(options.dev),
        port: Number(options.port)
    };

    if (options.dev) {
        serverOptions.base = path.resolve(remplPath, '../server/client');
        serverOptions.plugins = [
            path.resolve(remplPath, '../server/client/symlink.js')
        ];
    } else {
        serverOptions.base = path.resolve(remplPath, '../dist/server-client');
    }

    serverOptions.rempl = rempl;
    serverOptions.remplStandalone = true;
    serverOptions.remplExclusivePublisher = options.name;

    server.launch(serverOptions);
});
