const Koa = require('koa');
const app = new Koa();

const server = require('http').createServer(app.callback());
const io = require('socket.io')(server, { cors: true });

const Router = require('koa-router');
const bodypaser = require('koa-bodyparser');
const mysqlConn = require('./src/DB/mysqlConn');
const usersMapper = require('./src/DB/usersMapper');
const friendMapper = require('./src/DB/friendMapper');
const roomMapper = require('./src/DB/roomMapper');
const emoMapper = require('./src/DB/emoMapper');
const session = require('koa-session');
var cors = require('koa-cors');

const multer = require('koa-multer');

const fs = require('fs');
const path = require('path');
const mime = require('mime-types');

const router = new Router();

// 数据库设置
db = mysqlConn.connect();

//跨域设置
app.use(async (ctx, next) => {
    ctx.set("Access-Control-Allow-Credentials", true);
    // ctx.set('Access-Control-Allow-Origin', '*'); 
    await next();
});

app.use(cors());

app.use(bodypaser());

// session设置
app.keys = ['this is my secret']
app.use(session({
    key: 'koa:sess',
    maxAge: 60 * 60 * 1000 * 24,
    overwrite: true,
    httpOnly: true,
    signed: true,
},app));

// 图片上传
var storage = multer.diskStorage({
    // 文件保存路径
    destination: function(req, file, cb){
        cb(null, 'src/uploads/')
    },
    // 修改文件名称
    filename: function(req, file, cb){
        var fileFormat = (file.originalname).split(".");
        cb(null, Date.now() + "." + fileFormat[fileFormat.length - 1]);
    }
});

// 加载配置
var upload = multer({
    storage: storage
});

// 表情包上传
var storageEmo = multer.diskStorage({
    // 文件保存路径
    destination: function(req, file, cb){
        cb(null, 'src/emo/')
    },
    // 修改文件名称
    filename: function(req, file, cb){
        var fileFormat = (file.originalname).split(".");
        cb(null, Date.now() + "." + fileFormat[fileFormat.length - 1]);
    }
});

var uploadEmo = multer({
    storage: storageEmo
});

// 路由设置
router.get('/', async (ctx, next) => {
    ctx.body = "hello world";
});

router.post('/login', async (ctx, next) =>{
    let {email, password, remember} = ctx.request.body;
    await usersMapper.userLogin(db, email, password).then(res =>{
        if(res.message === 'success'){
            ctx.session.user = res.data;
        }
        ctx.body = res;
    });
});

router.post('/register',async (ctx, next) =>{
    await usersMapper.insertUser(db, ctx.request.body).then(res=>{
        ctx.body = res;
    });
});

router.get('/user', async (ctx, next) =>{
    var res = {
        flag: false,
        message: 'Please login first.'
    }

    if(ctx.session.user){
        res.flag = true;
        res.message = 'success';
        res.data = ctx.session.user;
    }
    ctx.body = res;
});

// 修改个人信息
router.post('/users/update/info', async (ctx, next) =>{
    var res = {
        flag: false,
        message: 'Please login first.'
    }

    if(ctx.session.user){
        await usersMapper.updateUserInfo(db, ctx.request.body).then(res=>{
            ctx.body = res;
            ctx.session.user = ctx.request.body;
        });
    }else{
        ctx.body = res;
    }
});

// 修改密码
router.post('/users/update/password', async (ctx, next) =>{
    var res = {
        flag: false,
        message: 'Please login first.'
    }

    if(ctx.session.user){
        await usersMapper.updatePassword(db, ctx.request.body.userid, ctx.request.body.password).then(res=>{
            ctx.body = res;
        });
    }else{
        ctx.body = res;
    }
});

// 图片请求
router.get('/users/images/:name', async(ctx, next) =>{
    let filePath = path.join(__dirname, '/src/uploads/' + ctx.params.name);
    let file = null;
    try{
        // 读取文件
        file = fs.readFileSync(filePath);
    }catch(error){
        // 如果不存在图片，返回默认图片
        filePath = path.join(__dirname, '/src/uploads/default.jpeg');
        file = fs.readFileSync(filePath);
    }

    let mimeType = mime.lookup(filePath);
    ctx.set('content-type', mimeType);
    ctx.body = file;
});

