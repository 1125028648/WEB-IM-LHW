import React, { Component } from 'react';
import { Table, Popconfirm, Button, message } from 'antd';

export default class FriendExamineTable extends Component{

    constructor(props){
        super(props);

        this.state = {
            dataSource: [],
        }

        this.columns = [
            {
              title: 'Id',
              dataIndex: 'id',
            },
            {
              title: '昵称',
              dataIndex: 'nickname',
            },
            {
              title: '邮箱',
              dataIndex: 'email',
            },
            {
              title: '操作',
              key: 'operation',
              render: (text, record) => {
                  return this.state.dataSource.length >= 1 ? (
                    <div>
                        <Popconfirm title="确认添加？" onConfirm={() => this.handleAgree(record.key)}>
                            <Button type="primary">通过</Button>
                        </Popconfirm>
                        <Popconfirm title="确认拒绝？" onConfirm={() => this.handleReject(record.key)}>
                            <Button type="primary" style={{ marginLeft: '20px' }} danger>拒绝</Button>
                        </Popconfirm>
                    </div>
                ) : null;
              },
            },
        ];
    }

    handleAgree= (key) =>{
        this.$axios({
            method: 'get',
            url: '/friends/examine/update',
            params: {
                exId: key
            }
        }).then(res => {
            let friendId = null;
            let mlist = this.state.dataSource;
            for(let i=0; i<mlist.length; i++){
                if(mlist[i].key === key){
                    friendId = mlist[i].id;
                    break;
                }
            }

            if(res.data.flag === true){
                this.$axios({
                    method: 'post',
                    url: '/friends/insert',
                    data: {
                        userId: this.props.user.id,
                        friendId: friendId,
                    }
                }).then(res2 => {
                    if(res2.data.flag === true){
                        const dataSource = [...this.state.dataSource];
                        this.setState({ dataSource: dataSource.filter(item => item.key !== key) });
                    }else{
                        message.error(res2.data.message);
                    }
                })
            }else{
                message.error(res.data.message);
            }
        });
    }

    handleReject= (key) =>{
        this.$axios({
            method: 'get',
            url: '/friends/examine/update',
            params: {
                exId: key
            }
        }).then(res => {
            if(res.data.flag === true){
                const dataSource = [...this.state.dataSource];
                this.setState({ dataSource: dataSource.filter(item => item.key !== key) });
            }else{
                message.error(res.data.message);
            }
        })
    }

    componentDidMount(){
        // 查询审核列表
        this.$axios({
            method: 'get',
            url: '/friends/examine/query',
            params: {
                userId: this.props.user.id
            }
        }).then(res =>{
            if(res.data.flag === true){
                res.data.data.forEach(element => {
                    element.key = element.exid;
                });
    
                this.setState({
                    dataSource: res.data.data
                });
            }else{
                message.error(res.data.message);
            }
        })
    }

    render(){
        return (
            <Table columns={this.columns} dataSource={this.state.dataSource}/>
        )
    }
}