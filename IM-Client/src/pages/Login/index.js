import React, { Component } from 'react';
import { Form, Input, Button } from 'antd';
import { Navigate  } from "react-router-dom";
import './index.css'

export default class Login extends Component  {
    constructor ( props ) {
        super(props);
        this.state = {
            login: false
        }
    }

    onFinish = (values) => {
        values.password = this.$md5(values.password);
        // console.log(values.password)

        this.$axios.post("/login", values).then(
            res => {
                if(res.data.flag === true){
                    this.setState({
                        login: true
                    });
                }else{
                    // 登录失败提示, 这里加个提示弹窗
                    console.log(res.data.data);
                    console.log(res.data.message);
                }
            });
    };

    onFinishFailed = (errorInfo) => {
        console.log('Failed:', errorInfo);
    }
    
    render(){
        if(this.state.login){
            return <Navigate to='/homePage'/>
        }
        return (
            <div className='loginFrame'>
                <h1 style={{textAlign: "center",fontWeight: 'bolder', color: "#1890ff"}}>系统登录</h1>
                <Form
                    name='login' 
                    labelCol = {{span: 8,}} 
                    wrapperCol={{span: 16}} 
                    // initialValues={{remember: true,}}
                    onFinish={this.onFinish}
                    onFinishFailed={this.onFinishFailed}
                    autoComplete="off"
                >
                    <Form.Item
                        label="电子邮箱"
                        name="email"
                        rules={[
                            {
                                required: true,
                                message: 'Please input your email!',
                            },
                        ]}
                    >
                        <Input className='input' />
                    </Form.Item>
                    <Form.Item
                        label="密码"
                        name="password"
                        rules={[
                            {
                                required: true,
                                message: 'Please input your password!',
                            },
                        ]}
                    >
                        <Input.Password className='input' />
                    </Form.Item>
                    <Form.Item
                        wrapperCol={{
                            offset: 8,
                            span: 16,
                        }}
                >
                    <Button type="primary" htmlType="submit">
                        登录
                    </Button>
                    </Form.Item>
                </Form>
            </div>
        
        )
    }  
}