const express = require('express');
const router = express.Router();
const employeesController = require('../../controllers/employeesController')
// const { verifyJWT } = require('../../middleware/verifyJWT');


router.route('/')
    .get(employeesController.getAllEmployee)
    .post(employeesController.createNewEmployee)
    .put(employeesController.updateEmployee)
    .delete(employeesController.deleteEmployee);

router.route('/:id')
    .get(employeesController.getEmployeeById);

module.exports = router;