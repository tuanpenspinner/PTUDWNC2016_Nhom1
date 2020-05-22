require('dotenv').config();

const createError = require('http-errors');
const express = require('express');
const path = require('path');
const logger = require('morgan');
const connectDB = require("./dbs");

const indexRoute = require('./routes/index');
const moneyTransferRoute = require('./routes/money-transfer');
const customerRoute = require('./routes/customer');
const app = express();
const PORT = 3001;

//connect mongodb atlas
connectDB();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRoute);
app.use('/money-transfer', moneyTransferRoute);
app.use('/customers', customerRoute);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500).send('ERROR');
});

app.listen(PORT, () => {
  console.log('Great Internet Banking - http://localhost:' + PORT);
});
