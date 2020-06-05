const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const employeeSchema = new Schema({
  name: {type: String, required: true},
  username: {type: String, required: true},
  password: {type: String, required: true},
  phone: {type: String, required: true},
  email: {type: String, required: true},
},{
  versionKey: false
});

const Employee =mongoose.model('Employee', employeeSchema, 'employees');

module.exports = {
//tìm nhân viên theo email
  findByEmail: async (email) => {
    try {
      const employee = await Employee.findOne({email: email});
      return employee;
    } catch (e) {
      console.log("ERROR: " + e);
      throw e;
    }
  },
  //tìm nhân viên theo username
  findByUsername: async (username) => {
    try {
      const employee = await Employee.findOne({username: username});
      return employee;
    } catch (e) {
      console.log("ERROR: " + e);
      throw e;
    }
  },
  //thêm employee
  createEmployee: async (data) => {
    try {
      const employee = await Employee.create({name: data.name,username: data.username, password: data.password, phone: data.phone, email: data.email});
      return employee;
    } catch (e) {
      console.log("ERROR: " + e);
      throw e;
    }
  },
  //xóa employee
  deleteEmployee: async (email) => {
    try {
      const employee = await Employee.deleteOne({email: email});
      return employee;
    } catch (e) {
      console.log("ERROR: " + e);
      throw e;
    }
  },
  //cập nhật employee
  //truy vấn employee theo email
  getEmployee: async (email) => {
    try {
      const employee = await Employee.findOne({email: email});
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
  }
};