import { Link } from 'react-router-dom';
import '../../styles/login.css';

const Welcome = () => {
    return (
        <div className='loginBackground'>
            <h1 style={{textAlign:"center", marginTop: "10%"}}>Welcome !</h1>
            <br/>
            <Link to='/login' style={{fontSize: "24px", marginLeft: "37%", color: "blue"}}>登录首页</Link>
            <br/>
            <Link to='/register' style={{fontSize: "24px", marginLeft: "37%", color: "blue"}}>注册账号</Link>
        </div>
    )
}

export default Welcome;