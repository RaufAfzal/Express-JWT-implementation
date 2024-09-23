const jwt = require('jsonwebtoken');
require('dotenv').config();


const verifyJWT = (req, res, next) => {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (!authHeader?.startsWith('Bearer ')) return res.status(401);
    console.log(`Auth header is ${authHeader}`);
    console.log(`Req header is ${JSON.stringify(req.headers)}`);
    const token = authHeader.split(' ')[1];
    jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET,
        (err, decoded) => {
            if (err) return res.status(401);
            req.user = decoded.UserInfo.username;
            req.roles = decoded.UserInfo.roles;
            console.log(`decoded user is ${req.user}`)
            next();
        }

    )
}

module.exports = { verifyJWT }