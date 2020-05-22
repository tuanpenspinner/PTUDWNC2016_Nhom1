const Customer= require("../models/customer.model");

//tìm info customer bằng accountNumber checkingAccount
exports.getCustomer=async(req,res)=>{
   const _accountNumber= req.params.accountNumber;
   try {
    const customer = await Customer.getCustomer(_accountNumber);

    if (!customer) {
        throw "Tài khoản không tồn tại!";
    }

    return res.json({
        status: "success",
        code: 2020,
        message: "Lấy thông tin khách hàng thành công!",
        customer
    });
} catch (e) {
    console.log("ERROR: " + e);

    return res.json({
        status: "failed",
        code: 2022,
        message: "Lấy thông tin khách hàng thất bại!"
    });
}
}
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
            listCustomers
        });
    } catch (e) {
        console.log("ERROR: " + e);

        return res.json({
            status: "failed",
            code: 2022,
            message: "Lấy danh sách thành viên thất bại!"
        });
    }
}