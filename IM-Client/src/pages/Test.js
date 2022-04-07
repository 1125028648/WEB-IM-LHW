import React, {Component} from 'react';
import { Button } from 'antd';

class Test extends Component{
    constructor(){
        super();
        this.onClick = this.onClick.bind(this);
        this.onExit = this.onExit.bind(this);
        this.onFriendList = this.onFriendList.bind(this);
        this.onFriendQuery = this.onFriendQuery.bind(this);
        this.onFriendExamineQuery = this.onFriendExamineQuery.bind(this);
        this.onFriendExamineAdd = this.onFriendExamineAdd.bind(this);
        this.onFriendExamineUpdate = this.onFriendExamineUpdate.bind(this);
        this.onFriendAdd = this.onFriendAdd.bind(this);
        this.onFriendDelete = this.onFriendDelete.bind(this);
        this.onQueryUser = this.onQueryUser.bind(this);

        this.state = {
            hello: 'hello',
            message: '',
        }
    }

    onClick(){
        this.$axios.post('/test').then(res =>{
            console.log(res.data);
        })
    }

    onExit(){
        this.$axios.post('/exit').then(res => {
            console.log(res.data);
        })
    }

    onFriendList(){
        this.$axios({
            method: 'get',
            url: '/friends/list',
            params: {
                userId: 1
            }
        }).then(res =>{
            console.log(res.data);
        })
    }

    onFriendQuery(){
        this.$axios({
            method: 'get',
            url: '/friends/query',
            params: {
                userId: 7
            }
        }).then(res =>{
            console.log(res.data);
        })
    }

    onFriendExamineQuery(){
        this.$axios({
            method: 'get',
            url: '/friends/examine/query',
            params: {
                userId: 1
            }
        }).then(res =>{
            console.log(res.data);
        })
    }

    onFriendExamineAdd(){
        this.$axios({
            method: 'post',
            url: '/friends/examine/insert',
            data: {
                userId: 1,
                friendId: 9 
            }
        }).then(res => {
            console.log(res.data);
        });
    }

    // 拒绝
    onFriendExamineUpdate(){
        this.$axios({
            method: 'get',
            url: '/friends/examine/update',
            params: {
                exId: 1
            }
        }).then(res => {
            console.log(res.data);
        })
    }

    // 同意
    onFriendAdd(){
        this.$axios({
            method: 'post',
            url: '/friends/insert',
            data: {
                userId: 1,
                friendId: 8
            }
        }).then(res => {
            console.log(res.data);
        })
    }

    // 删除
    onFriendDelete(){
        this.$axios({
            method: 'post',
            url: '/friends/delete',
            data: {
                userId: 1,
                friendId: 8
            }
        }).then(res => {
            console.log(res.data);
        })
    }

    // 获取 user
    onQueryUser(){
        this.$axios.get('/user').then(res =>{
            console.log(res.data);
        })
    }

    // 条件查询用户
    onQueryUsersByCondition= () =>{
        this.$axios({
            method: 'get',
            url: '/users/query/condition',
            params: {
                email: '',
                nickname: '',
            }
        }).then(res => {
            console.log(res.data);
        })
    }

    // 个人信息修改
    onUpdateUserInfo = () =>{
        this.$axios({
            method: 'post',
            url: '/users/update/info',
            data: {
                id: 1,
                nickname: 'root2',
                birthday: '1997-12-22',
                sex: 1,
                picture: '010101.jpeg'
            }
        }).then(res =>{
            console.log(res.data);
        })
    }

    // 修改密码
    onUpdatePassword = () =>{
        this.$axios({
            method: 'post',
            url: '/users/update/password',
            data: {
                userid: 1,
                password: '123',
            }
        }).then(res =>{
            console.log(res.data);
        })
    }

    // 查询群列表
    onQueryRoomList = () =>{
        this.$axios({
            method: 'get',
            url: '/rooms/query/list',
            params: {
                userId: 1,
            }
        }).then(res =>{
            console.log(res.data);
        })
    }

    // 查询群详情（成员）
    onQueryRoomMember = () =>{
        this.$axios({
            method: 'get',
            url: '/rooms/query/member',
            params: {
                roomId: 5,
            }
        }).then(res =>{
            console.log(res.data);
        })
    }

