const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require("bcryptjs");

const employeeSchema = new Schema(
  {
    name: { type: String, required: true },
    username: { type: String, required: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
  },
  {
    versionKey: false,
  }
);

const Employee = mongoose.model("Employee", employeeSchema, "employees");

module.exports = {
  //tìm nhân viên theo email
  findByEmail: async (email) => {
    try {
      const employee = await Employee.findOne({ email: email });
      return employee;
    } catch (e) {
      console.log("ERROR: " + e);
      throw e;
    }
  },
  //tìm nhân viên theo username
  findByUsername: async (username) => {
    try {
      const employee = await Employee.findOne({ username: username });
      return employee;
    } catch (e) {
      console.log("ERROR: " + e);
      throw e;
    }
  },
  // Đăng kí tài khoản employee
  registerEmployee: async (entity) => {
    try {
      const hash = bcrypt.hashSync(entity.password, 10);
      entity.password = hash;
      var employee = new Employee(entity);
      await employee.save();
      return employee;
    } catch (e) {
      console.log("ERROR: " + e);
    }
  },
  // Đăng nhập tài khoản employee
  loginEmployee: async (entity) => {
    const employeeExist = await Employee.findOne({ username: entity.username });
    if (employeeExist === null) return null;
    const password = employeeExist.password;
    if (bcrypt.compareSync(entity.password, password)) {
      return employeeExist;
    }
    return null;
  },
  //thêm employee
  // createEmployee: async (data) => {
  //   try {
  //     const employee = await Employee.create({name: data.name,username: data.username, password: data.password, phone: data.phone, email: data.email});
  //     return employee;
  //   } catch (e) {
  //     console.log("ERROR: " + e);
  //     throw e;
  //   }
  // },
  //xóa employee
  deleteEmployee: async (username) => {
    try {
      const employee = await Employee.deleteOne({ username: username });
      return employee;
    } catch (e) {
      console.log("ERROR: " + e);
      throw e;
    }
  },
  //cập nhật employee
  updateEmployee: async (data) => {
    try {
      const employee = await Employee.findOneAndUpdate(
        { username: data.username },
        {
          name: data.name,
          phone: data.phone,
          email: data.email,
        },
        { runValidators: true }
      );
      return employee;
    } catch (e) {
      console.log("ERROR: " + e);
      throw e;
    }
  },
  //truy vấn employee theo email
  getEmployee: async (email) => {
    try {
      const employee = await Employee.findOne({ email: email });
      return employee;
    } catch (e) {
      console.log("ERROR: " + e);
      throw e;
    }
  },
  //lấy danh sách employee
  getListEmployees: async () => {
    try {
      const listEmployees = await Employee.find();
      return listEmployees;
    } catch (e) {
      console.log("ERROR: " + e);
      throw e;
    }
  },
};
