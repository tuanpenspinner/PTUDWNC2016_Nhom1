const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const typeSchema= mongoose.Schema({
    name: {type: String, required: true, enum: ["internal","transfer","receive"]},  //internal: nội bộ, transfer: gửi tiền đến ngân hàng khác: receive: nhận tiền từ ngân hàng khác
    bankCode: {type: String, default: "", required: true},
},{
    _id: false
});
const dealSchema = new Schema({
    receiverAccountNumber: { type: String, required: true },    //stk thanh toán của người nhận
    transfererAccountNumber: { type: String, required: true },  //stk thanh toán của người gửi
    time: {type: Date,default: null //thời gian chuyển tiền
        //, required: true
    },
    amount: { type: Number, required: true },   //số tiền gửi đi
    content: {type: String, trim: true},    //nội dung chuyển tiền
    isTransfered:{type: Boolean,default: false, required: true},    //check đã gửi
    type: {type:typeSchema, required: true},    //loại giao dịch
});

const Deal = mongoose.model('Deal', dealSchema, 'deals');
module.exports={
addDeal : async (receiverAccountNumber, transfererAccountNumber, time,amount,content,isTransfered,type) => {
    try {
        const deal = await Deal.create({receiverAccountNumber, transfererAccountNumber, time,amount,content,isTransfered,type});

        return deal;
    } catch (e) {
        console.log("ERROR: " + e);

        throw e;
    }
},
updateDeal : async (id, time, isTransfered)=>{
    try {
            const u = await Deal.findOneAndUpdate(
                {_id: id},
                { 'time': time },
                { 'isTransfered': isTransfered },
            );
        return u;
        // console.log('uupdate', u);
    } catch (err) {
        console.log('ERR', err.message);
    }
},
};