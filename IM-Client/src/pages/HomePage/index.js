import React, { Component } from "react"
import io from "socket.io-client"
import { Layout, Menu, Avatar, Button, message, Badge } from "antd"
import { Navigate } from "react-router-dom"
import {
  UserOutlined,
  ContactsOutlined,
  SettingOutlined,
  MessageOutlined,
  GroupOutlined,
} from "@ant-design/icons"
import "../../styles/homePage.css"

import FriendTable from "../../components/friendTable"
import RoomTable from "../../components/roomTable"
import FriendAddTable from "../../components/friendAddTable"
import RoomAddTable from "../../components/roomAddTables"
import FriendExamineTable from "../../components/friendExamineTable"
import MyInformation from "../../components/myInformation"
import MyPassword from "../../components/myPassword"
import ChattingRoom from "../../components/chattingRoom"
import RoomCreate from "../../components/roomCreate"
import RoomExamineTable from "../../components/roomExamine"
// import { cookies } from 'koa/lib/context';

const { SubMenu } = Menu
const { Header, Content, Sider } = Layout

export default class HomePage extends Component {
  state = {
    user: {
      id: null,
      nickname: "",
      email: "",
      birthday: "",
      sex: null,
      picture: "default.jpeg",
    },
    menuSelectKey: "",
    isLogin: false,
    socket: null,
    rooms: [],
    friendList: [],
    totalUnreadMessageCnt: 0,
    unreadMessageCnt: {},
    roomNewMessages: {},
    openKeys: [],
    selectedRoom: null,
    storage: window.sessionStorage,
  }

  async componentDidMount() {
    let userId, friendList
    await this.initUser().then((res) => {
      userId = res.userId
    })
    await this.initFriendList(userId).then((res) => {
      friendList = res.friendList
    })
    await this.initRoom(userId, friendList)

    const { socket } = this.state
    socket.emit("queryRoomsUnreadCount", this.state.user.id)
    socket.on("updateRoomsUnreadCount", (res) => {
      if (!res.flag) {
        message.error(res.message)
      } else {
        this.showUnreadMessageCnt(res.data)
      }
    })
  }

  initUser = () => {
    return new Promise((resolve, reject) => {
      // 获取用户信息
      this.$axios.get("/user").then((res) => {
        if (res.data.flag) {
          this.setState({
            user: res.data.data,
          })
        } else {
          this.setState({
            isLogin: true,
          })
          return
        }

        // 连接服务器 socket 服务
        const socket = io("ws://localhost:8000")

        socket.on("connect", () => {
          socket.emit("updateUserId", res.data.data.id)

          this.setState({
            socket: socket,
          })

          resolve({
            userId: res.data.data.id,
          })
        })
      })
    })
  }

  initFriendList = (userId) => {
    return new Promise((resolve, reject) => {
      // 获取好友列表
      this.$axios({
        method: "get",
        url: "/friends/list",
        params: {
          userId: userId,
        },
      }).then((res) => {
        res.data.data.forEach((element) => {
          element.key = element.id
        })

        this.setState({
          friendList: res.data.data,
        })

        resolve({
          friendList: res.data.data,
        })
      })
    })
  }

  initRoom = (userId, friendList) => {
    return new Promise((resolve, reject) => {
      // 获取房间列表
      this.$axios({
        method: "get",
        url: "/rooms/query",
        params: {
          userId: userId,
        },
      }).then((res) => {
        let friendMap = []
        for (let i = 0; i < friendList.length; i++) {
          friendMap[friendList[i].id] = friendList[i].nickname
        }
        res.data.data.forEach((element) => {
          if (element.room_name.indexOf("-") !== -1) {
            var users = element.room_name.split("-")
            if (parseInt(users[0]) === userId) {
              element.room_name = friendMap[parseInt(users[1])]
            } else {
              element.room_name = friendMap[parseInt(users[0])]
            }
          }
        })

        this.setState(
          {
            rooms: res.data.data,
          },
          resolve
        )
      })
    })
  }

