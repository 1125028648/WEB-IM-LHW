import React, { Component } from "react"
import { Table, Popconfirm, Button, message, Image } from "antd"
import Modal from "antd/lib/modal/Modal"
import { GroupOutlined } from "@ant-design/icons"
import axios from 'axios'

export default class RoomTable extends Component {
  constructor(props) {
    super(props)

    this.state = {
      dataSource: [],
      isModalVisible: false,
      modalUser: {
        nickname: 111,
        roomName: 222,
        number: 0,
      },
      dataSourceRoomInfo: [] // 群组信息
    }

    this.columns = [
      {
        title: "id",
        dataIndex: "room_id",
      },
      {
        title: "群组名称",
        dataIndex: "room_name",
      },
      {
        title: "操作",
        key: "operation",
        width: "40%",

        render: (text, record) => {
          return this.state.dataSource.length >= 1 ? (
            <div>
              <Button type="link" onClick={() => this.showModal(record.key)}>
                信息
              </Button>
              
              <Popconfirm
                title={`确认退出群组${this.state.modalUser.nickname}？`}
                okText="确认"
                cancelText="取消"
                onConfirm={() => this.handleDelete(record.key)}
              >
                <Button type="link" style={{ color: "red" }}>
                  退出
                </Button>
              </Popconfirm>
              {
                record.creator_id === this.props.user.id ? (
                <Popconfirm
                title={`确认删除该群组吗？`}
                okText="确认"
                cancelText="取消"
                onConfirm={() => this.handleDeleteRoom(record.key)}
                >
                  <Button type="link" style={{ color: "red" }}>
                    删除
                  </Button>
                </Popconfirm>) : null
              }
            </div>
          ) : null
        },
      },
    ]

    this.columnsRoomInfo = [
      {
        title: "id",
        dataIndex: "id",
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
        title: "性别",
        dataIndex: "sex",
      },
      {
        title: "生日",
        dataIndex: "sex",
      },
      {
        title: "头像",
        dataIndex: "sex",
        render: img => {
          if (img) {
            return (
              <Image
              width={200}
              src={img}
            />
            )
          } else {
            return (<div></div>)
          }
        }
      },
    ]
  }

  // 群主删除群(由于数据库存在外键约束，删除失败)
  handleDeleteRoom = async (key) => {
    const res = await axios.post('/rooms/delete',{
      userId: this.props.user.id,
      roomId: key,
    })
    
    if (res.data.flag === true) {
      const dataSource = [...this.state.dataSource]
      this.setState({
        dataSource: dataSource.filter((item) => item.key !== key),
      })
    } else {
      message.error(res.data.message)
    }
  }

  async componentDidMount() {
    console.log('user: ', this.props.user)
    // 获取群组列表
    const res = await axios.get(`/rooms/query/list?userId=${this.props.user.id}`)
    console.log("res: ", res)
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

  sendMessage = () => {}

  // 退出群组
  handleDelete = async (key) => {
    const res = await axios.post('/rooms/exit',{
      userId: this.props.user.id,
        roomId: key,
    })
    
    if (res.data.flag === true) {
      const dataSource = [...this.state.dataSource]
      this.setState({
        dataSource: dataSource.filter((item) => item.key !== key),
      })
    } else {
      message.error(res.data.message)
    }
  }

  // 显示群组信息modal
  showModal = async (key) => {
    const res = await axios.get(`/rooms/query/member?roomId=${key}`) 
    console.log('res: ',res.data)
    if (res.data.flag === false) {
      message.error(res.data.message)
    }
    res.data.data.forEach((element) => {
      element.key = element.id
    })
    this.setState({dataSourceRoomInfo: res.data.data})
    this.setState({isModalVisible: true})
  }

  handleOkModal = () => {
    this.setState({
      isModalVisible: false,
    })
  }

  handleCancelModal = () => {
    this.setState({
      isModalVisible: false,
    })
  }

  render() {
    return (
      <>
        <Table
          columns={this.columns}
          dataSource={this.state.dataSource}
          onRow={(record) => {
            return {
              onMouseEnter: (event) => {
                record.selected = true
              },
              onMouseLeave: (event) => {
                record.selected = false
              },
            }
          }}
        />
        <Modal
          width={700}
          title="群组信息"
          visible={this.state.isModalVisible}
          onOk={this.handleOkModal}
          onCancel={this.handleCancelModal}
        >
          <Table
            columns={this.columnsRoomInfo}
            dataSource={this.state.dataSourceRoomInfo}
            pagination={{hideOnSinglePage: true}}
          />
        </Modal>
      </>
      
    )
  }
}
