const Employee = require('../model/Employee')

const getAllEmployee = async (req, res) => {
    try {
        const employees = await Employee.find();  // Await the promise to get the data
        res.json(employees);  // Send the actual data as a JSON response
    } catch (err) {
        console.error(err);
        res.status(500).json({ "message": "An error occurred while fetching employees." });
    }
}

const createNewEmployee = async (req, res) => {
    if (!req?.body?.firstname || !req?.body?.lastname) {
        return res.status(400).json({ 'message': 'First name and last name required' });
    }
    try {
        const result = await Employee.create({
            firstname: req.body.firstname,
            lastname: req.body.lastname,
        })
        return res.status(201).json({ message: 'Employee created successfully', employee: result });

    }
    catch (err) {
        console.error(err)
    }
}

const updateEmployee = async (req, res) => {
    if (!req?.body?.id) {
        return res.status(400).json({ 'message': 'ID parameter is required' })
    }
    const employee = await Employee.findOne({ _id: req.body.id }).exec()
    if (!employee) {
        return res.status(204).json({ "message": `Employee with ${req.body.id} not found` });
    }
    if (req.body.firstname) employee.firstname = req.body.firstname;
    if (req.body.lastname) employee.lastname = req.body.lastname;
    const result = await employee.save()
    res.json(result);
}

const deleteEmployee = async (req, res) => {
    if (!req?.body?.id) {
        return res.status(400).json({ 'message': 'ID parameter is required' })
    }
    const employee = await Employee.findOne({ _id: req.body.id }).exec()
    if (!employee) {
        return res.status(204).json({ "message": `Employee with ${req.body.id} not found` });
    }
    const result = employee.deleteOne();
    res.json(result)
}

const getEmployeeById = async (req, res) => {
    if (!req?.params?.id) {
        return res.status(400).json({ 'message': 'ID parameter is required' })
    }
    const employee = await Employee.findOne({ _id: req.params.id }).exec()
    if (!employee) {
        return res.status(204).json({ "message": `Employee with ${req.body.id} not found` });
    }
    res.json(employee);
}

module.exports = {
    createNewEmployee,
    updateEmployee,
    deleteEmployee,
    getEmployeeById,
    getAllEmployee
} 