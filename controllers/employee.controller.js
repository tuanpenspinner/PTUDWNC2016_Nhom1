const Employee = require('../models/employee.model');
const Customer = require('../models/customer.model');
const jwt = require("jsonwebtoken");

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

  //Đăng nhập employee
  exports.loginEmployee = async (req, res) => {
    try {
      const entity = req.body;
      const ret = await Employee.loginEmployee(entity);
      if (ret === null)
      return res.json({
        status: 'fail',
        failLogin: "Tài khoản hoặc mật khẩu chưa chính xác",
      });
      const payload = {
        idUser: ret._id,
        username: ret.username,
        name: ret.name,
      };
  
      const accessToken = jwt.sign(payload, "secretKeyEmployee", {
        expiresIn: "1d", // 1 day
      });
      const resUser={
        username: ret.username,
        email: ret.email,
        name: ret.name,
      };
      res.json({ status: 'success',accessToken: accessToken,user: resUser });
    } catch (e) {
      console.log("ERROR: " + e.message);
  
      return res.json({
        status: "fail",
        code: 2022,
        message: "Đăng nhập thất bại",
      });
    }
  };
  //lay thong tin nhan vien
  exports.getEmployeeInfo = async (req, res) => {
    const usernameEmployee = req.payload.username;
    try {
      var result = await Employee.findByUsername(usernameEmployee);
  
      if (!result) {
        throw "Tài khoản không tồn tại!";
      }
      console.log(result);
      const employee = {
        username: result.username,
        name: result.name,
        phone: result.phone,
        email: result.email,
      };
      console.log(employee);
  
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
        message: "Lấy thông tin nhân viên thất bại!",
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