import React, {Component} from 'react';

class Test extends Component{
    constructor(){
        super();
        this.onClick = this.onClick.bind(this);
        this.onExit = this.onExit.bind(this);
    }

    onClick(){
        this.$axios.post('/test').then(res =>{
            console.log(res.data);
        })
    }

    onExit(){
        this.$axios.post('/exit').then(res => {
            console.log(res.data);
        })
    }

    render(){
        return (
            <div>
                <button onClick={this.onClick}>点击</button>
                <button onClick={this.onExit}>退出</button>
            </div>
        )
    }
}

export default Test;