const Employee = require('../models/employee.model');

//check data employee
const checkData = async (name, username, password, phone, email) => {
  // Check mEmail
  const checkEmail = await Employee.findByEmail(email);
  if (checkEmail) {
    throw { message: "Email đã tồn tại!" };
  }
  //check username 
  const checkUsername = await Employee.findByUsername(username);
  if (checkUsername) {
    throw { message: "Username đã tồn tại!" };
  }
  return {name, username, password, phone, email};
};
//tạo tài khoản nhân viên
exports.createEmployee = async (req, res) => {
  try {
    const {name, username, password, phone, email}= req.body;
  
    const newEmployee = await checkData(name, username, password, phone, email);
    console.log(newEmployee);

    const employee = await Employee.createEmployee(newEmployee);
    
    if (!employee) {
      throw "Tạo tài khoản nhân viên thất bại!";
    }
    
    return res.json({
      status: "success",
      code: 2020,
      message: "Tạo tài khoản nhân viên thành công!"
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

//cập nhật tài khản nhân viên
// exports.updateEmployee = async (req, res) => {

// };
//xóa nhân viên theo email
exports.deleteEmployee = async (req, res) => {
  const {email}= req.body;
  try {
    const checkEmployee = await Employee.findByEmail(email);
    if(!checkEmployee)
      throw("Nhân viên không tồn tại!");
    const employee = await Employee.deleteEmployee(email);
    
    if (!employee) {
      throw "Xóa tài khoản nhân viên thất bại!";
    }
    
    return res.json({
      status: "success",
      code: 2020,
      message: "Xóa thông tin nhân viên thành công!"
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
exports.getEmployee=async(req,res)=>{
  try {
    const {email}= req.body;
    const employee = await Employee.getEmployee(email);

    if (!employee) {
      throw "Tài khoản nhân viên không tồn tại!";
    }

    return res.json({
      status: "success",
      code: 2020,
      message: "Lấy thông tin nhân viên thành công!",
      employee
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
    const listEmployees = await Employee.getListEmployees();

    if (!listEmployees) {
      throw "failed";
    }

    return res.json({
      status: "success",
      code: 2020,
      message: "Lấy danh sách nhân viên thành công!",
      listEmployees
    });
  } catch (e) {
    console.log("ERROR: " + e);

    return res.json({
      status: "failed",
      code: 2022,
      message: "Lấy danh sách nhân viên thất bại!"
    });
  }
};
