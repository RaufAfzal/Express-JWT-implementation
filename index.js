const express = require('express');
const { request } = require('http');
const { logger } = require('./middleware/LogEvent');
const { verifyJWT } = require('./middleware/verifyJWT')
const app = express()
const path = require('path');
var cors = require('cors');
require('dotenv').config();
const cookieParser = require('cookie-parser')

const PORT = process.env.PORT || 3500;

let allowlist = ['http://localhost:3500/login']
let corsOptionsDelegate = function (req, callback) {
    let corsOptions;
    if (allowlist.indexOf(req.header('Origin')) !== -1) {
        corsOptions = { origin: true }
    } else {
        corsOptions = { origin: false }
    }
    callback(null, corsOptions)
}

//body parser middleware
app.use(express.json());

app.use(cookieParser())

app.use(cors(corsOptionsDelegate))

app.use(logger)

app.use('/', express.static(path.join(__dirname, '/public')));

app.use('/subdir', express.static(path.join(__dirname, '/public')));

app.use('/', require('./routes/root'))

app.use('/subdir', require('./routes/subdir'))

app.use('/register', require('./routes/register'))

app.use('/login', require('./routes/authentication'))

app.use('/refresh', require('./routes/refresh'))

app.use('/logout', require('./routes/logout'))

app.use(verifyJWT)

app.use('/employees', require('./routes/api/employees'))

app.all('*', (req, res) => {
    res.status(404)
    if (req.accepts('html')) {
        res.sendFile(path.join(__dirname, 'views', '404.html'))
    }
    else if (req.accepts('json')) {
        res.json({ error: "404 not found" })
    } else if (req.accepts('txt')) {
        res.send("404 not found")
    }

})




app.listen(PORT, () => console.log(`server running on ${PORT}`))