// 表情包请求
router.get('/users/emo/:name', async(ctx, next) =>{
    let filePath = path.join(__dirname, '/src/emo/' + ctx.params.name);
    let file = null;
    try{
        // 读取文件
        file = fs.readFileSync(filePath);
    }catch(error){
        // 如果不存在图片，返回默认图片
        filePath = path.join(__dirname, '/src/emo/default.jpeg');
        file = fs.readFileSync(filePath);
    }

    let mimeType = mime.lookup(filePath);
    ctx.set('content-type', mimeType);
    ctx.body = file;
});

// 好友列表
router.get('/friends/list', async (ctx, next) =>{
    var res = {
        flag: false,
        message: 'Please login first.'
    }

    if(ctx.session.user){
        await friendMapper.queryFriends(db, ctx.request.query.userId).then(response =>{
            ctx.body = response;
        });
    }else{
        ctx.body = res;
    }
});

// 好友详情
router.get('/friends/query', async (ctx, next) => {
    var res = {
        flag: false,
        message: 'Please login first.'
    }

    if(ctx.session.user){
        await usersMapper.queryUser(db, ctx.request.query.userId).then(response =>{
            ctx.body = response;
        });
    }else{
        ctx.body = res;
    }
});

// 条件查询用户
router.get('/users/query/condition', async (ctx, next) => {
    var res = {
        flag: false,
        message: 'Please login first.'
    }

    if(ctx.session.user){
        await usersMapper.queryUsersByConditions(db, ctx.request.query).then(response =>{
            ctx.body = response;
        });
    }else{
        ctx.body = res;
    }
});

// 查询好友申请记录
router.get('/friends/examine/query', async (ctx, next) => {
    var res = {
        flag: false,
        message: 'Please login first.'
    }

    if(ctx.session.user){
        await friendMapper.queryFriendExamine(db, ctx.request.query.userId).then(response =>{
            ctx.body = response;
        });
    }else{
        ctx.body = res;
    }
})

// 添加好友审核记录
router.post('/friends/examine/insert', async (ctx, next) =>{
    var res = {
        flag: false,
        message: 'Please login first.'
    }

    if(ctx.session.user){
        let {userId, friendId} = ctx.request.body;
        await friendMapper.addFriendExamine(db, userId, friendId).then(response =>{
            ctx.body = response;
        });
    }else{
        ctx.body = res;
    }
})

// 修改好友审核表
router.get('/friends/examine/update', async (ctx, next) => {
    var res = {
        flag: false,
        message: 'Please login first.'
    }

    if(ctx.session.user){
        await friendMapper.updateFriendExamine(db, ctx.request.query.exId).then(response =>{
            ctx.body = response;
        });
    }else{
        ctx.body = res;
    }
});

// 添加好友记录
router.post('/friends/insert', async (ctx, next) => {
    var res = {
        flag: false,
        message: 'Please login first.'
    }

    if(ctx.session.user){
        let {userId, friendId} = ctx.request.body;
        await friendMapper.addFriend(db, userId, friendId).then(response =>{
            ctx.body = response;
        });
    }else{
        ctx.body = res;
    }
});

// 删除好友
router.post('/friends/delete', async (ctx, next) => {
    var res = {
        flag: false,
        message: 'Please login first.'
    }

    if(ctx.session.user){
        let {userId, friendId} = ctx.request.body;
        await friendMapper.deleteFriend(db, userId, friendId).then(response =>{
            ctx.body = response;
        });
    }else{
        ctx.body = res;
    }
});

// 图片上传
router.post('/upload', upload.single('avatar'), async(ctx, next) => {
    ctx.body = {
        filename: ctx.req.file.filename
    }
});

