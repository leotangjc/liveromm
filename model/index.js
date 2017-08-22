/**
 * Created by XYJ on 2016/2/26 0026.
 */
//请求连接到mongo
var mongoose = require('mongoose');
//定义mongo组件，并设置服务器位置，
var db = mongoose.connect('mongodb://127.0.0.1:27017/live',function(err){console.log(err)});//���������ݿ�

exports.users = mongoose.model('users', require('./user'));
exports.options = mongoose.model('options', require('./options'));
exports.handan = mongoose.model('handan', require('./handan'));
exports.messages = mongoose.model('messages', require('./messages'));
exports.fangwens = mongoose.model('fangwens', require('./fangwen'));
