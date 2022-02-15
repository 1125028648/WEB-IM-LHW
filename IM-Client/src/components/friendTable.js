import React, { Component } from 'react';
import { Table, Popconfirm, Button, message, Avatar } from 'antd';
import { UserOutlined } from '@ant-design/icons';
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
                        <Button type="link" onClick={() => this.showModal(record.key)}>Details</Button>
                        <Modal
                        title="Details" 
                        visible={this.state.isModalVisible}
                        onOk={this.handleOkModal}
                        onCancel={this.handleCancelModal} 
                        footer={[
                            <Button key="back" onClick={this.handleCancelModal}>Back</Button>
                        ]}
                        >
                            <Avatar size="large" icon={<UserOutlined />} />
                            <p>Nickname: {this.state.modalUser.nickname}</p>
                            <p>Email: {this.state.modalUser.email}</p>
                            <p>Sex: {this.state.modalUser.sex}</p>
                            <p>Birthday: {this.state.modalUser.birthday}</p>
                        </Modal>
                        <Popconfirm title="Sure to delete?" onConfirm={() => this.handleDelete(record.key)}>
                            <Button type="link" style={{ color: 'red' }}>Delete</Button>
                        </Popconfirm>
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
            <Table columns={this.columns} dataSource={this.state.dataSource}/>
        )
    }
}