// 上传表情包并保存记录
router.post('/uploadEmo', uploadEmo.single('emo'), async(ctx, next) =>{

    let {id} = ctx.session.user;

    await emoMapper.addEmo(db, id, ctx.req.file.filename).then(res =>{
        ctx.body = {
            filename: ctx.req.file.filename,
            flag: true,
            message: 'success',
        }
    });
});

// 表情包查询
router.get('/query/emo', async (ctx, next) =>{
    var res = {
        flag: false,
        message: 'Please login first.'
    }

    if(ctx.session.user){
        await emoMapper.queryEmo(db, ctx.request.query.userId).then(response =>{
            ctx.body = response;
        });
    }else{
        ctx.body = res;
    }
});

// 表情包删除
router.get('/query/emo/delete', async (ctx, next) =>{
    var res = {
        flag: false,
        message: 'Please login first.'
    }

    if(ctx.session.user){
        let {userId, emoName} = ctx.request.query;
        await emoMapper.deleteEmo(db, userId, emoName).then(response =>{
            ctx.body = response;
        });
    }else{
        ctx.body = res;
    } 
})

// 查询已加入 room
router.get('/rooms/query', async (ctx, next) =>{
    var res = {
        flag: false,
        message: 'Please login first.'
    }

    if(ctx.session.user){
        await roomMapper.queryRoom(db, ctx.request.query.userId).then(response =>{
            ctx.body = response;
        });
    }else{
        ctx.body = res;
    }
});

// 查询群列表
router.get('/rooms/query/list', async (ctx, next) =>{
    var res = {
        flag: false,
        message: 'Please login first.'
    }

    if(ctx.session.user){
        await roomMapper.queryRoomList(db, ctx.request.query.userId).then(response =>{
            ctx.body = response;
        });
    }else{
        ctx.body = res;
    }
});

// 查询群详情（成员）
router.get('/rooms/query/member', async (ctx, next) =>{
    var res = {
        flag: false,
        message: 'Please login first.'
    }

    if(ctx.session.user){
        await roomMapper.queryRoomMember(db, ctx.request.query.roomId).then(response =>{
            ctx.body = response;
        });
    }else{
        ctx.body = res;
    }
});

// 创建群
router.post('/rooms/create', async (ctx, next) =>{
    var res = {
        flag: false,
        message: 'Please login first.'
    }

    if(ctx.session.user){
        let {userId, roomName} = ctx.request.body;
        await roomMapper.createRoom(db, userId, roomName).then(response =>{
            ctx.body = response;
        });
    }else{
        ctx.body = res;
    }
});

// 模糊查找群
router.get('/rooms/query/condition', async (ctx, next) =>{
    var res = {
        flag: false,
        message: 'Please login first.'
    }

    if(ctx.session.user){
        await roomMapper.queryRoomByName(db, ctx.request.query.roomName).then(response =>{
            ctx.body = response;
        });
    }else{
        ctx.body = res;
    }
})

// 添加申请
router.post('/rooms/examine/insert', async (ctx, next) =>{
    var res = {
        flag: false,
        message: 'Please login first.'
    }

    if(ctx.session.user){
        let {userId, roomId, creatorId} = ctx.request.body;
        await roomMapper.addRoomExamine(db, userId, roomId, creatorId).then(response =>{
            ctx.body = response;
        });
    }else{
        ctx.body = res;
    }
});

// 查询群审核列表
router.get('/rooms/examine/query', async (ctx, next) =>{
    var res = {
        flag: false,
        message: 'Please login first.'
    }

    if(ctx.session.user){
        await roomMapper.queryRoomExamine(db, ctx.request.query.userId).then(response =>{
            ctx.body = response;
        });
    }else{
        ctx.body = res;
    }
});

// 处理群申请-拒绝
router.post('/rooms/examine/update', async (ctx, next) =>{
    var res = {
        flag: false,
        message: 'Please login first.'
    }

    if(ctx.session.user){
        await roomMapper.updateRoomExamine(db, ctx.request.body.exid).then(response =>{
            ctx.body = response;
        });
    }else{
        ctx.body = res;
    }
})

