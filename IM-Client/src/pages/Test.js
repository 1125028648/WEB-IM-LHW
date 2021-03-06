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

    // ??????
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

    // ??????
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

    // ??????
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

    // ?????? user
    onQueryUser(){
        this.$axios.get('/user').then(res =>{
            console.log(res.data);
        })
    }

    // ??????????????????
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

    // ??????????????????
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

    // ????????????
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

    // ???????????????
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

    // ???????????????????????????
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

    // ?????????
    onCreateRoom = () =>{
        this.$axios({
            method: 'post',
            url: '/rooms/create',
            data: {
                userId: 1,
                roomName: '?????????',
            }
        }).then(res =>{
            console.log(res.data);
        })
    }

    // ???????????????
    onQueryRoom = () =>{
        this.$axios({
            method: 'get',
            url: '/rooms/query/condition',
            params: {
                roomName: '?????????',
            }
        }).then(res =>{
            console.log(res.data);
        })
    }

    // ???????????????
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

    // ???????????????
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

    // ???????????????
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

    // ?????????-??????
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

    // ??????
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

    // ?????????
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

    // ????????????????????????????????????
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

    onQueryEmo = ()=>{
        this.$axios({
            method: 'get',
            url: '/query/emo',
            params:{
                userId: 1,
            }
        }).then(res =>{
            console.log(res.data);
        })
    }

    onDeleteEmo = ()=>{
        this.$axios({
            method: 'get',
            url: '/query/emo/delete',
            params: {
                userId: 1,
                emoName: '1650695182657.jpg',
            }
        }).then( res => {
            console.log(res.data);
        })
    }

    render(){
        return (
            <div>
                <Button onClick={this.onClick}>??????</Button>
                <Button onClick={this.onExit}>??????</Button>
                <Button onClick={this.onFriendList}>????????????</Button>
                <Button onClick={this.onFriendQuery}>??????????????????</Button>
                <Button onClick={this.onFriendExamineQuery}>??????????????????</Button>
                <Button onClick={this.onFriendExamineAdd}>??????????????????</Button>
                <Button onClick={this.onFriendExamineUpdate}>??????????????????</Button>
                <Button onClick={this.onFriendAdd}>????????????</Button>
                <Button onClick={this.onFriendDelete}>????????????</Button>
                <Button onClick={this.onQueryUser}>??????????????????</Button>
                <Button onClick={this.onQueryUsersByCondition}>??????????????????</Button>
                <Button onClick={this.onUpdateUserInfo}>??????????????????</Button>
                <Button onClick={this.onUpdatePassword}>????????????</Button>

                <Button onClick={this.onQueryRoomList}>???????????????</Button>
                <Button onClick={this.onQueryRoomMember}>???????????????</Button>
                <Button onClick={this.onCreateRoom}>?????????</Button>
                <Button onClick={this.onQueryRoom}>???????????????</Button>
                <Button onClick={this.onInsertRoomExamine}>???????????????</Button>
                <Button onClick={this.onQueryRoomExamine}>??????????????????</Button>
                <Button onClick={this.onUpdateRoomExamine}>???????????????</Button>
                <Button onClick={this.onAgreeRoomExamine}>???????????????</Button>
                <Button onClick={this.onRoomExit}>??????</Button>
                <Button onClick={this.onDeleteRoom}>???????????????</Button>

                <Button onClick={this.onQueryRoomNoReadCount}>?????????????????????</Button>
                <Button onClick={this.onQueryEmo}>???????????????</Button>
                <Button onClick={this.onDeleteEmo}>???????????????</Button>
            </div>
        )
    }
}

export default Test;