  showUnreadMessageCnt = (data) => {
    const unreadMessageCnt = {}
    let totalUnreadMessageCnt = 0
    data.forEach((roomdata) => {
      Object.assign(unreadMessageCnt, { [roomdata.room_id]: roomdata.count })
      totalUnreadMessageCnt += roomdata.count
    })
    this.setState(
      {
        unreadMessageCnt,
        totalUnreadMessageCnt,
      },
      () => {
        this.receiveNewMessage()
      }
    )
  }

  //显示新消息数
  receiveNewMessage = () => {
    const sortedRooms = this.state.rooms.sort(
      (a, b) =>
        (this.state.unreadMessageCnt[b.room_id] || 0) -
        (this.state.unreadMessageCnt[a.room_id] || 0)
    )
    this.setState({
      rooms: sortedRooms,
    })
    this.state.socket.on("newMessage", (newMessage) => {
      //newMessage: {room: roomid, message: {sender:xx, content:xx}}
      if (
        newMessage.sender !== this.state.user.id &&
        newMessage.room !== this.state.selectedRoom
      ) {
        const { unreadMessageCnt } = this.state
        const unreadcnt = unreadMessageCnt[newMessage.room] || 0
        // console.log(`unread: ${unreadcnt}`)
        this.setState(
          {
            unreadMessageCnt: Object.assign(unreadMessageCnt, {
              [newMessage.room]: unreadcnt + 1,
            }),
            totalUnreadMessageCnt: this.state.totalUnreadMessageCnt + 1,
          },
          () => {
            //新消息窗口置顶
            const { rooms } = this.state
            const crtIdx = rooms.findIndex(
              (room) => String(room.room_id) === String(newMessage.room)
            )
            const crtRoom = rooms[crtIdx]
            for (let i = crtIdx - 1; i >= 0; --i) {
              rooms[i + 1] = rooms[i]
            }
            rooms[0] = crtRoom
            this.setState({
              rooms,
            })
          }
        )
      }
    })
  }

  onMessageTest = () => {
    // 单聊
    this.state.socket.emit("message", {
      roomId: 1,
      text: "hello world",
      sendId: 1,
    })
  }

  onClickFunction = (values) => {
    this.setState({
      menuSelectKey: values.key,
    })
    //记录当前打开的消息窗口
    if (this.state.openKeys[0] === "MessageList") {
      const { unreadMessageCnt, totalUnreadMessageCnt } = this.state
      let cnt = unreadMessageCnt[values.key] || 0
      this.setState({
        //取消当前窗口的未读消息数显示
        unreadMessageCnt: Object.assign(unreadMessageCnt, { [values.key]: 0 }),
        totalUnreadMessageCnt: totalUnreadMessageCnt - cnt,
        selectedRoom: values.key,
      })
    } else {
      this.setState({
        selectedRoom: null,
      })
    }
  }

  refreshPage = (newUserInfo) => {
    this.setState({
      user: newUserInfo,
    })
  }

  onQuit = () => {
    this.$axios.post("/exit").then((res) => {
      if (res.data.flag === true) {
        this.setState({
          isLogin: true,
        })
      } else {
        message.error(res.data.message)
      }
    })
  }

  onOpenChange = (selectedKeys) => {
    if (selectedKeys.length > 1) {
      selectedKeys = [selectedKeys[selectedKeys.length - 1]]
    }
    this.setState({
      openKeys: selectedKeys,
    })
  }

  componentWillUnmount = () => {
    this.setState = (state, callback) => {
      return
    }
  }

