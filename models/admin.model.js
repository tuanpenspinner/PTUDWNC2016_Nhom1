const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require("bcryptjs");


const adminSchema = new Schema({
  name: { type: String, required: true },
  username: { type: String, required: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  refreshToken: { type: String, default: null },
  phone: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true },
  
});

const Customer = mongoose.model("Admin", adminSchema, "administrators");
module.exports = {
  // Đăng kí tài khoản admin
  registerAdmin: async (entity) => {
    try {
      const hash = bcrypt.hashSync(entity.password, 10);
      entity.password = hash;
      var user = new Customer(entity);
      await user.save();
    } catch (e) {
      console.log("ERROR: " + e.message);
    }
  },

  // Tìm 1 tài khoản admin theo tên
  findOneUserName: async (username) => {
    try {
      let user = await Customer.findOne({ username: username });
      return user;
    } catch (e) {
      console.log("ERROR: " + e);
    }
  },

  // Đăng nhập tài khoản admin
  loginAdmin: async (entity) => {
    const customerExist = await Customer.findOne({ username: entity.username });
    if (customerExist === null) return null;
    const password = customerExist.password;
    if (bcrypt.compareSync(entity.password, password)) {
      return customerExist;
    }
    return null;
  },
  // Đổi mật khẩu tài khoản customer
  changePasswordAdmin: async (entity) => {
    console.log(entity);
    const customerExist = await Customer.findOne({ username: entity.username });
    if (customerExist === null) return null;
    const password = customerExist.password;
    if (bcrypt.compareSync(entity.password, password)) {
      const hash = bcrypt.hashSync(entity.newPassword, 10);

      await Customer.findOneAndUpdate(
        { username: entity.username },
        {
          password: hash,
        }
      );
      return true;
    }
    return null;
  },
 

  updateNameAdmin: async (username, name) => {
    const customerExist = await Customer.findOneAndUpdate(
      { username: username },
      { name }
    );
    if (customerExist === null) return null;
    else {
      return true;
    }
  },


  updateRefreshToken: async (username, refreshToken) => {
    try {
      await Customer.findOneAndUpdate(
        { username: username },
        { refreshToken: refreshToken }
      );
    } catch (e) {
      console.log("ERROR: " + e);
      return 0;
    }
  },
  verifyRefreshToken: async (username, refreshToken) => {
    const ret = await Customer.findOne({ username: username });
    const compare = refreshToken === ret.refreshToken;
    if (compare) return true;

    return null;
  },

};
