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
              title: 'Nickname',
              dataIndex: 'nickname',
            },
            {
              title: 'Email',
              dataIndex: 'email',
            },
            {
              title: 'Operation',
              key: 'operation',
              render: (text, record) => {
                  return this.state.dataSource.length >= 1 ? (
                    <div>
                        <Popconfirm title="Sure to Add?" onConfirm={() => this.handleAdd(record.key)}>
                            <Button type="link">Add</Button>
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
            message.warning('have added before');
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
                <div style={{ marginBottom: '20px'}}>
                    <Input defaultValue={''} placeholder='email' style={{ width: '150px'}} onChange={event => this.handleEmailChange(event)}/>
                    <Input defaultValue={''} placeholder='nickname' style={{ width: '150px', marginLeft: '20px' }} onChange={event => this.handleNicknameChange(event)}/>
                    <Button type='primary' onClick={() => {this.onSearch()}} style={{ marginLeft: '20px' }}>Search</Button>
                </div>
                
                <Table columns={this.columns} dataSource={this.state.dataSource}/>
            </div>
        )
    }
}