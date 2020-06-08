const Customer = require('../models/customer.model');
const jwt = require('jsonwebtoken');

//tìm info customer bằng accountNumber checkingAccount
exports.getCustomer = async (req, res) => {
  const _accountNumber = req.params.accountNumber;
  try {
    const customer = await Customer.getCustomerByAccount(_accountNumber);

    if (!customer) {
      throw 'Tài khoản không tồn tại!';
    }

    return res.json({
      status: 'success',
      code: 2020,
      message: 'Lấy thông tin khách hàng thành công!',
      customer,
    });
  } catch (e) {
    console.log('ERROR: ' + e);

    return res.json({
      status: 'failed',
      code: 2022,
      message: 'Lấy thông tin khách hàng thất bại!',
    });
  }
};
//lấy list customers
exports.getAllCustomers = async (req, res) => {
  try {
    const listCustomers = await Customer.getListCustomers();

    if (!listCustomers) {
      throw 'failed';
    }

    return res.json({
      status: 'success',
      code: 2020,
      message: 'Lấy danh sách khách hàng thành công!',
      listCustomers,
    });
  } catch (e) {
    console.log('ERROR: ' + e);

    return res.json({
      status: 'failed',
      code: 2022,
      message: 'Lấy danh sách thành viên thất bại!',
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
    console.log('ERROR: ' + e);

    return res.json({
      status: 'failed',
      code: 2022,
      message: 'Tạo tài khoản thất bại',
    });
  }
};
//Đăng nhập customer
exports.loginCustomer = async (req, res) => {
  try {
    const entity = req.body;
    const ret = await Customer.loginCustomer(entity);
    if (ret === null) return res.json({ failLogin: 'Tài khoản hoặc mật khẩu chưa chính xác' });
    const payload = {
      idUser: ret._id,
      username: ret.username,
      name: ret.name,
    };

    const accessToken = jwt.sign(payload, 'secretKeyCustomer', {
      expiresIn: '1d', // 1 day
    });
    res.json({ accessToken: accessToken });
  } catch (e) {
    console.log('ERROR: ' + e);

    return res.json({
      status: 'failed',
      code: 2022,
      message: 'Đăng nhập thất bại',
    });
  }
};

//Đổi mật khẩu customer
exports.changePasswordCustomer = async (req, res) => {
  try {
    const entity = req.body;
    const ret = await Customer.changePasswordCustomer(entity);
    if (ret === null) return res.json({ message: 'Đổi mật khẩu thất bại!' });
    else {
      return res.json({ message: 'Đổi mật khẩu thành công' });
    }
  } catch (e) {
    console.log('ERROR: ' + e);

    return res.json({
      status: 'failed',
      code: 2022,
      message: 'Đổi mật khẩu thất bại',
    });
  }
};
//Tạo mã OTP
exports.otpGenerate = async (req, res) => {
  try {
    const entity = req.body;
    const ret = await Customer.otpGenerate(entity.username, entity.email);
    if (ret === null) return res.json({ message: "Không trả về mã OTP" });
    else {
      return res.json({ OTP: ret });
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
//Xác nhận mã OTP
exports.otpValidate = async (req, res) => {
  try {
    const entity = req.body;
    const ret = await Customer.otpValidate(
      entity.OTP,
      entity.username,
      entity.email
    );
    if (ret === null) return res.json({ message: "Không trả về mã OTP" });
    else {
      return res.json({ "Xác nhận OTP": ret });
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
exports.sendOTP = async (req, res) => {
  try {
    const entity = req.body;
    await Customer.sendOTP(entity.OTP, entity.email);
    res.json({ "Thông báo": `Đã gửi OTP tới địa chỉ ${entity.email}` });
  } catch (e) {
    console.log("ERROR: " + e);

    return res.json({
      status: "failed",
      code: 2022,
      message: "Reset khẩu thất bại",
    });
  }
};
