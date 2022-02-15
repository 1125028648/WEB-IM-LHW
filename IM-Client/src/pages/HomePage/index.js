import React, { Component } from 'react';
import io from 'socket.io-client';
import { Layout, Menu } from 'antd';
import { Navigate } from "react-router-dom";
import { UserOutlined, LaptopOutlined, NotificationOutlined } from '@ant-design/icons';
import '../../styles/homePage.css';

import FriendTable from '../../components/friendTable';
import FriendAddTable from '../../components/friendAddTable';
import FriendExamineTable from '../../components/friendExamineTable';

const { SubMenu } = Menu;
const { Header, Content, Sider } = Layout;

export default class HomePage extends Component{

    constructor(props){
        super(props);
        this.state = {
            user: null,
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

    render(){
        if(this.state.isLogin){
            return <Navigate to='/login'/>
        }

        return (
            <Layout className='homePage'>
                <Header className='header'>
                    <div className='logo' />
                    <Menu theme='dark' mode='horizontal' defaultSelectedKeys={['1']}>
                        <Menu.Item key='1'>nav 1</Menu.Item>
                        <Menu.Item key='2'>nav 2</Menu.Item>
                        <Menu.Item key='3'>nav 3</Menu.Item>
                    </Menu>
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
                                <Menu.Item key='1'>option1</Menu.Item>
                                <Menu.Item key='2'>option2</Menu.Item>
                                <Menu.Item key='3'>option3</Menu.Item>
                                <Menu.Item key='4'>option4</Menu.Item>
                            </SubMenu>
                            <SubMenu key="sub2" icon={<LaptopOutlined />} title="好友管理">
                                <Menu.Item key='5'>好友列表</Menu.Item>
                                <Menu.Item key="6">添加好友</Menu.Item>
                                <Menu.Item key="7">好友审核</Menu.Item>
                            </SubMenu>
                            <SubMenu key="sub3" icon={<NotificationOutlined />} title="个人设置">
                                <Menu.Item key="9">option9</Menu.Item>
                                <Menu.Item key="10">option10</Menu.Item>
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
                        </Content>
                    </Layout>
                </Layout>
            </Layout>
        )
    }
}