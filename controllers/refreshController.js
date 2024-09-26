const User = require('../model/User');

const jwt = require('jsonwebtoken');

const handleRefreshToken = async (req, res) => {
    const cookies = req.cookies;
    if (!cookies?.jwt) return res.sendStatus(401)
    console.log(cookies?.jwt)
    const refreshToken = cookies.jwt;
    res.clearCookie('jwt', { httpOnly: true, secure: true, sameSite: 'None', maxAge: 24 * 60 * 60 * 1000 })
    const foundUser = await User.findOne({ refreshToken: refreshToken }).exec();
    // console.log(`found user is ${foundUser}`)
    // reuse detection token
    if (!foundUser) {
        jwt.verify(
            refreshToken,
            process.env.REFRESH_TOKEN_SECRET,
            async (err, decoded) => {
                if (err) return res.sendStatus(403);
                const hackedUser = await User.findOne({ username: decoded.username }).exec();
                hackedUser.refreshToken = [];
                const result = await hackedUser.save();
                console.log(result)
            })

        return res.sendStatus(403);
    }

    const newRefreshTokenArray = foundUser.refreshToken.filter(rt => rt !== refreshToken);


    jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        async (err, decoded) => {
            if (err) {
                foundUser.refreshToken = [...newRefreshTokenArray];
                const result = await foundUser.save();
            }
            if (err || foundUser.username !== decoded.username) return res.sendStatus(403);

            //Refresh Token is still valid
            const roles = Object.values(foundUser.roles);
            const accessToken = jwt.sign(
                {
                    "UserInfo":
                    {
                        "username": decoded.username,
                        "roles": decoded.roles
                    }
                },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: "30s" }
            );
            const newrefreshToken = jwt.sign(
                { "username": foundUser.username },
                process.env.REFRESH_TOKEN_SECRET,
                { expiresIn: '1d' }
            );

            //saving refreshToken with current user in the database
            foundUser.refreshToken = [...newRefreshTokenArray, newrefreshToken];
            const result = await foundUser.save();

            res.cookie('jwt', newrefreshToken, { httpOnly: true, secure: true, sameSite: 'None', maxAge: 24 * 60 * 60 * 1000 })
            res.json({ roles, accessToken })
        }
    );

}

module.exports = {
    handleRefreshToken
}