const Employee = require("../models/employee.model");
const Customer = require("../models/customer.model");
const Deal = require("../models/deal.model");
const Admin = require("../models/admin.model");
const jwt = require("jsonwebtoken");
const randToken = require("rand-token");
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
//lấy tất cả lịch sử giao dịch với đối tác
exports.getTransactionHistory= async(req, res)=>{
  try {
    var transactionHistory = await Deal.getAllTransactionsHistory();
    if (!transactionHistory) {
      throw "failed";
    }

    return res.json({
      status: "success",
      code: 2020,
      message: "Lấy lịch sử giao dịch thành công!",
      transactionHistory,
    });
  } catch (e) {
    console.log("ERROR: " + e);

    return res.json({
      status: "failed",
      code: 2022,
      message: "Lấy lịch sử giao dịch thất bại!",
    });
  }
};
//Đăng kí Admin
exports.registerAdmin = async (req, res) => {
  try {
    const newCustomer = req.body;
    const customerExist = await Admin.findOneUserName(newCustomer.username);
    if (!customerExist) {
      const result = await Admin.registerAdmin(newCustomer);
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
exports.loginAdmin = async (req, res) => {
  try {
    const entity = req.body;
    const ret = await Admin.loginAdmin(entity);
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
    Admin.updateRefreshToken(ret.username, refreshToken);
    const accessToken = generateAccessToken(payload);
    const admin = {
      username: ret.username,
      email: ret.email,
      name: ret.name,
      phone: ret.phone,
    };
    res.json({
      status: "success",
      accessToken: accessToken,
      refreshToken,
      admin,
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
exports.refreshToken = async (req, res) => {
  try {
    jwt.verify(
      req.body.accessToken,
      "secretKeyAdmin",
      { ignoreExpiration: true },
      async function (err, payload) {
        const { username, name, email } = payload;
        const ret = await Admin.verifyRefreshToken(
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
  const accessToken = jwt.sign(payload, "secretKeyAdministrator", {
    expiresIn: "1d", // 1 day
  });

  return accessToken;
};