    // 创建群
    onCreateRoom = () =>{
        this.$axios({
            method: 'post',
            url: '/rooms/create',
            data: {
                userId: 1,
                roomName: '测试群',
            }
        }).then(res =>{
            console.log(res.data);
        })
    }

    // 模糊查询群
    onQueryRoom = () =>{
        this.$axios({
            method: 'get',
            url: '/rooms/query/condition',
            params: {
                roomName: '事业群',
            }
        }).then(res =>{
            console.log(res.data);
        })
    }

    // 添加群申请
    onInsertRoomExamine = () => {
        this.$axios({
            method: 'post',
            url: '/rooms/examine/insert',
            data: {
                userId: 8,
                roomId: 5,
                creatorId: 1
            }
        }).then(res =>{
            console.log(res.data);
        })
    }

    // 查询群申请
    onQueryRoomExamine = () =>{
        this.$axios({
            method: 'get',
            url: '/rooms/examine/query',
            params: {
                userId: 1,
            }
        }).then(res =>{
            console.log(res.data);
        })
    }

    // 拒绝群申请
    onUpdateRoomExamine = () =>{
        this.$axios({
            method: 'post',
            url: '/rooms/examine/update',
            data: {
                exid: 1,
            }
        }).then(res =>{
            console.log(res.data);
        })
    }

    // 群申请-同意
    onAgreeRoomExamine = () =>{
        this.$axios({
            method: 'post',
            url: '/rooms/examine/agree',
            data: {
                exid: 6,
                roomId: 5,
                sendId: 8,
            }
        }).then(res =>{
            console.log(res.data);
        })
    }

    // 退群
    onRoomExit = () =>{
        this.$axios({
            method: 'post',
            url: '/rooms/exit',
            data: {
                roomId: 5,
                userId: 1,
            }
        }).then(res =>{
            console.log(res.data);
        })
    }

    // 删除群
    onDeleteRoom = () =>{
        this.$axios({
            method: 'post',
            url: '/rooms/delete',
            data: {
                roomId: 6,
                userId: 1,
            }
        }).then(res =>{
            console.log(res.data);
        })
    }

    // 查询每个房间未读消息总数
    onQueryRoomNoReadCount = () =>{
        this.$axios({
            method: 'get',
            url: '/rooms/noread/count',
            params:{
                userId: 8,
            }
        }).then(res =>{
            console.log(res.data);
        })
    }

    render(){
        return (
            <div>
                <Button onClick={this.onClick}>点击</Button>
                <Button onClick={this.onExit}>退出</Button>
                <Button onClick={this.onFriendList}>好友列表</Button>
                <Button onClick={this.onFriendQuery}>好友详情查询</Button>
                <Button onClick={this.onFriendExamineQuery}>好友审核查询</Button>
                <Button onClick={this.onFriendExamineAdd}>好友审核添加</Button>
                <Button onClick={this.onFriendExamineUpdate}>好友审核修改</Button>
                <Button onClick={this.onFriendAdd}>好友添加</Button>
                <Button onClick={this.onFriendDelete}>好友删除</Button>
                <Button onClick={this.onQueryUser}>查看用户信息</Button>
                <Button onClick={this.onQueryUsersByCondition}>条件查询用户</Button>
                <Button onClick={this.onUpdateUserInfo}>个人信息修改</Button>
                <Button onClick={this.onUpdatePassword}>密码修改</Button>

                <Button onClick={this.onQueryRoomList}>查询群列表</Button>
                <Button onClick={this.onQueryRoomMember}>查询群详情</Button>
                <Button onClick={this.onCreateRoom}>创建群</Button>
                <Button onClick={this.onQueryRoom}>条件查询群</Button>
                <Button onClick={this.onInsertRoomExamine}>添加群申请</Button>
                <Button onClick={this.onQueryRoomExamine}>查询申请列表</Button>
                <Button onClick={this.onUpdateRoomExamine}>拒绝群申请</Button>
                <Button onClick={this.onAgreeRoomExamine}>同意群申请</Button>
                <Button onClick={this.onRoomExit}>退群</Button>
                <Button onClick={this.onDeleteRoom}>群主删除群</Button>

                <Button onClick={this.onQueryRoomNoReadCount}>查询未读记录数</Button>
            </div>
        )
    }
}

export default Test;