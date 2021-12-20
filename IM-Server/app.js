const Koa = require('koa');
const Router = require('koa-router');
const bodypaser = require('koa-bodyparser');
const mysqlConn = require('./src/DB/mysqlConn');
const usersMapper = require('./src/DB/usersMapper');
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
    let {email, password} = ctx.request.body;
    await usersMapper.userLogin(db, email, password).then(res =>{
        if(res.message === 'success'){
            ctx.session.user = email;
        }
        ctx.body = res;
    });
});

router.post('/register',async (ctx, next) =>{
    await usersMapper.insertUser(db, ctx.request.body).then(res=>{
        ctx.body = res;
    });
});

router.post('/test',async (ctx, next) => {
    if(ctx.session.user){
        ctx.body = 'Your have login.';
    }else{
        ctx.body = 'Please login before.'
    }
});

router.post('/exit',async (ctx, next) => {
    if(ctx.session.user){
        ctx.session = null;
    }
    ctx.body = 'logout.'
});

app.use(router.routes());
app.use(router.allowedMethods());

app.listen(8000);
console.log("starting at port 8000 ... ");