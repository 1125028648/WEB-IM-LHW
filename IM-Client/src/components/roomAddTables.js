import React, { Component } from "react"
import { Table, Popconfirm, Button, message, Input } from "antd"
import axios from "axios"

export default class RoomAddTable extends Component {
  constructor(props) {
    super(props)

    this.state = {
      dataSource: [],
      value2: "",
      roomList: [],
    }

    this.columns = [
      {
        title: "Id",
        dataIndex: "room_id",
      },
      {
        title: "群组名称",
        dataIndex: "room_name",
      },
      {
        title: "操作",
        key: "operation",
        render: (text, record) => {
          return this.state.dataSource.length >= 1 ? (
            <div>
              <Popconfirm
                title={`确认加入群组${record.roomName}？`}
                okText="确认"
                cancelText="取消"
                onConfirm={() => this.handleAdd(record.key, record)}
              >
                <Button type="link">加入</Button>
              </Popconfirm>
            </div>
          ) : null
        },
      },
    ]
  }

  handleAdd =  async (key, rowData) => {
    let mlist = this.state.roomList

    let flag = true
    for (let i = 0; i < mlist.length; i++) {
      if (mlist[i].id === key) {
        flag = false
        break
      }
    }

    if (flag) {
      const res = await axios.post('/rooms/examine/insert',{
        userId: this.props.user.id,
        roomId: key,
        creatorId: rowData.creator_id
      })
      
      if (res.data.flag === true) {
        message.success(res.data.message)
      } else {
        message.error(res.data.message)
      }
    } else {
      message.warning("不能重复添加群组")
    }
  }

  handleIdChange = (event) => {
    if (event && event.target && event.target.value) {
      this.setState({
        value1: event.target.value,
      })
    }
  }

  handleRoomNameChange = (event) => {
    if (event && event.target && event.target.value) {
      this.setState({
        value2: event.target.value,
      })
    }
  }

  onSearch = async () => {
    const res = await axios.get(`/rooms/query/condition?roomName=${this.state.value2}`)
    
    if (res.data.flag === true) {
      res.data.data.forEach((element) => {
        element.key = element.room_id
      })
      this.setState({
        dataSource: res.data.data,
      })
    } else {
      message.error(res.data.message)
    }
  }

  componentDidMount() {
    // this.$axios({
    //   method: "get",
    //   url: "/rooms/query/list",
    //   params: {
    //     userId: this.props.user.id,
    //   },
    // }).then((res) => {
    //   if (res.data.flag === true) {
    //     this.setState({
    //       roomList: res.data.data,
    //     })
    //   } else {
    //     message.error(res.data.message)
    //   }
    // })
  }

  render() {
    return (
      <div>
        <div style={{ marginBottom: 20 }}>
          <Input
            defaultValue={""}
            placeholder="群组名称"
            style={{ width: 150, marginLeft: 20 }}
            onChange={(event) => this.handleRoomNameChange(event)}
          />
          <Button
            type="primary"
            onClick={() => {
              this.onSearch()
            }}
            style={{ marginLeft: 20 }}
          >
            查询
          </Button>
        </div>

        <Table columns={this.columns} dataSource={this.state.dataSource} pagination={{hideOnSinglePage: true}}/>
      </div>
    )
  }
}
