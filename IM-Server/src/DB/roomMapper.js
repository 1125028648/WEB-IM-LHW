const { reject } = require("underscore");

// 查找用户添加的所有房间
exports.queryRoom = (db, userId) =>{
    return new Promise((resolve, reject) => {
        let sql = `SELECT room_name, r.id AS room_id FROM rooms r, room_join rj WHERE rj.user_id = ? AND r.id = rj.room_id`;

        db.query(sql, [userId], function (err, results, fields) {
            if(err) {
                resolve({
                    flag: false,
                    message: 'error'
                });
                return;
            };
            
            var dataString = JSON.stringify(results);
            var data = JSON.parse(dataString);

            resolve({
                flag: true,
                message: 'success',
                data: data
            });
        });
    })
}

// 接收消息
exports.receiveMessage = (db, message) =>{
    return new Promise((resolve, reject) => {
        // 保存消息
        let sql = `INSERT INTO messages (send_id, room_id, send_time, message) VALUES(?, ?, NOW(), ?)`;
        
        db.query(sql, [message.sendId, message.roomId, message.text], function (err, results, fields) {
            if(err) {
                resolve({
                    flag: false,
                    message: 'error'
                });
                return;
            };

            let messageId = results.insertId;
            // 读取情况
            let sql2 = `SELECT us.user_id AS user_id FROM room_join rj, users_state us WHERE rj.room_id = ? AND us.state = 1 AND rj.user_id = us.user_id`;

            db.query(sql2, [message.roomId], function(err, results, fields){
                if(err) {
                    resolve({
                        flag: false,
                        message: 'error'
                    });
                    return;
                };

                var dataString = JSON.stringify(results);
                var data = JSON.parse(dataString);

                for(let i = 0; i<data.length; i++){
                    // 插入已读
                    let sql3 = `INSERT INTO message_read (message_id, receive_id, state) VALUES (?, ?, 1)`;
                    db.query(sql3, [messageId, data[i].user_id], function(err, results, fields){
                        if(err) {
                            resolve({
                                flag: false,
                                message: 'error'
                            });
                            return;
                        };
                    });
                }
            });


            let sql4 = `SELECT us.user_id AS user_id FROM room_join rj, users_state us WHERE rj.room_id = ? AND us.state = 0 AND rj.user_id = us.user_id`;

            db.query(sql4, [message.roomId], function(err, results, fields){
                if(err) {
                    resolve({
                        flag: false,
                        message: 'error'
                    });
                    return;
                };

                var dataString = JSON.stringify(results);
                var data = JSON.parse(dataString);

                for(let i = 0; i<data.length; i++){
                    // 插入未读
                    let sql5 = `INSERT INTO message_read (message_id, receive_id, state) VALUES (?, ?, 0)`;
                    db.query(sql5, [messageId, data[i].user_id], function(err, results, fields){
                        if(err) {
                            resolve({
                                flag: false,
                                message: 'error'
                            });
                            return;
                        };
                    });
                }
            });

            resolve({
                flag: true,
                message: 'success',
            });
        });
    });
}