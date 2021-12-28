import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import axios from 'axios';
import md5 from 'js-md5'

axios.defaults.baseURL = 'http://localhost:8000';
axios.defaults.withCredentials = 'true';
React.Component.prototype.$axios = axios;
React.Component.prototype.$md5 = md5;

ReactDOM.render(
  <React.StrictMode>
    <App/>
  </React.StrictMode>, 
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
