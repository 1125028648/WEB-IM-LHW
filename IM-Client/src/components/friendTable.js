import React, { Component } from 'react';
import { Table, Popconfirm, Button, message, Avatar } from 'antd';
import Modal from 'antd/lib/modal/Modal';

export default class FriendTable extends Component{

    constructor(props){
        super(props);

        this.state = {
            dataSource: [],
            isModalVisible: false,
            modalUser: {
                nickname: 111,
                email: 222,
            },
        }

        this.columns = [
            {
              title: 'id',
              dataIndex: 'id',
            },
            {
              title: '昵称',
              dataIndex: 'nickname',
            },
            {
              title: '邮箱',
              dataIndex: 'email',
              width: '30%',
            },
            {
              title: '操作',
              key: 'operation',
              width: '40%',
              
              render: (text, record) => {
                  return this.state.dataSource.length >= 1 ? (
                    <div>
                        <Button type="link" onClick={() => this.showModal(record.key)}>信息</Button>
                        <Modal
                        title="用户信息" 
                        visible={this.state.isModalVisible}
                        onOk={this.handleOkModal}
                        onCancel={this.handleCancelModal} 
                        footer={[
                            <Button key="back" onClick={this.handleCancelModal}>返回</Button>
                        ]}
                        >
                            <Avatar src={"http://localhost:8000/users/images/" + this.state.modalUser.picture} size={100} style={{marginBottom: 20}}/>
                            <br/>
                            <p>昵称: {this.state.modalUser.nickname}</p>
                            <p>邮箱: {this.state.modalUser.email}</p>
                            <p>性别: {this.state.modalUser.sex}</p>
                            <p>生日: {this.state.modalUser.birthday}</p>
                        </Modal>
                        <Popconfirm title={`确认删除好友${this.state.modalUser.nickname}？`} okText="确认" cancelText="取消" onConfirm={() => this.handleDelete(record.key)}>
                            <Button type="link" style={{ color: 'red' }}>删除</Button>
                        </Popconfirm>
                        {record.selected ? <Button type="primary" onClick={this.sendMessage}>发消息</Button> : null}
                    </div>
                ) : null;
              },
            },
        ];
    }

    componentDidMount(){
        // 获取好友列表
        this.$axios({
            method: 'get',
            url: '/friends/list',
            params: {
                userId: this.props.user.id
            }
        }).then(res =>{
            if(res.data.flag === true){
                res.data.data.forEach(element => {
                    element.key = element.id;
                });
    
                this.setState({
                    dataSource: res.data.data
                });
            }else{
                message.error(res.data.message);
            }
            
        });
    }

    sendMessage = () => {
        
    }

    handleDelete = (key) => {
        this.$axios({
            method: 'post',
            url: '/friends/delete',
            data: {
                userId: this.props.user.id,
                friendId: key
            }
        }).then(res => {
            if(res.data.flag === true){
                const dataSource = [...this.state.dataSource];
                this.setState({ dataSource: dataSource.filter(item => item.key !== key) });
            }else{
                message.error(res.data.message);
            }
        })
    };

    showModal = (key) =>{
        this.$axios({
            method: 'get',
            url: '/friends/query',
            params: {
                userId: key
            }
        }).then(res =>{
            if(res.data.flag === true){
                if(res.data.data.sex === 1){
                    res.data.data.sex = '男';
                }else if(res.data.data.sex === 0){
                    res.data.data.sex = '女';
                }else{
                    res.data.data.sex = '未知';
                }
    
                if(res.data.data.birthday === null){
                    res.data.data.birthday = '未知';
                }
    
                this.setState({
                    isModalVisible: true,
                    modalUser: res.data.data,
                });
            }else{
                message.error(res.data.message);
            }
            
        });
    }

    handleOkModal = ()=>{
        this.setState({
            isModalVisible: false,
        });
    }

    handleCancelModal = ()=>{
        this.setState({
            isModalVisible: false,
        });
    }

    render(){
        return (
            <Table 
                columns={this.columns} 
                dataSource={this.state.dataSource}
                onRow={record => {
                    return {
                        onMouseEnter: event => {
                            record.selected = true;
                        },
                        onMouseLeave: event => {
                            record.selected = false;
                        }
                    }
                }}
            />
        )
    }
}