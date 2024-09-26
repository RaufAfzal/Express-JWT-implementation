require('dotenv').config();
const express = require('express');
const { request } = require('http');
const { logger } = require('./middleware/LogEvent');
const { verifyJWT } = require('./middleware/verifyJWT')
const app = express()
const path = require('path');
var cors = require('cors');
const cookieParser = require('cookie-parser');
const corsOptions = require('./config/corsOptionsDelegate');
const PORT = process.env.PORT || 3500;

const mongoose = require('mongoose')
const connectDB = require('./config/dbConn')

app.use(cors(corsOptions));

connectDB();
//body parser middleware
app.use(express.json());

app.use(cookieParser())

app.use(cors(corsOptions))

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
app.use('/users', require('./routes/api/users'));

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

mongoose.connection.on('open', () => {
    console.log('open')
    app.listen(PORT, () => console.log(`server running on ${PORT}`))
});




