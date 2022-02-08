const Koa = require('koa');
const Router = require('koa-router');
const bodypaser = require('koa-bodyparser');
const mysqlConn = require('./src/DB/mysqlConn');
const usersMapper = require('./src/DB/usersMapper');
const friendMapper = require('./src/DB/friendMapper');
const session = require('koa-session');
var cors = require('koa-cors');

const app = new Koa();
const router = new Router();

// 数据库设置
db = mysqlConn.connect();

//跨域设置
app.use(async (ctx, next) => {
    ctx.set("Access-Control-Allow-Credentials", true)
    await next();
});

app.use(cors());

app.use(bodypaser());

// session设置
app.keys = ['this is my secret']
app.use(session({
    key: 'koa:sess',
    maxAge: 60 * 60 * 1000,
    overwrite: true,
    httpOnly: true,
    signed: true,
},app));


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

app.listen(8000);
console.log("starting at port 8000 ... ");