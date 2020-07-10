const Customer = require("../models/customer.model");
const jwt = require("jsonwebtoken");
const randToken = require("rand-token");

//tìm info customer bằng accountNumber checkingAccount
exports.getCustomer = async (req, res) => {
  const _accountNumber = req.params.accountNumber
  try {
    const customer = await Customer.getCustomerByAccount(_accountNumber);

    if (!customer) {
      throw "Tài khoản không tồn tại!";
    }

    return res.json({
      status: "success",
      code: 2020,
      message: "Lấy thông tin khách hàng thành công!",
      customer,
    });
  } catch (e) {
    console.log("ERROR: " + e);

    return res.json({
      status: "failed",
      code: 2022,
      message: "Lấy thông tin khách hàng thất bại!",
    });
  }
};
//Lấy thông tin customer them username
exports.getCustomerInfo = async (req, res) => {
  const usernameCustomer = req.payload.username;
  try {
    var result = await Customer.findOneUserName(usernameCustomer);

    if (!result) {
      throw "Tài khoản không tồn tại!";
    }
    console.log(result);
    const customer = {
      username: result.username,
      name: result.name,
      phone: result.phone,
      savingsAccount: result.savingsAccount,
      checkingAccount: result.checkingAccount,
      email: result.email,
      listReceivers: result.listReceivers,
     
    };
    console.log(customer);

    return res.json({
      status: "success",
      code: 2020,
      message: "Lấy thông tin khách hàng thành công!",
      customer,
    });
  } catch (e) {
    console.log("ERROR: " + e);

    return res.json({
      status: "failed",
      code: 2022,
      message: "Lấy thông tin khách hàng thất bại!",
    });
  }
};
//Lấy thông tin customer theo checking account number
exports.getNameCustomer= async (req, res) => {
  const accountNumber = req.params.accountNumber;
  try {
    var result = await Customer.getCustomerByAccount(accountNumber);

    if (!result) {
      return res.json({
        status: false,
        code: 2020,
        message: "Tài khoản không tồn tại!",
       
      });
    }
    console.log(result);
    const customer = {
      name: result.name,
    };
    console.log(customer);

    return res.json({
      status: true,
      code: 2020,
      message: "Lấy thông tin khách hàng thành công!",
      customer,
    });
  } catch (e) {
    console.log("ERROR: " + e);

    return res.json({
      status: false,
      code: 2022,
      message: "Lấy thông tin khách hàng thất bại!",
    });
  }
};
//lấy list customers
exports.getAllCustomers = async (req, res) => {
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
exports.updateNameCustomer = async (req, res) => {
  try {
    const { username, name } = req.body;
    const ret = await Customer.updateNameCustomer(username, name);
    if (ret)
      return res.json({
        status: true,
        code: 2020,
        message: "Đổi tên khách hàng thành công!",
      });
  } catch (e) {
    console.log("ERROR: " + e);

    return res.json({
      status: false,
      code: 2022,
      message: "Đổi tên thất bại!",
    });
  }
};
exports.updateListReceivers = async (req, res) => {
  try {
    const { listReceivers } = req.body;
    console.log(listReceivers);
    const { username } = req.payload;
    
    const ret = await Customer.updateListReceivers(username, listReceivers);
    if (ret)
      return res.json({
        status: true,
        code: 2020,
        message: "Cập nhật danh sách người gửi thành công!",
      });
  } catch (e) {
    console.log("ERROR: " + e);

    return res.json({
      status: false,
      code: 2022,
      message: "Cập nhật danh sách người gửi thất bại!",
    });
  }
};

//Đăng kí customer
exports.registerCustomer = async (req, res) => {
  try {
    const newCustomer = req.body;
    const customerExist = await Customer.findOneUserName(newCustomer.username);
    if (!customerExist) {
      const result = await Customer.registerCustomer(newCustomer);
      res.json(`Thêm tài khoản ${newCustomer.username} thành công`);
    } else {
      res.json(`Tài khoản ${newCustomer.username} đã tồn tại`);
    }
  } catch (e) {
    console.log("ERROR: " + e);

    return res.json({
      status: "failed",
      code: 2022,
      message: "Tạo tài khoản thất bại",
    });
  }
};
//Đăng nhập customer
exports.loginCustomer = async (req, res) => {
  try {
    const entity = req.body;
    const ret = await Customer.loginCustomer(entity);
    if (ret === null)
      return res.json({
        status: "fail",
        failLogin: "Tài khoản hoặc mật khẩu chưa chính xác",
      });
    const payload = {
      idUser: ret._id,
      username: ret.username,
      name: ret.name,
      accountNumber: ret.checkingAccount.accountNumber,
    };

    const refreshToken = randToken.generate(96); //Chiều dài của refreshToken;
    Customer.updateRefreshToken(ret.username, refreshToken);
    const accessToken = generateAccessToken(payload);
    const customer = {
      username: ret.username,
      email: ret.email,
      name: ret.name,
    };
    res.json({
      status: "success",
      accessToken: accessToken,
      refreshToken,
      customer: customer,
    });
  } catch (e) {
    console.log("ERROR: " + e);

    return res.json({
      status: "failed",
      code: 2022,
      message: "Đăng nhập thất bại",
    });
  }
};

//Đổi mật khẩu customer
exports.changePasswordCustomer = async (req, res) => {
  try {
    const entity = req.body;
    const ret = await Customer.changePasswordCustomer(entity);
    if (ret === null)
      return res.json({
        status: false,
        message: "Đổi mật khẩu thất bại!",
      });
    else {
      return res.json({ status: true, message: "Đổi mật khẩu thành công" });
    }
  } catch (e) {
    console.log("ERROR: " + e);

    return res.json({
      status: false,
      code: 2022,
      message: "Đổi mật khẩu thất bại",
    });
  }
};
//Tạo mã OTP
exports.otpGenerate = async (req, res) => {
  try {
    const entity = req.body;
    const ret = await Customer.otpGenerate();
    if (ret === null) return res.json({ message: "Không trả về mã OTP" });
    else {
      return res.json({ OTP: ret });
    }
  } catch (e) {
    console.log("ERROR: " + e);

    return res.json({
      status: false,
      code: 2022,
      message: "Reset khẩu thất bại",
    });
  }
};
exports.saveAndSendOTP = async (req, res) => {
  try {
    const entity = req.body;
    const OTP = await Customer.otpGenerate();
    const ret = await Customer.saveOTP(entity.username, OTP, entity.email);
    if (ret) {
      const send = await Customer.sendOTP(entity.email, OTP);
      if (send === false)
        return res.json({ status: false, message: "Gửi OTP thất bại" });
      else {
        return res.json({
          status: true,
          message: `Lưu OTP và gửi mà OTP tới địa chỉ ${entity.email}thành công`,
        });
      }
    }
    return res.json({ status: false, message: "Email không thuộc tài khoản" });
  } catch (e) {
    console.log("ERROR: " + e);

    return res.json({
      status: false,
      code: 2022,
      message: "Reset khẩu thất bại",
    });
  }
};
//Xác nhận mã OTP
exports.otpValidateAndResetPassword = async (req, res) => {
  try {
    const entity = req.body;
    const ret = await Customer.otpValidateAndResetPassword(
      entity.OTP,
      entity.username
    );
    console.log(ret);
    if (ret === false)
      return res.json({ status: false, message: "Mã OTP sai hoặc hết hạn" });
    else {
      const changePassword = await Customer.resetPassword(entity);
      if (changePassword)
        return res.json({ status: true, message: "Đổi mật khẩu thành công" });
      else return res.json({ status: false, message: "Đổi mật khẩu thất bại" });
    }
  } catch (e) {
    console.log("ERROR: " + e);

    return res.json({
      status: "failed",
      code: 2022,
      message: "Reset khẩu thất bại",
    });
  }
};

exports.refreshToken = async (req, res) => {
  try {
    jwt.verify(
      req.body.accessToken,
      "secretKeyCustomer",
      { ignoreExpiration: true },
      async function (err, payload) {
        const { username, name, email, accountNumber } = payload;
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
            accountNumber,
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
  const accessToken = jwt.sign(payload, "secretKeyCustomer", {
    expiresIn: "1d", // 1 day
  });

  return accessToken;
};
