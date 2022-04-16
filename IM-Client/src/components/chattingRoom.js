import React, {Component} from 'react';
import {Input, message} from 'antd';
import {SmileOutlined} from '@ant-design/icons';
import MessageBubble from './messageBubble.js';
import "../styles/chattingRoom.css";
import moment from 'moment'

const {Search} = Input;

export default class ChattingRoom extends Component {
    
    room = this.props.room;
    user = this.props.user;
    socket = this.props.socket;
    // storage = window.sessionStorage;//存储用户头像

    state = {
        roomMembers: [],
        messages: [], //{sender: senderid, content: string}
        avatarPaths: {},
    };

    async componentDidMount() {
        await this.queryRoomMessages().then( mes => {
            console.log(mes);
        });
        this.receiveNewMessage();
        await this.queryRoomMembers().then( membersData => {
            this.queryAvatar(membersData);
        });
    }

    queryAvatar = membersData => {
        membersData.forEach( member => {
            const {avatarPaths} = this.state;
            const fullPath = this.$imageurl + member.picture;
            this.setState( {
                avatarPaths: Object.assign(avatarPaths, {[member.id] : fullPath}),
            });
            // this.storage.setItem(member.id, JSON.stringify(avatar));
        })
    }

    componentDidUpdate() {
        this.scrollToBottom();
    }

    queryRoomMembers = () => {
        return new Promise( (resolve) => {
            this.$axios({
                method: 'get',
                url: 'rooms/query/member', 
                params: {roomId: this.room}
            }).then( res => {
                if(!res.data.flag) {
                    message.error(res.data.message);
                }else{
                    resolve(res.data.data);
                }
            });
        });
    }

    queryRoomMessages = () => {
        return new Promise( (resolve, reject) => {
            this.socket.emit("queryRoomMessages", {room: this.room, userId: this.user.id});
            this.socket.once("updateRoomMessages", data => { 
                //data: {room: roomid, messages: []}
                if(data.room === this.room) {
                    this.setState({
                        messages: data.messages,
                    })
                    resolve('Current room messages UPDATED!');
                }
            })
        })
    }

    receiveNewMessage = () => {
        this.socket.on("newMessage", newMessage => {
            //newMessage: {room: roomid, message: {sender:xx, content:xx}}
            if(newMessage.room === this.room && newMessage.sender !== this.user.id) {
                this.setState({
                    messages: [...this.state.messages, newMessage],
                })
            }
        }) 
    }

    scrollToBottom = () => {
        const messagesEndRef = document.getElementById("messagesEndRef");
        messagesEndRef.scrollIntoView({behavior: 'auto'});
    }

    onSendMessage = (value, event) => {
        if(!value.length) {
            message.error("输入不能为空！");
        }
        else {
            this.socket.emit('sendMessage', 
                {room: this.room, send_id: this.user.id, content: value, time: moment().format('yyyy-MM-DD hh:mm:ss')}
            );
            this.setState({
                messages: [...this.state.messages, {send_id: this.user.id, content: value, time: moment().format('yyyy-MM-DD hh:mm:ss')}]
            })
        }
        this.myRef.current.setValue("");
    }

    componentWillUnmount = () => {
        // 防止组件卸载后还在改变state
        this.setState = (state, callback) => {
            return;
        }
    }
    
    myRef = React.createRef();

    render() {
        return (
            <div className='chatting-room'>
                <div className='chatting-page'>
                    {this.state.messages.map((message, index) => {
                        return <MessageBubble className="message-bubble" 
                            key={index} {...message} 
                            avatarPath={this.state.avatarPaths[message.send_id]} 
                            socket={this.socket} 
                            user={this.user.id} 
                        />}
                    )}
                    <div id="messagesEndRef" />
                </div>
                <Search ref={this.myRef} style={{marginTop: '5px'}} enterButton='发送' suffix={<SmileOutlined />} size="large" onSearch={this.onSendMessage}/>
            </div>
        )
    }
}
