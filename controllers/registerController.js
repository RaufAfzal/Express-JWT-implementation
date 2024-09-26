const User = require('../model/User');
const bcrypt = require('bcrypt');


const handlenewUser = async (req, res) => {
    const { user, pwd } = req.body;
    if (!user || !pwd) return res.status(400).json({ "message": "Username and Password required" });
    const duplicate = await User.findOne({ username: user }).exec();
    if (duplicate) return res.sendStatus(409); //duplication status code
    try {
        const hashedPassword = await bcrypt.hash(pwd, 10)
        //store and create user in mongosse
        const result = await User.create({
            "username": user,
            "password": hashedPassword,
            "roles": {
                "User": '4444'
            }
        })

        console.log(result)
        res.status(201).json({ 'success': `New user ${user} created` })

    }
    catch (err) {
        res.status(500).json({ "message": err.message })
    }
}

module.exports = { handlenewUser }


