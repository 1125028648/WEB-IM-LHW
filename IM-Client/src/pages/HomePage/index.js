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
import ChattingRoom from '../../components/chattingRoom';
// import { cookies } from 'koa/lib/context';

const { SubMenu } = Menu;
const { Header, Content, Sider } = Layout;

export default class HomePage extends Component{

    state = {
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
        selectedRoom: null,
    }

    async componentDidMount(){

        let userId, friendList;
        await this.initUser().then(res =>{
            userId = res.userId;
        })
        await this.initFriendList(userId).then(res =>{
            friendList = res.friendList;
        });
        await this.initRoom(userId, friendList);
    }

    initUser = () =>{
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

                socket.on('getSocketId', data => {
                    socket.emit('updateSocketId', {
                        userId: res.data.data.id,
                        socketId: data.socketId
                    });
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

    initFriendList = (userId) =>{
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

    initRoom = (userId, friendList) =>{
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

    onMenuFunction = values => {
        this.setState({
            menuSelectKey: values.key,
            selectedRoom: this.state.openKeys[0] === 'MessageList' ? values.key : null,
        })
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

    onOpenChange = selectedKeys => {
        if(selectedKeys.length > 1) {
            selectedKeys = [selectedKeys[selectedKeys.length-1]];
        }
        this.setState({
            openKeys: selectedKeys,
        })
    }

    render(){
        if(this.state.isLogin){
            return <Navigate to='/login'/>
        }

        const fileUrl = "http://localhost:8000/users/images/" + this.state.user.picture;

        return (
            <Layout className='homePage'>
                <Header className='header' style={{padding: '0px 16px'}}>
                    <Avatar size={40} src={fileUrl} />
                    <Button style={{display: "none"}} type="primary" onClick={this.onMessageTest} danger>测试</Button>
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
                        defaultOpenKeys={['MessageList']}
                        openKeys={this.state.openKeys}
                        onOpenChange={this.onOpenChange}
                        style={{ height: '100%', borderRight: 0}}
                        onClick={this.onMenuFunction}
                        >
                            <SubMenu key='MessageList' icon={<MessageOutlined />} title='消息列表'>
                                {this.state.rooms.map(room => <Menu.Item key={room.room_id}>{room.room_name}</Menu.Item>)}
                            </SubMenu>
                            <SubMenu key="FriendsManage" icon={<ContactsOutlined />} title="好友管理">
                                <Menu.Item key='friendList'>好友列表</Menu.Item>
                                <Menu.Item key="addFriend">添加好友</Menu.Item>
                                <Menu.Item key="friendExamine">好友审核</Menu.Item>
                            </SubMenu>
                            <SubMenu key="PersonalSettings" icon={<UserOutlined />} title="个人设置">
                                <Menu.Item key="personalInfo">个人信息</Menu.Item>
                                <Menu.Item key="modifyPassword">密码修改</Menu.Item>
                            </SubMenu>
                            <SubMenu key="SystemSettings" icon={<SettingOutlined />} title="系统选项">
                                <Menu.Item key="systemSettings">系统设置</Menu.Item>
                                <Menu.Item key="systemInforms">系统通知</Menu.Item>
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
                            {this.state.selectedRoom ? <ChattingRoom key={this.state.selectedRoom} room={this.state.selectedRoom} user={this.state.user} socket={this.state.socket} /> : null }
                            {this.state.menuSelectKey === 'friendList' ? <FriendTable user={this.state.user}/> : null}
                            {this.state.menuSelectKey === 'addFriend' ? <FriendAddTable user={this.state.user} /> : null}
                            {this.state.menuSelectKey === 'friendExamine' ? <FriendExamineTable user={this.state.user}/> : null}
                            {this.state.menuSelectKey === 'personalInfo' ? <MyInformation user={this.state.user} refreshPage={newUserInfo => this.refreshPage(newUserInfo)} /> : null}
                            {this.state.menuSelectKey === 'modifyPassword'? <MyPassword user={this.state.user}/> : null}
                        </Content>
                    </Layout>
                </Layout>
            </Layout>
        )
    }
}