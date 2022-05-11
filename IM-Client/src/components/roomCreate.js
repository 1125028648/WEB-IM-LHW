import React, { Component } from "react"
import { Button, message, Input } from "antd"
import axios from "axios"

export default class RoomCreate extends Component {
  constructor(props) {
    super(props)
    // console.log(this.props.user);
    this.state = {
      userInfo: {},
      responseName: "",
    }
  }

  componentDidMount() {
    this.setState({
      userInfo: this.props.user,
    })
  }

  handleSetRoomName = (event) => {
    if (event && event.target && event.target.value !== "") {
      let data = Object.assign({}, this.state.userInfo, {
        roomName: event.target.value,
      })
      this.setState({
        userInfo: data,
      })
    }
  }

  onSave = async () => {
    const res = await axios.post('/rooms/create', {
      userId: this.state.userInfo.id,
      roomName: this.state.userInfo.roomName
    })
    if (res.data.flag) {
      message.success("创建成功")
    } else {
      message.error(res.data.message)
    }
  }

  render() {
    return (
      <div>
        <div style={{ textAlign: "center", marginTop: 50 }}>
          <span style={{ padding: 10, fontSize: 16 }}>群组名称:</span>
          <Input onChange={this.handleSetRoomName} style={{ width: 200 }} />
          <br />
          <br />
          <Button type="primary" onClick={this.onSave}>
            保存
          </Button>
        </div>
      </div>
    )
  }
}
