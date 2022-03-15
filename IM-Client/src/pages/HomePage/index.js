import React, { Component } from 'react';
import io from 'socket.io-client';
import { Layout, Menu, Avatar } from 'antd';
import { Navigate } from "react-router-dom";
import { UserOutlined, LaptopOutlined, NotificationOutlined } from '@ant-design/icons';
import '../../styles/homePage.css';

import FriendTable from '../../components/friendTable';
import FriendAddTable from '../../components/friendAddTable';
import FriendExamineTable from '../../components/friendExamineTable';
import MyInformation from '../../components/myInformation';
import MyPassword from '../../components/myPassword';

const { SubMenu } = Menu;
const { Header, Content, Sider } = Layout;

export default class HomePage extends Component{

    constructor(props){
        super(props);
        this.state = {
            user: {
                id: null,
                nickname: "",
                email: "",
                birthday: "",
                sex: null,
                picture: "default.jpeg",
            },
            menuSelectKey: '',
            isLogin: false,
        }

        this.onMenuFunction = this.onMenuFunction.bind(this);
    }

    componentDidMount(){
        // 获取用户信息
        this.$axios.get('/user').then(res =>{
            if(res.data.flag === true){
                this.setState({
                    user: res.data.data
                });
            }else{
                this.setState({
                    isLogin: true,
                });
                return;
            }
            

            // 连接服务器 socket 服务
            const socket = io('ws://localhost:8000');
            console.log('已连接');

            socket.on('getSocketId', data => {
                socket.emit('updateSocketId', {
                    userId: res.data.data.id,
                    socketId: data.socketId
                });
            });
        });
    }

    onMenuFunction(values){
        this.setState({
            menuSelectKey: values.key,
        });
    }

    refreshPage = newUserInfo => {
        this.setState({
            user: newUserInfo,
        })
    }

    render(){
        if(this.state.isLogin){
            return <Navigate to='/login'/>
        }

        const fileUrl = "http://localhost:8000/users/images/" + this.state.user.picture;
        console.log(fileUrl);

        return (
            <Layout className='homePage'>
                <Header className='header'>
                    <Avatar size={40} src={fileUrl} />
                </Header>
                <Layout>
                    <Sider width={200} className='site-layout-background'>
                        <Menu
                        mode='inline'
                        defaultSelectedKeys={['1']}
                        defaultOpenKeys={['sub1']}
                        style={{ height: '100%', borderRight: 0}}
                        onClick={this.onMenuFunction}
                        >
                            <SubMenu key='sub1' icon={<UserOutlined/>} title='会话管理'>
                                <Menu.Item key='1'>消息窗口1</Menu.Item>
                                <Menu.Item key='2'>消息窗口2</Menu.Item>
                                <Menu.Item key='3'>消息窗口3</Menu.Item>
                                <Menu.Item key='4'>消息窗口4</Menu.Item>
                            </SubMenu>
                            <SubMenu key="sub2" icon={<LaptopOutlined />} title="好友管理">
                                <Menu.Item key='5'>好友列表</Menu.Item>
                                <Menu.Item key="6">添加好友</Menu.Item>
                                <Menu.Item key="7">好友审核</Menu.Item>
                            </SubMenu>
                            <SubMenu key="sub3" icon={<NotificationOutlined />} title="个人设置">
                                <Menu.Item key="9">个人信息</Menu.Item>
                                <Menu.Item key="10">密码修改</Menu.Item>
                            </SubMenu>
                        </Menu>
                    </Sider>
                    <Layout style={{ padding: '24px 24px' }}>
                        <Content 
                        className='site-layout-background'
                        style={{
                            padding: 24,
                            margin: 0,
                            minHeight: 280,
                        }}
                        >
                            {this.state.menuSelectKey === '5' ? <FriendTable user={this.state.user}/> : null}
                            {this.state.menuSelectKey === '6' ? <FriendAddTable user={this.state.user} /> : null}
                            {this.state.menuSelectKey === '7' ? <FriendExamineTable user={this.state.user}/> : null}
                            {this.state.menuSelectKey === '9' ? <MyInformation user={this.state.user} refreshPage={newUserInfo => this.refreshPage(newUserInfo)} /> : null}
                            {this.state.menuSelectKey === '10'? <MyPassword user={this.state.user}/> : null}
                        </Content>
                    </Layout>
                </Layout>
            </Layout>
        )
    }
}