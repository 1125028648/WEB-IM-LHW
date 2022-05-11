import React, { Component } from "react"
import { Table, Popconfirm, Button, message } from "antd"
import axios from "axios"

export default class RoomExamineTable extends Component {
  constructor(props) {
    super(props)

    this.state = {
      dataSource: [],
    }

    this.columns = [
      {
        title: "Id",
        dataIndex: "exid",
      },
      {
        title: "昵称",
        dataIndex: "nickname",
      },
      {
        title: "邮箱",
        dataIndex: "email",
      },
      {
        title: "申请群聊",
        dataIndex: "room_name",
      },
      {
        title: "操作",
        key: "operation",
        render: (text, record) => {
          return this.state.dataSource.length >= 1 ? (
            <div>
              <Popconfirm
                title="同意加入？"
                okText="确认"
                cancelText="取消"
                onConfirm={() => this.handleAgree(record.key, record)}
              >
                <Button type="primary">同意</Button>
              </Popconfirm>
              <Popconfirm
                title="拒绝加入？"
                okText="确认"
                cancelText="取消"
                onConfirm={() => this.handleReject(record.key, record)}
              >
                <Button type="primary" style={{ marginLeft: "20px" }} danger>
                  拒绝
                </Button>
              </Popconfirm>
            </div>
          ) : null
        },
      },
    ]
  }

  // 同意
  handleAgree = async (key, record) => {
    const res = await axios.post('/rooms/examine/agree', {
      exid: record.exid,
      roomId: record.room_id,
      sendId: record.send_id
    })
   
    if (res.data.flag === true) {
      message.success('已同意')
    } else {
      message.error(res.data.message)
    }
  }

  // 拒绝
  handleReject = async (key, record) => {
    const res = await axios.post('/rooms/examine/update', {
      exid: record.exid
    })
   
    if (res.data.flag === true) {
      message.success('已拒绝')
    } else {
      message.error(res.data.message)
    }
  }

  // 查询审核列表
  async componentDidMount() {
    const res = await axios.get(`/rooms/examine/query?userId=${this.props.user.id}`)
    
    if (res.data.flag === true) {
      res.data.data.forEach((element) => {
        element.key = element.exid
      })

      this.setState({
        dataSource: res.data.data,
      })
    } else {
      message.error(res.data.message)
    }
  }

  render() {
    return <Table columns={this.columns} dataSource={this.state.dataSource} pagination={{hideOnSinglePage: true}} />
  }
}
