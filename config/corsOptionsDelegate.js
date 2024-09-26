let allowlist = ['http://localhost:3000'];

let corsOptionsDelegate = function (req, callback) {
    let corsOptions;
    let origin = req.header('Origin');

    if (allowlist.indexOf(origin) !== -1) {
        // If the origin is found in the allowlist, allow the request
        corsOptions = { origin: true, credentials: true }; // Enable credentials to allow cookies
    } else {
        // Otherwise, disallow the request
        corsOptions = { origin: false };
    }
    callback(null, corsOptions); // callback expects two arguments: error and options
};

module.exports = corsOptionsDelegate;
