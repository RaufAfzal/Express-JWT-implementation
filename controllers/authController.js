const usersDB = {
    users: require('../model/users.json'),
    setUsers: function (data) {
        this.users = data
    }
}

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const fsPromises = require('fs').promises
const path = require('path')

const handleLogin = async (req, res) => {
    const { user, pwd } = req.body;
    if (!user || !pwd) return res.status(400).json({ "message": "Username and Password required" });
    const foundUser = usersDB.users.find(person => person.username === user)
    console.log(`user is ${foundUser}`)
    if (!foundUser) return res.status(401).json({ "message": "user name and password does not matches " })

    const match = await bcrypt.compare(pwd, foundUser.password);

    if (match) {
        console.log('Access Token Secret:', process.env.ACCESS_TOKEN_SECRET);
        console.log('Refresh Token Secret:', process.env.REFRESH_TOKEN_SECRET);

        const accessToken = jwt.sign(
            { "username": foundUser.username },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '30s' }
        );
        const refreshToken = jwt.sign(
            { "username": foundUser.username },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: '1d' }
        );

        //saving refreshToken with current user in the database
        const otherUsers = usersDB.users.filter(person => person.username !== foundUser.username);
        const currentUser = { ...foundUser, refreshToken };
        console.log(`current user ${JSON.stringify(currentUser)} is`)
        usersDB.setUsers([...otherUsers, currentUser])
        await fsPromises.writeFile(
            path.join(__dirname, "..", 'model', 'users.json'),
            JSON.stringify(usersDB.users)
        )
        res.cookie('jwt', refreshToken, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 })
        res.status(201).json({ accessToken });
    }
    else {
        res.status(401).json({ "message": `Password doesn't matches` })
    }
}

module.exports = {
    handleLogin
}