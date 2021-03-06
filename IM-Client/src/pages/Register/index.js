import React, { Component } from 'react';
import { Form, Input, Button, message } from 'antd';
import { Navigate} from "react-router-dom";
import '../../styles/register.css';

export default class Register extends Component  {
    constructor ( props ) {
        super(props);
        this.state = {
            register: false,
            toLogin: false,
        }
    }

    // 提交成功
    onFinish = (values) => {
        values.password = this.$md5(values.password);
        values.confirmpwd = this.$md5(values.confirmpwd);

        this.$axios.post("/register", values).then(
            res => {
                if(res.data.flag === true){
                    this.setState({
                        register: true
                    });
                }else{
                    message.error(res.data.message);
                }
            });
    };

    onLogin = () => {
        this.setState( {
            toLogin: true,
        })
    }
    
    render(){
        if(this.state.register || this.state.toLogin){
            return <Navigate to='/login'/>
        }
        return (
            <div className='RegisterBackground'>
                <div className='RegisterFrame'>
                    <h1 style={{textAlign: "center",fontWeight: 'bolder', color: "#1890ff"}}>用户注册</h1>
                    <Form
                        name='register' 
                        labelCol = {{span: 7}} 
                        wrapperCol={{span: 12}} 
                        onFinish={this.onFinish}
                        autoComplete="off"
                    >
                        <Form.Item
                            label="邮箱"
                            name="email"
                            rules={[
                                {
                                    required: true,
                                    message: '请输入邮箱',
                                },
                                {
                                    type:'email',
                                    message:'请输入正确的邮箱地址',
                                },
                            ]}
                            hasFeedback
                        >
                            <Input className='input' />
                        </Form.Item>

                        <Form.Item
                            label="密码"
                            name="password"
                            rules={[
                                {
                                    required: true,
                                    message: '请输入密码',
                                },
                            ]}
                            hasFeedback
                        >
                            <Input.Password className='input' />
                        </Form.Item>

                        <Form.Item
                            label="确认密码"
                            name="confirmpwd"
                            dependencies={['password']}
                            rules={[
                                {
                                    required: true,
                                    message: '请再次输入密码',
                                },
                                ({getFieldValue}) => ({
                                    validator(_,value){
                                        if(!value || getFieldValue('password') === value){
                                            return Promise.resolve();
                                        }
                                        return Promise.reject(new Error('两次密码不一致！'));
                                    },
                                }),
                            ]}
                            hasFeedback
                        >
                            <Input.Password className='input' />
                        </Form.Item>

                        <Form.Item
                            label="昵称"
                            name="nickname"
                            rules={[
                                {
                                    required: true,
                                    message: '请输入昵称',
                                },
                            ]}
                            hasFeedback
                        >
                            <Input className='input' />
                        </Form.Item>

                        <Form.Item
                            wrapperCol={{
                                offset: 8,
                                span: 16,
                            }}
                    >
                        <Button type="primary" htmlType="submit" className='buttonRegister'>
                            注册
                        </Button>

                        <Button type="text" ghost className='linkLogin' size='small' onClick={this.onLogin}>返回登录</Button>
                        </Form.Item>
                    </Form>
                </div>
            </div>
        )
    }  
}