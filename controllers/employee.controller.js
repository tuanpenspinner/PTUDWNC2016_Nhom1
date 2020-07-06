const Employee = require("../models/employee.model");
const Customer = require("../models/customer.model");
const jwt = require("jsonwebtoken");
const randToken = require("rand-token");
const { updateEmployee } = require("../models/employee.model");

//check data nạp tiền
const checkMoneyRecharge = async (username, accountNumber, amount, type) => {
  const checkUsername = await Customer.findOneUserName(username);
  if (!checkUsername) {
    throw { message: "Username không tồn tại!" };
  }
  if (!amount.match("^[0-9]+$")) {
    throw { message: "Số tiền nạp vào nhập ở dạng số!" };
  }
  if (type === "checking") {
    const checkAccountNumber = await Customer.findOneCheckingAccount(
      username,
      accountNumber
    );
    if (!checkAccountNumber) {
      throw { message: "Username không tồn tại số tài khoản thanh toán này!" };
    }
    return checkAccountNumber;
  }
  if (type === "saving") {
    const checkAccountNumber1 = await Customer.findOneSavingAccount(
      username,
      accountNumber
    );
    if (!checkAccountNumber1) {
      throw { message: "Username không tồn tại số tài khoản tiết kiệm này!" };
    }
    return checkAccountNumber1;
  }
  return { username, accountNumber, amount, type };
};
//lấy list tài khoản của customers
exports.getAllAccountCustomers = async (req, res) => {
  try {
    const listCustomers = await Customer.getListCustomers();

    if (!listCustomers) {
      throw "failed";
    }

    return res.json({
      status: "success",
      code: 2020,
      message: "Lấy danh sách khách hàng thành công!",
      listCustomers,
    });
  } catch (e) {
    console.log("ERROR: " + e);

    return res.json({
      status: "failed",
      code: 2022,
      message: "Lấy danh sách thành viên thất bại!",
    });
  }
};
//Đăng nhập employee
exports.loginEmployee = async (req, res) => {
  try {
    const entity = req.body;
    const ret = await Employee.loginEmployee(entity);
    if (ret === null)
      return res.json({
        status: "fail",
        failLogin: "Tài khoản hoặc mật khẩu chưa chính xác",
      });
    const payload = {
      idUser: ret._id,
      username: ret.username,
      name: ret.name,
    };
    const refreshToken = randToken.generate(96); //Chiều dài của refreshToken;
    Employee.updateRefreshToken(ret.username, refreshToken);
    const accessToken = generateAccessToken(payload);
    const resUser = {
      username: ret.username,
      email: ret.email,
      name: ret.name,
    };
    res.json({
      status: "success",
      accessToken: accessToken,
      user: resUser,
      refreshToken,
    });
  } catch (e) {
    console.log("ERROR: " + e.message);

    return res.json({
      status: "fail",
      code: 2022,
      message: "Đăng nhập thất bại",
    });
  }
};
exports.refreshToken = async (req, res) => {
  try {
    jwt.verify(
      req.body.accessToken,
      "secretKeyEmployee",
      { ignoreExpiration: true },
      async function (err, payload) {
        const { username, name, email } = payload;
        const ret = await Customer.verifyRefreshToken(
          username,
          req.body.refreshToken
        );
        if (ret === null) {
          res.json({ "Thông báo:": "không thể lấy token" });
        } else {
          const entity = {
            username,
            name,
            email,
          };
          const accessToken = generateAccessToken(entity);

          res.json({ accessToken });
        }
      }
    );
  } catch (e) {
    console.log("ERROR: " + e);

    return res.json({
      status: "failed",
      code: 2022,
      message: "refreshToken thất bại",
    });
  }
};
const generateAccessToken = (payload) => {
  const accessToken = jwt.sign(payload, "secretKeyEmployee", {
    expiresIn: "1d", // 1 day
  });

  return accessToken;
};
//update thông tin cá nhân (tên/số điện thoại/email)
exports.updateInfoProfile = async (req, res) => {
  const username = req.payload.username;
  const { name, phone, email } = req.body;
  const reqData = {
    username: username,
    name: name,
    email: email,
    phone: phone,
  };
  try {
    const updatedEmployee = await Employee.updateEmployee(reqData);
    if (!updatedEmployee) {
      throw "Cập nhật thất bại!";
    } else {
      const resultUpdate = {
        username: updatedEmployee.username,
        name: updatedEmployee.name,
        phone: updatedEmployee.phone,
        email: updatedEmployee.email,
      };
      return res.json({
        status: "success",
        code: 2020,
        message: "Cập nhật thông tin nhân viên thành công!",
        updatedEmployee: resultUpdate,
      });
    }
  } catch (e) {
    console.log("ERROR: " + e);

    return res.json({
      status: "failed",
      code: 2022,
      message: "Cập nhật tin nhân viên thất bại!",
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
    const { username, accountNumber, amount, type } = req.body;
    //kiểm tra username, account number hợp lệ
    const data = await checkMoneyRecharge(
      username,
      accountNumber,
      amount,
      type
    );
    let newAmount = parseInt(amount, 10);

    //thực hiện nạp tiền vào database
    if (type === "checking") {
      newAmount = newAmount + parseInt(data.checkingAccount.amount, 10);
      await Customer.updateCheckingAmount(
        data.checkingAccount.accountNumber,
        newAmount
      );
    } else if (type === "saving") {
      const currentAmount = data.savingsAccount.filter(
        (item) => item.accountNumber === accountNumber
      );
      newAmount = newAmount + parseInt(currentAmount[0].amount, 10);
      await Customer.updateSavingAmount(username, accountNumber, newAmount);
    }

    //thêm vào lịch sử nạp tiền
    await Customer.addHistoryRecharge(
      username,
      amount,
      accountNumber,
      Date.now()
    );

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
