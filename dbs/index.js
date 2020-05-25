const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const connectDB = async () => {
  try {
    mongoose.connect(process.env.CONNECT_STRING, { useNewUrlParser: true, useUnifiedTopology: true }, (database) =>
      console.log('connected'),
    );
  } catch (error) {
    return console.log('could not connect');
  }
};

module.exports = connectDB;
