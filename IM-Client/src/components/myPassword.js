import React, { Component } from 'react';
import { Button, message, Input } from 'antd';

export default class MyPassword extends Component{

    constructor(props){
        super(props);
        this.state = {
            password: "",
            password2: "",
        }
    }

    handlePassord = (event) =>{
        if(event && event.target && event.target.value){
            this.setState({
                password: event.target.value,
            });
        }
    }

    handlePassord2 = (event) =>{
        if(event && event.target && event.target.value){
            this.setState({
                password2: event.target.value,
            });
        }
    }

    onSave = () => {
        if(this.state.password !== this.state.password2){
            message.warning("Password different");
        }else{
            let password = this.$md5(this.state.password);

            this.$axios({
                method: 'post',
                url: '/users/update/password',
                data: {
                    userid: this.props.user.id,
                    password: password,
                }
            }).then(res =>{
                if(res.data.flag === true){
                    message.success(res.data.message);
                }else{
                    message.error(res.data.error);
                }
            })
        }
    }

    render(){
        return (
            <div>
                <Input.Password
                    placeholder="输入新密码" 
                    value={this.state.password} 
                    onChange={event => this.handlePassord(event)} 
                    style={{width: 200}}
                />
                <Input.Password 
                    placeholder="确认新密码" 
                    value={this.state.password2} 
                    onChange={event => this.handlePassord2(event)} 
                    style={{width: 200, marginLeft: 20}}
                />
                <Button type='primary' onClick={() => {this.onSave()}} style={{marginLeft: 20}}>提交</Button>
            </div>
        )
    }
}