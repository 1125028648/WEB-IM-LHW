import React, { Component } from 'react';
import { Table, Popconfirm, Button, message, Input } from 'antd';

export default class FriendAddTable extends Component{

    constructor(props){
        super(props);

        this.state = {
            dataSource: [],
            value1: '',
            value2: '',
            friendList: [],
        }

        this.columns = [
            {
              title: 'Id',
              dataIndex: 'id',
            },
            {
              title: '昵称',
              dataIndex: 'nickname',
            },
            {
              title: '邮箱',
              dataIndex: 'email',
            },
            {
              title: '操作',
              key: 'operation',
              render: (text, record) => {
                  return this.state.dataSource.length >= 1 ? (
                    <div>
                        <Popconfirm title={`确认添加用户${record.nickname}为好友？`} okText="确认" cancelText="取消" onConfirm={() => this.handleAdd(record.key)}>
                            <Button type="link">添加</Button>
                        </Popconfirm>
                    </div>
                ) : null;
              },
            },
        ];
    }

    handleAdd = (key) => {
        let mlist = this.state.friendList;

        let flag = true;
        for(let i=0; i<mlist.length; i++){
            if(mlist[i].id === key){
                flag = false;
                break;
            }
        }

        if(flag){
            this.$axios({
                method: 'post',
                url: '/friends/examine/insert',
                data: {
                    userId: this.props.user.id,
                    friendId: key,
                }
            }).then(res => {
                if(res.data.flag === true){
                    message.success(res.data.message);
                }else{
                    message.error(res.data.message);
                }
            });
        }else{
            message.warning('不能重复添加好友');
        }
    }

    handleEmailChange= (event) =>{
        if(event && event.target && event.target.value){
            this.setState({
                value1: event.target.value,
            });
        }
    }

    handleNicknameChange= (event) =>{
        if(event && event.target && event.target.value){
            this.setState({
                value2: event.target.value,
            });
        }
    }

    onSearch=() =>{
        this.$axios({
            method: 'get',
            url: '/users/query/condition',
            params: {
                email: this.state.value1,
                nickname: this.state.value2,
            }
        }).then(res => {
            if(res.data.flag === true){
                res.data.data.forEach(element => {
                    element.key = element.id;
                });
                this.setState({
                    dataSource: res.data.data,
                });
            }else{
                message.error(res.data.message);
            }
        });
    }

    componentDidMount(){
        this.$axios({
            method: 'get',
            url: '/friends/list',
            params: {
                userId: this.props.user.id
            }
        }).then(res =>{
            if(res.data.flag === true){
                this.setState({
                    friendList: res.data.data,
                });
            }else{
                message.error(res.data.message);
            }
        });
    }

    render(){
        return (
            <div>
                <div style={{ marginBottom: 20}}>
                    <Input defaultValue={''} placeholder='电子邮箱' style={{ width: 150}} onChange={event => this.handleEmailChange(event)}/>
                    <Input defaultValue={''} placeholder='昵称' style={{ width: 150, marginLeft: 20 }} onChange={event => this.handleNicknameChange(event)}/>
                    <Button type='primary' onClick={() => {this.onSearch()}} style={{ marginLeft: 20 }}>查询</Button>
                </div>
                
                <Table columns={this.columns} dataSource={this.state.dataSource}/>
            </div>
        )
    }
}