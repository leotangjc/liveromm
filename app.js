var express = require('express');
//用于处理路径
var path = require('path');
//请求网页的logo
var favicon = require('serve-favicon');
//在控制台中，显示req请求的信息
var logger = require('morgan');
//cookieParser中间件用于获取web浏览器发送的cookie中的内容
var cookieParser = require('cookie-parser');
//用于解析客户端请求的body中的内容,内部使用JSON编码处理,url编码处理以及对于文件的上传处理。
var bodyParser = require('body-parser');
var swagger = require('./routes/swagger');

//引入路由
var routes = require('./routes/index');
var users = require('./routes/users');
var admin = require('./routes/admin');

//引入express
var app = express();

//引入db、http及socket服务
var db = require('./model/index');
var http = require('http').Server(express);
var io = require('socket.io')(http);
// 设置视图引擎
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.engine('ejs', require('ejs-mate'));
// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
//找到静态文件的绝对路径
app.use(express.static(path.join(__dirname, 'public')));
// 设置路由前缀
app.use('/', users);
app.use('/users', users);
app.use('/admin', admin);
app.use('/swagger', swagger);
//在线用户
global.onlineUsers = {};
//当前在线人数
global.onlineCount = 0;

//通信处理
io.on('connection', function (socket) {
    console.log('a user connected');

    //监听新用户加入
    socket.on('login', function (obj) {
        //将新加入用户的唯一标识当作socket的名称，后面退出的时候会用到
        socket.name = obj._id;
        //检查在线列表，如果不在里面就加入
        if (!global.onlineUsers.hasOwnProperty(obj._id)) {
            global.onlineUsers[obj._id] = {nick_name: obj.nick_name, level: obj.level, userid : obj._id};
            //在线人数+1
            global.onlineCount++;
        }


        //向所有客户端广播用户加入
        io.emit('login', {onlineUsers: global.onlineUsers, onlineCount: global.onlineCount, user: obj});
        console.log(obj.username + '加入了聊天室');
    });

    //监听用户退出
    socket.on('disconnect', function () {
        //将退出的用户从在线列表中删除
        if (onlineUsers.hasOwnProperty(socket.name)) {
            //退出用户的信息
            var obj = {userid: socket.name, nick_name: onlineUsers[socket.name].nick_name};

            //删除
            delete onlineUsers[socket.name];
            //在线人数-1
            onlineCount--;

            //向所有客户端广播用户退出
            io.emit('logout', {onlineUsers: onlineUsers, onlineCount: onlineCount, user: obj});
            console.log(obj.username + '退出了聊天室');
        }
    });

    //发布公告
    socket.on('fabugonggao', function (obj) {
        io.emit('fabugonggao', obj);
        console.log(obj.gonggao);
    });
    //发布喊单
    socket.on('fabuhandan', function (obj) {
        io.emit('fabuhandan', obj);
        console.log(obj);
    });

    //消息通过
    socket.on('passmessage', function (obj) {

        //通过消息 type置1
        console.log("pass");
        db.messages.update({'msgid': obj}, {
            $set: {
                type: 1
            }
        }, function (err) {
        });

        //查询本条消息并发送
        db.messages.find({'msgid': obj}, function (err, result) {
            var pass= {
                level:result[0].level,
                content:result[0].content,
                msgid:result[0].msgid,
                type:4,   //游客审核
                ip:result[0].ip,
                date:result[0].date,
                sendTo:result[0].sendTo,
                sendToName:result[0].sendToName,
                username:result[0].username,
                userid:result[0].userid
            };
            io.emit('message', pass);
            console.log(pass);
    })

});

//删除消息
socket.on('delmessage', function (obj) {

    //删除消息 type置2
    console.log("delete");
    //对服务器端数据进行更新
    db.messages.update({'msgid': obj}, {
        $set: {
            type: 2
        }
    }, function (err) {
    });

    //返回已经删除的消息
    io.emit('delmessage', obj);
    console.log(obj);
});

//发布审核
  //接收这个广播，并拿到里面的对象数据
socket.on('checkmessage', function (obj) {
    var robot = new db.messages(obj);
    robot.save(function (err) {
        if (err) // ...
            console.log('meow');
    });

    //如果对象里的'level'值为66，就在服务器中更新一个数据
    if (obj.level == "66") {
        console.log("pass");
        db.messages.update({'msgid': obj.msgid}, {
            $set: {
                type: 1
            }
        }, function (err) {
        });

        io.emit('message', obj);
    }
    else {
        io.emit('check_message', obj);
        //io.emit('checkmessages', obj);
    }
    //console.log(obj);
});

//监听用户发布聊天内容
socket.on('message', function (obj) {
    //向所有客户端广播发布的消息
    // obj.username = u.nick_name;
    // obj.level = u.level
    //type 0 审核
    //type 1 通过;
    //type 2 驳回
    //if (obj.level == 78) {
    //    console.log("cancel");
    //    db.messages.update({'msgid': obj.msgid}, {
    //        $set: {
    //            type: 2
    //        }
    //    }, function (err) {
    //    });
    //
    //}
    //else {
    //    console.log("pass");
    //    db.messages.update({'msgid': obj.msgid}, {
    //        $set: {
    //            type: 1
    //        }
    //    }, function (err) {
    //    });
    //    console.log(obj.msgid);
    //    console.log(obj.level);
    //    io.emit('message', obj);
    //    console.log(obj.username + '说：' + obj.content);
    //}

    //保存消息
    var robot = new db.messages(obj);
    robot.save(function (err) {
        if (err) // ...
            console.log('meow');
    });

    //消息默认通过 type/1
    //console.log("pass");
    //db.messages.update({'msgid': obj.msgid}, {
    //    $set: {
    //        type: 0
    //    }
    //}, function (err) {
    //});
    io.emit('message', obj);
    console.log(obj.username + '说：' + obj.content);
});

})
;

//http服务器指定的端口
// catch 404 and forward to error handler
//设置链接发生错误后，返回的错误码
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
