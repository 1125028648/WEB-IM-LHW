import React, { Component } from 'react'
import { Avatar } from 'antd'

export default class MessageBubble extends Component {
   
    user = this.props.user ? this.props.user : this.props.user_id;
    sender = this.props.sender ? this.props.sender : this.props.send_id;
    content = this.props.content ? this.props.content : this.props.message;
    time = this.props.time ? this.props.time : this.props.send_time;
    socket = this.props.socket;

    state = {
        path: "",
    }

    componentDidMount() {
        this.$axios({
            method: 'get',
            url: 'friends/query',
            params: {
                userId: this.sender,
            }
        }).then( res => {
            if(res.data.flag === true){
                this.setState({
                    path: this.$imageurl + res.data.data.picture,
                })
            }
        })
    }

    componentWillUnmount() {
        this.setState = (state, callback) => {
            return;
        }
    }

    render() {
        if(this.sender === this.user) {
            return (
                <div style={{padding: 5, alignSelf: 'flex-end', display: 'flex'}}>
                    <span className="message-frame" style={{backgroundColor: '#1890ff', color: 'white', borderRadius: "8px 3px 1px 3px"}}>{this.content}</span>
                    <Avatar src={this.state.path} size='large' style={{flexShrink: 0, marginRight: 10}} />
                </div>
            )
        }else {
            return (
                <div style={{padding: 5, display: 'flex'}}>
                    <Avatar src={this.state.path} size="large" style={{flexShrink: 0, marginLeft: 10}} />
                    <span className="message-frame" style={{backgroundColor: '#eeeeee', color: 'black', borderRadius: "3px 8px 3px 1px"}}>{this.content}</span>
                </div>
            )
        }
    }
}
