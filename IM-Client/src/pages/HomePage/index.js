import React, { Component } from 'react';
import io from 'socket.io-client';
import { Layout, Menu, Avatar, Button, message, Badge} from 'antd';
import { Navigate } from "react-router-dom";
import { UserOutlined, ContactsOutlined, SettingOutlined, MessageOutlined } from '@ant-design/icons';
import '../../styles/homePage.css';

import FriendTable from '../../components/friendTable';
import FriendAddTable from '../../components/friendAddTable';
import FriendExamineTable from '../../components/friendExamineTable';
import MyInformation from '../../components/myInformation';
import MyPassword from '../../components/myPassword';
import { cookies } from 'koa/lib/context';

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
            socket:{},
            rooms: [],
            friendList: [],
            unreadMessageCnt: 0,
            openKeys: ['MessageList'],
        }

        this.onMenuFunction = this.onMenuFunction.bind(this);
    }

    async componentDidMount(){

        let userId, friendList;
        await this.initialUser().then(res =>{
            userId = res.userId;
        })
        await this.initialFriendList(userId).then(res =>{
            friendList = res.friendList;
        });
        await this.initialRoom(userId, friendList);


    }

    initialUser = () =>{
        return new Promise((resolve, reject) =>{

            // 获取用户信息
            this.$axios.get('/user').then(res =>{
                if(res.data.flag){
                    this.setState({
                        user: res.data.data,
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

                // 聊天功能
                socket.on('message', function(message){
                    console.log(message);
                });

                this.setState({
                    socket: socket,
                })

                resolve({
                    userId: res.data.data.id,
                });
            });
            
        })
    }

    initialFriendList = (userId) =>{
        return new Promise((resolve, reject) =>{
            // 获取好友列表
            this.$axios({
                method: 'get',
                url: '/friends/list',
                params: {
                    userId: userId
                }
            }).then(res =>{
                res.data.data.forEach(element => {
                    element.key = element.id;
                });

                this.setState({
                    friendList: res.data.data,
                });

                resolve({
                    friendList: res.data.data,
                });
            });
        });
    }

    initialRoom = (userId, friendList) =>{
        return new Promise((resolve, reject) =>{
            // 获取房间列表
            this.$axios({
                method: 'get',
                url: '/rooms/query',
                params: {
                    userId: userId,
                }
            }).then(res =>{
                let friendMap = [];
                for(let i = 0; i<friendList.length; i++){
                    friendMap[friendList[i].id] = friendList[i].nickname;
                }

                res.data.data.forEach(element => {
                    if(element.room_name.indexOf('-') !== -1){
                        var users = element.room_name.split("-");
                        if(parseInt(users[0]) === userId){
                            element.room_name = friendMap[parseInt(users[1])];
                        }else{
                            element.room_name = friendMap[parseInt(users[0])];
                        }
                    }
                });

                this.setState({
                    rooms: res.data.data,
                });
            });

            resolve();
        });
    }

    onMessageTest = ()=>{
        // 单聊
        this.state.socket.emit("message", {
            roomId: 1,
            text: "hello world",
            sendId: 1,
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

    onQuit = () => {
        this.$axios.post('/exit').then( res => {
            if(res.data.flag === true){
                this.setState({
                    isLogin: true,
                });
            }else{
                message.error(res.data.message);
            }
        })
    }

    onOpenChange = keys => {
        if(keys.length > 1) {
            keys = [keys[keys.length-1]];
        }
        this.setState({
            openKeys: keys,
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
                <Header className='header' style={{padding: '0px 16px'}}>
                    <Avatar size={40} src={fileUrl} />
                    <Button type="primary" onClick={this.onMessageTest} danger>测试</Button>
                    <span style={{marginLeft: 15, color: 'white', fontSize: 16}}>{this.state.user.nickname}</span>
                    <Button type="primary" style={{float: 'right', marginTop: 16}} onClick={this.onQuit} danger>登出</Button>
                </Header>
                <Layout>
                    <Sider width={180} className='site-layout-background'>
                        {/* 未读消息数显示 */}
                        <div style={{position: 'absolute', right: 40, top: 10}}>
                            {this.state.unreadMessageCnt ? <Badge count={this.props.unreadMessageCnt}/> : null}
                        </div>
                        <Menu
                        mode='inline'
                        defaultSelectedKeys={['1']}
                        defaultOpenKeys={['MessageList']}
                        openKeys={this.state.openKeys}
                        onOpenChange={this.onOpenChange}
                        style={{ height: '100%', borderRight: 0}}
                        onClick={this.onMenuFunction}
                        >
                            <SubMenu key='MessageList' icon={<MessageOutlined />} title='消息列表'>
                                {/* <Menu.Item key='1'>消息窗口1</Menu.Item> */}
                                {this.state.rooms.map(room => <Menu.Item key={room.room_name}>{room.room_name}</Menu.Item>)}
                            </SubMenu>
                            <SubMenu key="FriendsManage" icon={<ContactsOutlined />} title="好友管理">
                                <Menu.Item key='5'>好友列表</Menu.Item>
                                <Menu.Item key="6">添加好友</Menu.Item>
                                <Menu.Item key="7">好友审核</Menu.Item>
                            </SubMenu>
                            <SubMenu key="PersonalSettings" icon={<UserOutlined />} title="个人设置">
                                <Menu.Item key="9">个人信息</Menu.Item>
                                <Menu.Item key="10">密码修改</Menu.Item>
                            </SubMenu>
                            <SubMenu key="SystemSettings" icon={<SettingOutlined />} title="系统选项">
                                <Menu.Item key="11">系统设置</Menu.Item>
                                <Menu.Item key="12">系统通知</Menu.Item>
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