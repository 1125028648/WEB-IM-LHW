import React, { Component } from 'react';
import { Button, message, Input, Select, DatePicker, Upload } from 'antd';
import moment from 'moment';
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';

const { Option } = Select;

const dateFormat = 'YYYY-MM-DD';

function getBase64(img, callback) {
    const reader = new FileReader();
    reader.addEventListener('load', () => callback(reader.result));
    reader.readAsDataURL(img);
}

function beforeUpload(file) {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
        message.error('You can only upload JPG/PNG file!');
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
        message.error('Image must smaller than 2MB!');
    }
    return isJpgOrPng && isLt2M;
}

export default class MyInformation extends Component{

    constructor(props){
        super(props);
        console.log(this.props.user);
        this.state = {
            userInfo: {},
            loading: false,
            responseName: "",
        }
    }

    componentDidMount(){
        this.setState({
            userInfo: this.props.user
        });
    }

    handleNicknameChange= (event) =>{
        if(event && event.target && event.target.value !== ''){
            let data = Object.assign({}, this.state.userInfo, {nickname: event.target.value});
            this.setState({
                userInfo: data,
            });
        }
    }

    handleSexChange = (value) =>{
        let data = Object.assign({}, this.state.userInfo, {sex: value});
        this.setState({
            userInfo: data,
        });
    }

    handleBirthdayChange = (date, dateString) =>{
        let data = Object.assign({}, this.state.userInfo, {birthday: dateString});
        this.setState({
            userInfo: data,
        });
    }

    handleChange = info => {
        if (info.file.status === 'uploading') {
            this.setState({ loading: true });
            return;
        }
        if (info.file.status === 'done') {
            let data = Object.assign({}, this.state.userInfo, {picture: info.file.response.filename});

            // Get this url from response in real world.
            getBase64(info.file.originFileObj, imageUrl =>
                this.setState({
                    imageUrl,
                    loading: false,
                    userInfo: data
                }),
            );
        }
    };

    onSave = () => {
        this.$axios({
            method: 'post',
            url: '/users/update/info',
            data: this.state.userInfo
        }).then(res => {
            if(res.data.flag) {
                this.props.refreshPage(this.state.userInfo);
                message.success("修改成功")
            }else{
                message.error(res.data.message);
            }
        })
    }

    render(){
        const { loading, imageUrl } = this.state;
        const uploadButton = (
            <div>
                {loading ? <LoadingOutlined /> : <PlusOutlined />}
                <div style={{ marginTop: 8 }}>上传头像</div>
            </div>
        );

        return (
            <div>
                <Upload
                    name="avatar"
                    listType="picture-card"
                    className="avatar-uploader"
                    showUploadList={false}
                    action='http://localhost:8000/upload'
                    beforeUpload={beforeUpload}
                    onChange={this.handleChange}
                >
                    {imageUrl ? <img src={imageUrl} alt="avatar" style={{ width: '100%' }} /> : uploadButton}
                </Upload>
                <span>邮箱:</span>
                <Input 
                    value={this.state.userInfo.email} 
                    style={{width: 200, marginLeft: 20, marginRight: 20}} disabled
                />
                <span>昵称:</span>
                <Input 
                    value={this.state.userInfo.nickname} 
                    onChange={event => this.handleNicknameChange(event)} 
                    style={{width: 200, marginLeft: 20}}
                />
                <br/>
                <span>性别:</span>
                <Select 
                    defaultValue={this.state.userInfo.sex} 
                    key={this.state.userInfo.sex} 
                    onChange={value => this.handleSexChange(value)} 
                    style={{width: 200, margin: '10px 20px 0px 20px' }}
                >
                    <Option value={1} key='1'>男</Option>
                    <Option value={0} key='0'>女</Option>
                </Select>
                <span>生日:</span>
                <DatePicker 
                    onChange={this.handleBirthdayChange} 
                    style={{width: 200, marginLeft: 20}} 
                    value={
                        this.state.userInfo.birthday === null ? undefined :moment(this.state.userInfo.birthday, dateFormat)
                    } 
                    format={dateFormat} 
                />
                <br/>
                <Button type='primary' onClick={this.onSave} style={{marginLeft: 460, marginTop: 20}}>保存</Button>
            </div>
        )
    }
}