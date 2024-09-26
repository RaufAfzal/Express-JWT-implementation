const User = require('../model/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
// const fsPromises = require('fs').promises
// const path = require('path')

const handleLogin = async (req, res) => {
    const cookies = req.cookies;
    const { user, pwd } = req.body;
    if (!user || !pwd) return res.status(400).json({ "message": "Username and Password required" });
    // const foundUser = usersDB.users.find(person => person.username === user)
    const foundUser = await User.findOne({ username: user }).exec();
    console.log(`user is ${JSON.stringify(foundUser)}`)
    if (!foundUser) return res.status(401).json({ "message": "user name and password does not matches " })

    const match = await bcrypt.compare(pwd, foundUser.password);

    if (match) {
        console.log('Access Token Secret:', process.env.ACCESS_TOKEN_SECRET);
        console.log('Refresh Token Secret:', process.env.REFRESH_TOKEN_SECRET);
        const roles = Object.values(foundUser.roles).filter(Boolean);

        const accessToken = jwt.sign(
            {
                "UserInfo": {
                    "username": foundUser.username,
                    "roles": roles
                }
            },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '15m' }
        );
        const newRefreshToken = jwt.sign(
            { "username": foundUser.username },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: '1d' }
        );

        let newRefreshTokenArray = !cookies?.jwt ? foundUser.refreshToken : foundUser.refreshToken.filter(rt => rt !== cookies.jwt)

        if (cookies?.jwt) {
            const refreshToken = cookies.jwt;
            const foundToken = await User.findOne({ refreshToken }).exec();

            if (!foundToken) {
                console.log('attempted refresh token reuse at login!')
                // clear out ALL previous refresh tokens
                newRefreshTokenArray = [];
            }

            res.clearCookie('jwt', { httpOnly: true, secure: true, sameSite: 'None', maxAge: 24 * 60 * 60 * 1000 });
        }

        //saving refreshToken with current user in the database
        foundUser.refreshToken = [...newRefreshTokenArray, newRefreshToken]
        const result = await foundUser.save();

        console.log(result)

        // Creates Secure Cookie with refresh token
        res.cookie('jwt', newRefreshToken, { httpOnly: true, secure: true, sameSite: 'None', maxAge: 24 * 60 * 60 * 1000 });
        res.status(201).json({ roles, accessToken });
    }
    else {
        res.status(401).json({ "message": `Password doesn't matches` })
    }
}

module.exports = {
    handleLogin
}