  render() {
    if (this.state.isLogin) {
      return <Navigate to="/login" />
    }

    const fileUrl = this.$imageurl + this.state.user.picture

    return (
      <Layout className="homePage">
        <Header className="header">
          <Avatar size={40} src={fileUrl} />
          {/* <Button type="primary" onClick={this.onMessageTest} danger>测试</Button> */}
          <span style={{ marginLeft: 15, color: "white", fontSize: 16 }}>
            {this.state.user.nickname}
          </span>
          <Button
            type="primary"
            style={{ float: "right", marginTop: 16 }}
            onClick={this.onQuit}
            danger
          >
            登出
          </Button>
        </Header>
        <Layout>
          <Sider width={170} className="site-layout-background">
            {/* 未读消息数显示 */}
            <div style={{ position: "absolute", right: 35, top: 11 }}>
              <Badge count={this.state.totalUnreadMessageCnt} size="small" />
            </div>
            <Menu
              mode="inline"
              openKeys={this.state.openKeys}
              onOpenChange={this.onOpenChange}
              style={{ height: "100%", borderRight: 0 }}
              onClick={this.onClickFunction}
            >
              <SubMenu
                key="MessageList"
                icon={<MessageOutlined />}
                title="消息列表"
              >
                {this.state.rooms.map((room) => (
                  <Menu.Item key={room.room_id}>
                    <div
                      key="0"
                      style={{ position: "absolute", right: 40, bottom: 1 }}
                    >
                      <Badge
                        count={this.state.unreadMessageCnt[room.room_id] || 0}
                        size="small"
                      />
                    </div>
                    {room.room_name}
                  </Menu.Item>
                ))}
              </SubMenu>
              <SubMenu
                key="FriendsManage"
                icon={<ContactsOutlined />}
                title="好友管理"
              >
                <Menu.Item key="friendList">好友列表</Menu.Item>
                <Menu.Item key="addFriend">添加好友</Menu.Item>
                <Menu.Item key="friendExamine">好友审核</Menu.Item>
              </SubMenu>
              <SubMenu
                key="RoomManage"
                icon={<GroupOutlined />}
                title="群组管理"
              >
                <Menu.Item key="roomList">群组列表</Menu.Item>
                <Menu.Item key="createRoom">创建群组</Menu.Item>
                <Menu.Item key="addRoom">添加群组</Menu.Item>
                <Menu.Item key="roomExamine">群组审核</Menu.Item>
              </SubMenu>
              <SubMenu
                key="PersonalSettings"
                icon={<UserOutlined />}
                title="个人设置"
              >
                <Menu.Item key="personalInfo">个人信息</Menu.Item>
                <Menu.Item key="modifyPassword">密码修改</Menu.Item>
              </SubMenu>
              <SubMenu
                key="SystemSettings"
                icon={<SettingOutlined />}
                title="系统选项"
              >
                <Menu.Item key="systemSettings">系统设置</Menu.Item>
                <Menu.Item key="systemInforms">系统通知</Menu.Item>
              </SubMenu>
            </Menu>
          </Sider>
          <Layout style={{ padding: "24px 24px" }}>
            <Content
              className="site-layout-background"
              style={{
                padding: 24,
                margin: 0,
                minHeight: 280,
              }}
            >
              {!this.state.menuSelectKey.length ? (
                <iframe
                  title="解压"
                  src={"http://spielzeugz.de/html5/liquid-particles-3D/"}
                  height="100%"
                  width="100%"
                />
              ) : null}
              {this.state.selectedRoom ? (
                <ChattingRoom
                  key={this.state.selectedRoom}
                  room={this.state.selectedRoom}
                  user={this.state.user}
                  socket={this.state.socket}
                />
              ) : null}
              {this.state.menuSelectKey === "friendList" ? (
                <FriendTable user={this.state.user} />
              ) : null}
              {this.state.menuSelectKey === "roomList" ? (
                <RoomTable user={this.state.user} />
              ) : null}
              {this.state.menuSelectKey === "addFriend" ? (
                <FriendAddTable user={this.state.user} />
              ) : null}
              {this.state.menuSelectKey === "addRoom" ? (
                <RoomAddTable user={this.state.user} />
              ) : null}
              {this.state.menuSelectKey === "createRoom" ? (
                <RoomCreate user={this.state.user} />
              ) : null}
              {this.state.menuSelectKey === "friendExamine" ? (
                <FriendExamineTable user={this.state.user} />
              ) : null}
              {this.state.menuSelectKey === "roomExamine" ? (
                <RoomExamineTable user={this.state.user} />
              ) : null}
              {this.state.menuSelectKey === "personalInfo" ? (
                <MyInformation
                  user={this.state.user}
                  refreshPage={(newUserInfo) => this.refreshPage(newUserInfo)}
                />
              ) : null}
              {this.state.menuSelectKey === "modifyPassword" ? (
                <MyPassword user={this.state.user} />
              ) : null}
            </Content>
          </Layout>
        </Layout>
      </Layout>
    )
  }
}
