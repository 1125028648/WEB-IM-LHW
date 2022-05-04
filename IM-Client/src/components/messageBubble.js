import React, { Component } from 'react'
import { Avatar} from 'antd'

export default class MessageBubble extends Component {
   
    user = this.props.user || this.props.user_id;
    sender = this.props.send_id || this.props.sender;
    content = this.props.content || this.props.message;
    time = this.props.time || this.props.send_time;
    socket = this.props.socket;
    nickname = this.props.nickname;

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
        let isEmo = (this.content.slice(0, 5) === '[emo]') ? true : false;
        if(this.sender === this.user) {
            return (
                <div style={{display: 'flex', alignSelf: 'flex-end', flexDirection: 'column', alignItems: 'flex-end'}}>
                    <div style={{padding: 5, display: 'flex'}}>
                        <div style={{width: '100px', flexShrink: 0}} />
                        {isEmo ? 
                            <img style={{margin: "5px 5px 2px 0px"}} src={this.content.slice(5)} width={100} alt="emo" onClick={() => {this.setState({showtime: !this.state.showtime})}}/> 
                            : 
                            <span className="message-frame" 
                                style={{backgroundColor: '#1890ff', color: 'white', borderRadius: "8px 3px 1px 3px", cursor: 'pointer'}} 
                                onClick={() => {this.setState({showtime: !this.state.showtime})}}
                            >
                                {this.content}
                            </span>
                        }
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
                        <div style={{display: 'flex', flexDirection: 'column'}}>
                            <span style={{fontSize: '10px', margin: '0 0 -5px 5px', color: 'gray'}}>{this.nickname}</span>
                            {isEmo ? 
                                <img style={{margin: "5px 0px 2px 5px"}} src={this.content.slice(5)} width={100} alt="emo" onClick={() => {this.setState({showtime: !this.state.showtime})}}/> 
                                : 
                                <span className="message-frame" 
                                    style={{backgroundColor: '#eeeeee', color: 'black', borderRadius: "3px 8px 3px 1px", cursor: 'pointer'}}
                                    onClick={() => {this.setState({showtime: !this.state.showtime})}}
                                >
                                    {this.content}
                                </span>
                            }
                        </div>
                        <div style={{width: '100px', flexShrink: 0}} />
                    </div>
                    {this.state.showtime ? <span style={{paddingLeft: '60px', marginTop: '-10px'}}>{this.time}</span> : null}
                </div>
            )
        }
    }
}
