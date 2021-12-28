import React, { Component } from 'react';
import { Form, Input, Button, Checkbox } from 'antd';
import './index.css'
import response from 'koa/lib/response';

export default class Login extends Component  {
    state = {
        email: "",
        password: "",
    }

    onFinish = (values) => {
        values.password = this.$md5(values.password);
        console.log(values.password)
        this.$axios.post("http://localhost:8000/login", values).then(
            response => {
                console.log("response:", response);
            }).catch(
                err => console.log(err)
            )
    };

    onFinishFailed = (errorInfo) => {
        console.log('Failed:', errorInfo);
    }
    
    render(){
        return (
            <div className='loginFrame'>
                <h1 style={{textAlign: "center",fontWeight: 'bolder', color: "#1890ff"}}>系统登录</h1>
                <Form
                    name='login' 
                    labelCol = {{span: 8,}} 
                    wrapperCol={{span: 16}} 
                    initialValues={{remember: true,}}
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
                        name="remember"
                        valuePropName="checked"
                        wrapperCol={{
                            offset: 8,
                            span: 16,
                        }}
                    >
                        <Checkbox>记住我</Checkbox>
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