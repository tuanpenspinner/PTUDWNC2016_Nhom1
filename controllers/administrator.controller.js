const Employee = require("../models/employee.model");
const Customer = require("../models/customer.model");
const jwt = require("jsonwebtoken");
//Đăng kí Employee
exports.registerEmployee = async (req, res) => {
  try {
    const newEmployee = req.body;
    const employeeExist = await Employee.findByUsername(newEmployee.username);
    if (!employeeExist) {
      const result = await Employee.registerEmployee(newEmployee);
      if (!result) {
        throw { message: "Tạo tài khoản thành viên thất bại!" };
      }
      return res.json({
        status: "success",
        code: 2020,
        message: "Tạo tài khoản nhân viên thành công!",
      });
    } else {
      throw { message: `Tài khoản ${newEmployee.username} đã tồn tại` };
    }
  } catch (e) {
    console.log("ERROR: " + e.message);

    return res.json({
      status: "failed",
      code: 2022,
      message: e.message,
    });
  }
};
//cập nhật tài khản nhân viên
exports.updateEmployee = async (req, res) => {
  try {
    const { name, username, password, phone, email } = req.body;
    const updateEmployee = {
      name: name,
      username: username,
      // password: password,
      phone: phone,
      email: email,
    };
    const checkEmployee = await Employee.findByUsername(username);
    if (!checkEmployee) throw { message: "Nhân viên không tồn tại!" };

    const updatedEmployee = await Employee.updateEmployee(updateEmployee);
    if (!updatedEmployee) {
      throw { message: "Cập nhật thông tin nhân viên thất bại!" };
    }

    return res.json({
      status: "success",
      code: 2020,
      message: "Cập nhật thông tin nhân viên thành công!",
      updatedEmployee,
    });
  } catch (e) {
    console.log("ERROR: " + e.message);

    return res.json({
      status: "failed",
      code: 2022,
      message: e.message,
    });
  }
};

//xóa nhân viên theo email
exports.deleteEmployee = async (req, res) => {
  const { username } = req.body;
  try {
    const checkEmployee = await Employee.findByUsername(username);
    if (!checkEmployee) throw "Nhân viên không tồn tại!";
    const employee = await Employee.deleteEmployee(username);

    if (!employee) {
      throw "Xóa tài khoản nhân viên thất bại!";
    }

    return res.json({
      status: "success",
      code: 2020,
      message: "Xóa thông tin nhân viên thành công!",
    });
  } catch (e) {
    console.log("ERROR: " + e);

    return res.json({
      status: "failed",
      code: 2022,
      message: e,
    });
  }
};
//lấy thông tin nhân viên theo email
exports.getEmployee = async (req, res) => {
  try {
    const { email } = req.body;
    const employee = await Employee.getEmployee(email);

    if (!employee) {
      throw "Tài khoản nhân viên không tồn tại!";
    }

    return res.json({
      status: "success",
      code: 2020,
      message: "Lấy thông tin nhân viên thành công!",
      employee,
    });
  } catch (e) {
    console.log("ERROR: " + e);

    return res.json({
      status: "failed",
      code: 2022,
      message: e,
    });
  }
};

//lấy danh sách nhân viên
exports.getAllEmployees = async (req, res) => {
  try {
    var listEmployees = await Employee.getListEmployees();
    listEmployees = listEmployees.map((employee, i) => {
      return {
        id: i,
        name: employee.name,
        username: employee.username,
        phone: employee.phone,
        email: employee.email,
      };
    });

    if (!listEmployees) {
      throw "failed";
    }

    return res.json({
      status: "success",
      code: 2020,
      message: "Lấy danh sách nhân viên thành công!",
      listEmployees,
    });
  } catch (e) {
    console.log("ERROR: " + e);

    return res.json({
      status: "failed",
      code: 2022,
      message: "Lấy danh sách nhân viên thất bại!",
    });
  }
};
