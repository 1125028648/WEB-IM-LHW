import { Link } from 'react-router-dom';

const Welcome = () => {
    return (
        <div>
            <span>Welcome !</span>
            <br/>
            <Link to='/login'>登录首页</Link>
        </div>
    )
}

export default Welcome;