// 处理群申请-同意
router.post('/rooms/examine/agree', async (ctx, next) =>{
    var res = {
        flag: false,
        message: 'Please login first.'
    }

    if(ctx.session.user){
        let {exid, roomId, sendId} = ctx.request.body;
        await roomMapper.updateRoomExamine(db, exid);
        await roomMapper.agreeRoomExamine(db, roomId, sendId).then(response =>{
            ctx.body = response;
        })
    }else{
        ctx.body = res;
    }
});

// 退群
router.post('/rooms/exit', async (ctx, next) =>{
    var res = {
        flag: false,
        message: 'Please login first.'
    }

    if(ctx.session.user){
        let {roomId, userId} = ctx.request.body;
        await roomMapper.exitRoom(db, roomId, userId).then(response =>{
            ctx.body = response;
        })
    }else{
        ctx.body = res;
    }
});

// 群主删除群
router.post('/rooms/delete', async (ctx, next) =>{
    var res = {
        flag: false,
        message: 'Please login first.'
    }
    console.log(ctx.request.body)
    if(ctx.session.user){
        let {roomId, userId} = ctx.request.body;
        await roomMapper.deleteRoom(db, userId, roomId).then(response =>{
            ctx.body = response;
        })
    }else{
        ctx.body = res;
    }
});

// 查询用户未读消息数
router.get('/rooms/noread/count', async (ctx, next) =>{
    var res = {
        flag: false,
        message: 'Please login first.'
    }

    if(ctx.session.user){
        await roomMapper.queryRoomNoReadCount(db, ctx.request.query.userId).then(response =>{
            ctx.body = response;
        });
    }else{
        ctx.body = res;
    }
})

// 测试
router.post('/test',async (ctx, next) => {
    var res = {
        flag: false,
        message: 'Please login first.'
    }
    
    if(ctx.session.user){
        res.flag = true;
        res.message = 'Your have logged in.';
        ctx.body = res;
    }else{
        ctx.body = res;
    }
});


// 登出
router.post('/exit',async (ctx, next) => {
    if(ctx.session.user){
        await usersMapper.exitUser(db, ctx.session.user.id).then(res => {
            if(ctx.session.user){
                ctx.session = null;
            }
            ctx.body = res;
        });
    }else{
        var res = {
            flag: false,
            message: 'Please login first.'
        }
        ctx.body = res;
    }
});

app.use(router.routes());
app.use(router.allowedMethods());

// app.listen(8000);
var hashName = new Array();  // k: socketid v: userid
// var currRoom = new Array();  // k: userid v: roomid

io.on('connection', (socket) => {
    socket.on('updateUserId', userId => {
        console.log(`connect: ${userId}`);
        hashName[socket.id] =  userId;
        // currRoom[data.userId] = -1;
        usersMapper.updateSocketId(db, userId, socket.id);

        //获取用户加入的房间数据
        roomMapper.queryRoom(db, userId).then(res =>{
            if(res.flag){
                let rooms = res.data;
                for(let room of rooms){
                    socket.join(String(room.room_id));
                }

                socket.on('sendMessage', function(message){
                    socket.to(message.room).emit('newMessage', message);
                    roomMapper.receiveMessage(db, message);
                });
            
                //获取房间里的消息
                socket.on('queryRoomMessages', roomInfo => {
                    roomMapper.queryRoomMessages(db, roomInfo).then( roomMessages => {
                        socket.emit('updateRoomMessages', roomMessages); //传送房间数据
                    })
                })

                //获取所有房间未读消息数
                socket.on('queryRoomsUnreadCount', userId => {
                    roomMapper.queryRoomNoReadCount(db, userId).then( res => {
                        socket.emit('updateRoomsUnreadCount', res);
                    })
                })
            }
        });
    });

    socket.on('disconnect', function(){
        console.log('disconnected: ' + hashName[socket.id]);
        usersMapper.exitUser(db, hashName[socket.id]);
    });

});

server.listen(8000, () => {
    console.log('starting at port 8000 ... ');
});