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
})

// 加载配置
var upload = multer({
    storage: storage
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
        message: 'Please login before.'
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
        message: 'Please login before.'
    }

    if(ctx.session.user){
        await usersMapper.updateUserInfo(db, ctx.request.body).then(res=>{
            ctx.body = res;
        });
    }else{
        ctx.body = res;
    }
});

// 修改密码
router.post('/users/update/password', async (ctx, next) =>{
    var res = {
        flag: false,
        message: 'Please login before.'
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

// 好友列表
router.get('/friends/list', async (ctx, next) =>{
    var res = {
        flag: false,
        message: 'Please login before.'
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
        message: 'Please login before.'
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
        message: 'Please login before.'
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
        message: 'Please login before.'
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
        message: 'Please login before.'
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
        message: 'Please login before.'
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
        message: 'Please login before.'
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
        message: 'Please login before.'
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

// 查询已加入 room
router.get('/rooms/query', async (ctx, next) =>{
    var res = {
        flag: false,
        message: 'Please login before.'
    }

    if(ctx.session.user){
        await roomMapper.queryRoom(db, ctx.request.query.userId).then(response =>{
            ctx.body = response;
        });
    }else{
        ctx.body = res;
    }
});

// 测试
router.post('/test',async (ctx, next) => {
    var res = {
        flag: false,
        message: 'Please login before.'
    }
    
    if(ctx.session.user){
        res.flag = true;
        res.message = 'Your have login.';
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
            message: 'Please login before.'
        }
        ctx.body = res;
    }
});

app.use(router.routes());
app.use(router.allowedMethods());

// app.listen(8000);
// 单聊
var hashName = new Array();  // k: socketid v: userid

io.on('connection', (socket) => {
    console.log('已连接');

    socket.emit('getSocketId', {
        socketId: socket.id
    });

    socket.on('updateSocketId', data => {
        hashName[socket.id] =  data.userId;
        usersMapper.updateSocketId(db, data.userId, data.socketId);

        roomMapper.queryRoom(db, data.userId).then(res =>{
            if(res.flag){
                let rooms = res.data;
                for(let i=0; i<rooms.length; i++){
                    socket.join(rooms[i].room_id);
                }
            }
        });
    });

    socket.on('message', function(message){
        socket.broadcast.to(message.roomId).emit('message', message);
        roomMapper.receiveMessage(db, message);
    });

    socket.on('disconnect', function(){
        console.log('断开一个连接' + hashName[socket.id]);
        usersMapper.exitUser(db, hashName[socket.id]);
    });
});

server.listen(8000, () => {
    console.log('starting at port 8000 ... ');
});