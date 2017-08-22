var mongoose = require('mongoose');
var Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

var fangwenScheMa = new Schema({
    nick_name: String,
    fwrq: Date,
    levelname: String,
    pingtai: String
});

module.exports = fangwenScheMa;