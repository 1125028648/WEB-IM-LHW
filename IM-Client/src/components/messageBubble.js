import React, { Component } from 'react'
import { Avatar } from 'antd'

export default class MessageBubble extends Component {
   
    user = this.props.user || this.props.user_id;
    sender = this.props.send_id || this.props.sender;
    content = this.props.content || this.props.message;
    time = this.props.time || this.props.send_time;
    socket = this.props.socket;

    state = {
        path: "",
        showtime: false,
    }

    componentWillUnmount() {
        this.setState = (state, callback) => {
            return;
        }
    }

    render() {
        if(this.sender === this.user) {
            return (
                <div style={{display: 'flex', alignSelf: 'flex-end', flexDirection: 'column', alignItems: 'flex-end'}}>
                    <div style={{padding: 5, display: 'flex'}}>
                        <div style={{width: '100px', flexShrink: 0}} />
                        <span className="message-frame" 
                            style={{backgroundColor: '#1890ff', color: 'white', borderRadius: "8px 3px 1px 3px", cursor: 'pointer'}} 
                            onClick={() => {this.setState({showtime: !this.state.showtime})}}
                        >
                            {this.content}
                        </span>
                        <Avatar src={this.props.avatarPath} size='large' style={{flexShrink: 0, marginRight: 10}} />
                    </div>
                    {this.state.showtime ? <span style={{paddingRight: '60px', marginTop: '-10px'}}>{this.time}</span> : null}
                </div>        
            )
        }else {
            return (
                <div style={{display: 'flex', flexDirection: 'column'}}>
                    <div style={{padding: 5, display: 'flex'}}>
                        <Avatar src={this.props.avatarPath} size="large" style={{flexShrink: 0, marginLeft: 10}} />
                        <span className="message-frame" 
                            style={{backgroundColor: '#eeeeee', color: 'black', borderRadius: "3px 8px 3px 1px", cursor: 'pointer'}}
                            onClick={() => {this.setState({showtime: !this.state.showtime})}}
                        >
                            {this.content}
                        </span>
                        <div style={{width: '100px', flexShrink: 0}} />
                    </div>
                    {this.state.showtime ? <span style={{paddingLeft: '60px', marginTop: '-10px'}}>{this.time}</span> : null}
                </div>
            )
        }
    }
}
