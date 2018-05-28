module.exports = {
    /**
     * Fetch a url using fetch in browser and http or https in Node
     * @param {String} url 
     * @param {*} options 
     */
    fetch(url, options) {
        if (typeof window === 'object' && typeof window.fetch === 'function') {
            // Browser with fetch support
            if (options.headers) {
                options.headers = new Headers(options.headers);
            }

            options.headers = undefined;  // TODO 临时去掉 json 头
            
            return window.fetch(url, options);
        }
        else {
            // Node
            
            // options.headers = { };  // TODO 临时去掉 json 头

            return new Promise((res, rej) => {
                let http = require('http');

                // parse http url
                let parsed_url = require('url').parse(url);

                // request via http module
                var req = {
                    host: parsed_url.hostname,
                    port: parsed_url.port || 80,
                    path: parsed_url.path,
                    protocol: 'http:',
                    headers: options.headers || { },
                    method: options.method || 'GET'
                };

                if (options.body) {
                    req.headers['Content-Length'] = new Buffer(options.body, 'utf8').length;
                }

                let reqObj = http.request(req, response => {
                    var buf = new Buffer(0);

                    response.on('data', (chunk) => {
                        buf = Buffer.concat([ buf, chunk ]);
                    });

                    response.on('end', () => {
                        var parsedResObj = {
                            json: async function getJSON() {
                                return JSON.parse(buf.toString('utf8'));
                            }
                        };
                        
                        res(parsedResObj);
                    });
                });

                if (options.body) {
                    reqObj.write(options.body);
                }

                reqObj.on("error", err => {
                    rej(err);
                });
                reqObj.end();
            });
        }
    }
};
