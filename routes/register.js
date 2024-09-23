const express = require('express');
const router = express.Router();
const registerController = require('../controllers/registerController');

console.log(registerController);


router.route('/')
    .post(registerController.handlenewUser)


module.exports = router;
