import React, {Component} from 'react';
import {Input, message} from 'antd';
import {SmileOutlined} from '@ant-design/icons';
import MessageBubble from './messageBubble.js';
import "../styles/chattingRoom.css";

const {Search} = Input;

export default class ChattingRoom extends Component {
    
    room = this.props.room;
    user = this.props.user;
    socket = this.props.socket;

    state = {
        messages: [], //{sender: senderid, content: string}
    } 

    async componentDidMount() {
        await this.queryRoomMessages().then( mes => {
            console.log(mes);
        });
        this.receiveNewMessage();
    }

    componentDidUpdate() {
        this.scrollToBottom();
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
        messagesEndRef.scrollIntoView({behavior: 'smooth'});
    }

    onSendMessage = (value) => {
        if(!value.length) {
            message.error("输入不能为空！");
        }
        else {
            this.socket.emit('sendMessage', {room: this.room, sender: this.user.id, content: value});
            this.setState({
                messages: [...this.state.messages, {sender: this.user.id, content: value}]
            })
        }
    }

    componentWillUnmount = () => {
        // 防止组件卸载后还在改变state
        this.setState = (state, callback) => {
            return;
        }
    }

    render() {
        return (
            <div className='chatting-room'>
                <div className='chatting-page'>
                    {this.state.messages.map((message, index) => 
                        <MessageBubble className="message-bubble" key={index} {...message} socket={this.socket} user={this.user.id} />
                    )}
                    <div id="messagesEndRef" />
                </div>
                <Search enterButton='发送' suffix={<SmileOutlined />} size="large" onSearch={this.onSendMessage}/>
            </div>
        )
    }
}
