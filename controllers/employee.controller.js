const Employee = require('../models/employee.model');
const Customer = require('../models/customer.model');
const jwt = require("jsonwebtoken");

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

  //check data nạp tiền
  const checkMoneyRecharge = async (username, accountNumber, amount, type) => {
    const checkUsername = await Customer.findOneUserName(username);
    if (!checkUsername) {
      throw { message: "Username không tồn tại!" };
    }

    if(!amount.match("^[0-9]+$")){
      throw { message: "Số tiền nạp vào nhập ở dạng số!" };
    }

    if(type==="checkingAccount"){
    const checkAccountNumber = await Customer.findOneCheckingAccount(username, accountNumber);
    if(!checkAccountNumber){
      throw { message: "Username không tồn tại số tài khoản thanh toán này!" };
    }
    return checkAccountNumber;
  }
    if(type==="savingAccount"){
      const checkAccountNumber1 = await Customer.findOneSavingAccount(username, accountNumber);
      if(!checkAccountNumber1){
        throw { message: "Username không tồn tại số tài khoản tiết kiệm này!" };
      }
      return checkAccountNumber1;
    }
    return {username, accountNumber, amount, type};
  };
//Đăng kí Employee
exports.registerEmployee = async (req, res) => {
  try {
    const newEmployee = req.body;
    const employeeExist = await Employee.findByUsername(newEmployee.username);
    if (!employeeExist) {
      const result = await Employee.registerEmployee(newEmployee);
      if (!result){
        throw {message: "Tạo tài khoản thành viên thất bại!"};
      }
      return res.json({
        status: "success",
        code: 2020,
        message: "Tạo tài khoản nhân viên thành công!"
      });
    } else {
     throw {message: `Tài khoản ${newEmployee.username} đã tồn tại`};
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
//Đăng nhập customer
exports.loginEmployee = async (req, res) => {
  try {
    const entity = req.body;
    const ret = await Employee.loginEmployee(entity);
    if (ret === null)
      throw { message: "Tài khoản hoặc mật khẩu chưa chính xác" };
    const payload = {
      idUser: ret._id,
      username: ret.username,
      name: ret.name,
    };

    const accessToken = jwt.sign(payload, "secretKeyCustomer", {
      expiresIn: "1d", // 1 day
    });
    res.json({ accessToken: accessToken });
  } catch (e) {
    console.log("ERROR: " + e.message);

    return res.json({
      status: "failed",
      code: 2022,
      message: "Đăng nhập thất bại",
    });
  }
};
//cập nhật tài khản nhân viên
exports.updateEmployee = async (req, res) => {
  try {
    const {name, username, password, phone, email}= req.body;
    const updateEmployee = {
      name: name, 
      username: username, 
      password: password, 
      phone: phone, 
      email: email,
    }
    const checkEmployee = await Employee.findByUsername(username);
    if(!checkEmployee)
      throw {message: "Nhân viên không tồn tại!"};

    const updatedEmployee = await Employee.updateEmployee(updateEmployee);    
    if (!updatedEmployee) {
      throw {message: "Cập nhật thông tin nhân viên thất bại!"};
    }
    
    return res.json({
      status: "success",
      code: 2020,
      message: "Cập nhật thông tin nhân viên thành công!",
      updatedEmployee
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


// nạp tiền
exports.rechargeMoney = async (req, res) => {
  try {
    const {username, accountNumber,amount,type}= req.body;
    //kiểm tra username, account number hợp lệ
    const data = await checkMoneyRecharge(username, accountNumber,amount,type);
    let newAmount= parseInt(amount,10);

    //thực hiện nạp tiền vào database
    if (type === "checkingAccount") {
      newAmount =newAmount + parseInt(data.checkingAccount.amount, 10);
      await Customer.updateCheckingAmount(data.checkingAccount.accountNumber, newAmount);
    }
    else if (type === "savingAccount") {
      const currentAmount = data.savingsAccount.filter(item => item.accountNumber === accountNumber);
      newAmount = newAmount + parseInt(currentAmount[0].amount, 10);
      await Customer.updateSavingAmount(username, accountNumber, newAmount);
    }

    //thêm vào lịch sử nạp tiền
    await Customer.addHistoryRecharge(username, amount, accountNumber, Date.now());

    return res.json({
      status: "success",
      code: 2020,
      message: `Nạp tiền vào tài khoản ${accountNumber} thành công!`,
    });
   } catch (e) {
     console.log("ERROR: " + e.message);
 
     return res.json({
       status: "failed",
       code: 2022,
       message: e.message + " Vui lòng thực hiện lại.",
     });
 }
};