let logger = require("./logger");
let httpModule = undefined;
let httpsModule = undefined;
let agent = undefined;

// if in Node, initialize libraries
if (!(typeof window === "object" && typeof window.fetch === "function")) {
    httpModule = require("http");
    httpsModule = require("https");
    agent = new httpsModule.Agent({
        keepAlive: true
    });
}

module.exports = {
    /**
     * Fetch a url using fetch in browser and http or https in Node
     * @param {String} url 
     * @param {*} options 
     */
    fetch(url, options) {
        let didTimeout = false;

        if (typeof window === "object" && typeof window.fetch === "function") {
            // Browser with fetch support
            if (options.headers) {
                options.headers = new Headers(options.headers);
            }

            return new Promise((resolve, reject) => {
                if (options.networkTimeout) {
                    setTimeout(() => {
                        didTimeout = true;
                        reject(new Error("Request Timeout."));
                    }, options.networkTimeout);
                }
                
                window.fetch(url, options)
                    .then(res => {
                        if (didTimeout) return;
                        resolve(res);
                    })
                    .catch((e) => {
                        if (didTimeout) return;
                        reject(e);
                    });
            });
        }
        else {
            // Node
            return new Promise((res, rej) => {
                let http = url.startsWith("http:") ? httpModule : httpsModule;

                // parse http url
                let parsed_url = require("url").parse(url);

                // request via http module
                var req = {
                    host: parsed_url.hostname,
                    port: parsed_url.port || 80,
                    path: parsed_url.path,
                    protocol: url.startsWith("http:") ? "http:" : "https:",
                    headers: options.headers || { },
                    method: options.method || "GET"
                };

                if (url.startsWith("https:")) {
                    req.agent = agent;
                }

                if (options.body) {
                    req.headers["Content-Length"] = new Buffer(options.body, "utf8").length;
                }

                let reqObj = http.request(req, response => {
                    if (didTimeout) return;

                    var buf = new Buffer(0);

                    response.on("data", (chunk) => {
                        buf = Buffer.concat([ buf, chunk ]);
                    });

                    response.on("end", () => {
                        if (didTimeout) return;
                        logger.verbose("[fetch] finished " + response.statusCode + " " + url);

                        var parsedResObj = {
                            json: async function getJSON() {
                                try {
                                    return JSON.parse(buf.toString("utf8"));
                                }
                                catch (e) {
                                    throw new Error("error while deserialization: " + buf.toString("utf8"));
                                }
                            },

                            text: async function text() {
                                return buf.toString("utf8");
                            }
                        };
                        
                        res(parsedResObj);
                    });
                });

                if (options.networkTimeout) {
                    reqObj.setTimeout(options.networkTimeout, function() {
                        didTimeout = true;
                        reqObj.abort();
                    });

                    setTimeout(function() {
                        didTimeout = true;
                        reqObj.abort();
                    }, options.networkTimeout);
                }

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
