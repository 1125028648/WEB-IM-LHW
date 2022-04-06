var mysql = require('mysql');

exports.connect = ()=>{
    var connection = mysql.createConnection({
        host: '127.0.0.1',
        user: 'root',
        // password: '214838',
        password: '123456',
        database: 'webim',
        timezone: "08:00"
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