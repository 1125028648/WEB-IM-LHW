var mysql = require('mysql');

exports.connect = ()=>{
    var connection = mysql.createConnection({
        host: '127.0.0.1',
        user: 'root',
        password: '123456',
        database: 'webim'
    });
    
    connection.connect(function(err) {
        if(err){
            console.error('error connecting: ' + err.stack);
            return;
        }
        console.log('connected as id ' + connection.threadId);
    });

    return connection;
}