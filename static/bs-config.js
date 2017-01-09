var proxyMiddleware = require('http-proxy-middleware');

module.exports = {
    server: {
        middleware: {
            1: proxyMiddleware('/api', {
                target: 'http://127.0.0.1:8002',
                changeOrigin: true
            })
        }
    }
};
