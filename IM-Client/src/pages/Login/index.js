import React, { Component } from "react"
import { Form, Input, Button, message } from "antd"
import { Navigate } from "react-router-dom"
import "../../styles/login.css"

export default class Login extends Component {
  constructor(props) {
    super(props)
    this.state = {
      login: false,
      toRegister: false,
    }
  }

  // 提交成功
  onFinish = (values) => {
    values.password = this.$md5(values.password)

    this.$axios.post("/login", values).then((res) => {
      if (res.data.flag === true) {
        this.setState({
          login: true,
          userInfo: res.data,
        })
      } else {
        message.error(res.data.message)
      }
    })
  }

  onRegister = () => {
    this.setState({
      toRegister: true,
    })
  }

  render() {
    if (this.state.login) {
      return <Navigate to="/homePage" />
    }

    if (this.state.toRegister) {
      return <Navigate to="/register" />
    }

    return (
      <div className="loginBackground">
        <div className="loginFrame">
          <h1
            style={{
              textAlign: "center",
              fontWeight: "bolder",
              color: "#1890ff",
            }}
          >
            用户登录
          </h1>
          <Form
            name="login"
            labelCol={{ span: 7 }}
            wrapperCol={{ span: 12 }}
            // initialValues={{remember: true,}}
            onFinish={this.onFinish}
            autoComplete="off"
          >
            <Form.Item
              label="邮箱"
              name="email"
              rules={[
                {
                  required: true,
                  message: "请输入邮箱！",
                },
              ]}
            >
              <Input className="input" />
            </Form.Item>
            <Form.Item
              label="密码"
              name="password"
              rules={[
                {
                  required: true,
                  message: "请输入密码！",
                },
              ]}
            >
              <Input.Password className="input" />
            </Form.Item>
            <Form.Item
              wrapperCol={{
                offset: 8,
                span: 16,
              }}
            >
              <Button type="primary" htmlType="submit">
                登录
              </Button>
              <Button
                type="primary"
                onClick={this.onRegister}
                className="register"
              >
                注册
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>
    )
  }
}
