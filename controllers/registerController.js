const usersDB = {
    users: require('../model/users.json'),
    setUsers: function (data) {
        this.users = data
    }
}

const fsPromises = require('fs').promises;
const path = require('path');
const bcrypt = require('bcrypt');


const handlenewUser = async (req, res) => {
    const { user, pwd, roles } = req.body;
    console.log(roles)
    if (!user || !pwd) return res.status(400).json({ "message": "Username and Password required" });
    const duplicate = usersDB.users.find(person => person.username === user);
    if (duplicate) return res.status(409).json({ message: "Username already exists" });
    try {
        const hashedPassword = await bcrypt.hash(pwd, 10)
        const newUser = { "username": user, "password": hashedPassword, "roles": roles }
        usersDB.setUsers([...usersDB.users, newUser]);
        await fsPromises.writeFile(
            path.join(__dirname, "..", 'model', 'users.json'),
            JSON.stringify(usersDB.users, null, 2)
        );
        res.status(201).json({ 'success': `New user ${user} created` })

    }
    catch (err) {
        res.status(500).json({ "message": err.message })
    }
}

module.exports = { handlenewUser }


