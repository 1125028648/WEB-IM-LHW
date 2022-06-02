import React, {Component} from 'react';
import {Input, message, Upload, Button} from 'antd';
import {SmileOutlined, LoadingOutlined, PlusOutlined} from '@ant-design/icons';
import MessageBubble from './messageBubble.js';
import "../styles/chattingRoom.css";
import moment from 'moment';

const {Search} = Input;

function beforeUpload(file) {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
        message.error('You can only upload JPG/PNG file!');
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
        message.error('img must smaller than 2MB!');
    }
    return isJpgOrPng && isLt2M;
}

export default class ChattingRoom extends Component {
    
    room = this.props.room;
    user = this.props.user;
    socket = this.props.socket;
    // storage = window.sessionStorage;//存储用户头像

    state = {
        roomMembers: [],
        messages: [], //{sender: senderid, content: string}
        memberInfo: {},
        showEmos: false,
        myEmos: [],
        emoLoading: false,
    };

    async componentDidMount() {
        await this.queryRoomMembers().then( membersData => {
            this.queryAvatar(membersData);
        });
        await this.queryRoomMessages().then( mes => {
            console.log(mes);
        });
        this.receiveNewMessage();
    }

    queryAvatar = membersData => {
        const memberInfo = {};
        membersData.forEach( member => {
            const fullPath = this.$imageurl + member.picture;
            Object.assign(memberInfo, {[member.id]: {nickname: member.nickname, avatarPath: fullPath}});
        })
        this.setState({
            memberInfo,
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
    
    //显示/关闭表情包页面
    onShowEmos = () => {
        this.setState( {
            showEmos: !this.state.showEmos,
        }, () => {
            if(this.state.showEmos) {
                this.$axios( {
                    method: 'get',
                    url: '/query/emo',
                    params: {
                        userId: this.user.id,
                    }
                }).then( res => {
                    if(!res.data.flag) {
                        message.error(res.data.message);
                    }else{
                        // console.log(res.data.data);
                        this.setState( {
                            myEmos: res.data.data
                        })
                    }
                })
            }
        })
    }

    handleChange = info => {
        if (info.file.status === 'uploading') {
            this.setState({ emoLoading: true });
            return;
        }
        if (info.file.status === 'done') {
            this.setState({
                emoLoading: false,
                myEmos: [...this.state.myEmos, {emo_name: info.file.response.filename}],
            });
        }
    };

    //发送表情
    onSendEmo = emourl => {
        return () => {
            this.socket.emit('sendMessage', 
                {room: this.room, send_id: this.user.id, content: "[emo]"+ emourl, time: moment().format('yyyy-MM-DD hh:mm:ss')}
            );
            this.setState({
                messages: [...this.state.messages, {send_id: this.user.id, content: "[emo]" + emourl, time: moment().format('yyyy-MM-DD hh:mm:ss')}]
            }) 
        }
    }

    //删除表情
    onDeleteEmo = emo => {
        return () => {
            this.$axios({
                method: 'get',
                url: '/query/emo/delete',
                params: {
                    userId: this.user.id,
                    emoName: emo.emo_name,
                }
            }).then( res => {
                if(!res.data.flag) {
                    message.error(res.data.message);
                }else {
                    message.success('成功删除表情');
                    this.setState( {
                        myEmos: this.state.myEmos.filter( e => e !== emo)
                    });
                }
            })
        }
    }

    componentWillUnmount = () => {
        // 防止组件卸载后还在改变state
        this.setState = (state, callback) => {
            return;
        }
    }
    
    myRef = React.createRef();

    render() {
        const uploadButton = (
            <div>
                {this.state.emoLoading ? <LoadingOutlined /> : <PlusOutlined />}
                <div style={{ marginTop: 8 }}>上传图片表情</div>
            </div>
        );
        
        return (
            <div className='chatting-room'>
                <div className='chatting-page'>
                    <div className='chatting-messages'>
                        {this.state.messages.map((message, index) => 
                            <MessageBubble className="message-bubble" 
                                key={index} {...message} 
                                avatarPath={this.state.memberInfo[message.send_id]?.avatarPath || null} 
                                nickname={this.state.memberInfo[message.send_id]?.nickname || null}
                                socket={this.socket} 
                                user={this.user.id} 
                            />
                        )}
                        <div id="messagesEndRef" />
                    </div>
                    <Search ref={this.myRef} 
                        style={{marginTop: '5px'}} 
                        maxLength={60} 
                        enterButton='发送' 
                        suffix={<SmileOutlined onClick={this.onShowEmos} />} 
                        size="large" onSearch={this.onSendMessage}
                    />
                </div>
                {this.state.showEmos ? 
                    <div className='myEmos'>
                        {this.state.myEmos.map( (emo, idx) => {
                            const emourl = this.$emourl + emo.emo_name;
                            return (
                            <div key={emo.emo_name + idx} className='emoList'>
                                <img alt="emo" width={100} src={emourl} />
                                <div className='buttons'>
                                    <Button style={{display: 'block'}} type='primary' shape='round' onClick={this.onSendEmo(emourl)}>发送</Button>
                                    <Button style={{display: 'block'}} type='primary' shape='round' danger onClick={this.onDeleteEmo(emo)}>删除</Button>
                                </div>
                            </div>
                            )
                        })}

                        <Upload
                            name="emo"
                            listType="picture-card"
                            showUploadList={false}
                            action={this.$uploademo}
                            beforeUpload={beforeUpload}
                            onChange={this.handleChange}
                            withCredentials={true}
                        >
                            {uploadButton}
                        </Upload>
                    </div> 
                    : null
                }
            </div>
        )
    }
}
