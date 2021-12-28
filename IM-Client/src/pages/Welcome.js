import { Link } from 'react-router-dom';

const Welcome = () => {
    return (
        <div>
            <h1 style={{textAlign:"center", marginTop: "10%"}}>Welcome !</h1>
            <br/>
            <Link to='/login' style={{fontSize: "24px", marginLeft: "37%", color: "blue"}}>登录首页</Link>
        </div>
    )
}

export default Welcome;