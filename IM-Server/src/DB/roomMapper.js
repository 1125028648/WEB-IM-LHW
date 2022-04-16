// 用户获取所有消息
exports.queryRoomMessages = (db, roomInfo) => {
    return new Promise( (resolve, reject) => {
        // 查询未读消息
        let sql = `SELECT mr.id FROM messages m, message_read mr 
        WHERE mr.message_id = m.id AND receive_id = ? AND m.room_id = ? AND mr.state = 0`;

        db.query(sql, [roomInfo.userId, roomInfo.room], function(err, results){
            if(err) {
                return;
            }

            var dataString = JSON.stringify(results);
            var data = JSON.parse(dataString);

            for(let i = 0; i < data.length; i++){
                // 更新为已读
                let sql2 = `UPDATE message_read SET state = 1 WHERE id = ?`;
                db.query(sql2, [data[i].id], function(err, results){
                    if(err) {
                        return;
                    }
                })
            }

            // 查询所有消息
            let sql3 = `SELECT send_id, send_time, message FROM messages WHERE room_id= ?`;

            db.query(sql3, [roomInfo.room], function (err, results) {
                if(err) {
                    return;
                }
    
                var dataString = JSON.stringify(results);
                var data = JSON.parse(dataString);
    
                resolve({
                    room: roomInfo.room,
                    messages: data,
                })
            })
        })
        
    })
}

// 查询每个房间未读消息总数
exports.queryRoomNoReadCount = (db, userId) =>{
    return new Promise((resolve, reject)=>{
        let sql = `SELECT m.room_id, COUNT(*) AS count FROM message_read mr, messages m 
        WHERE mr.message_id = m.id AND mr.state = 0 AND mr.receive_id = ? GROUP BY m.room_id`;

        db.query(sql, [userId], function(err, results, fields){
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
        })
    })
}

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
        
        db.query(sql, [message.send_id, message.room, message.content], function (err, results, fields) {
            if(err) {
                resolve({
                    flag: false,
                    message: 'error'
                });
                return;
            };

            let messageId = results.insertId;
            // 读取情况
            let sql2 = `SELECT us.user_id AS user_id FROM room_join rj, users_state us 
            WHERE rj.room_id = ? AND us.state = 1 AND rj.user_id = us.user_id`;

            db.query(sql2, [message.room], function(err, results, fields){
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


            let sql4 = `SELECT us.user_id AS user_id FROM room_join rj, users_state us 
            WHERE rj.room_id = ? AND us.state = 0 AND rj.user_id = us.user_id`;

            db.query(sql4, [message.room], function(err, results, fields){
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

// 查询群
exports.queryRoomList = (db, userId) => {
    return new Promise((resolve, reject) =>{
        let sql = `SELECT r.id AS room_id, r.room_name FROM room_join rj, rooms r 
        WHERE r.id = rj.room_id AND r.room_name NOT LIKE '%-%' AND rj.user_id = ?`;

        db.query(sql, [userId], function(err, results, fields){
            if(err){
                resolve({
                    flag: false,
                    message: 'error'
                });
                return;
            }

            var dataString = JSON.stringify(results);
            var data = JSON.parse(dataString);

            resolve({
                flag: true,
                message: 'success',
                data: data
            });
        })
    })
}

// 查询群成员
exports.queryRoomMember = (db, roomId) =>{
    return new Promise((resolve, reject) =>{
        let sql = `SELECT u.id, u.nickname, u.email, u.birthday, u.sex, u.picture FROM room_join rj, users u 
        WHERE rj.user_id = u.id AND rj.room_id = ?`;

        db.query(sql, [roomId], function(err, results, fields){
            if(err){
                resolve({
                    flag: false,
                    message: 'error'
                });
                return;
            }

            var dataString = JSON.stringify(results);
            var data = JSON.parse(dataString);

            resolve({
                flag: true,
                message: 'success',
                data: data
            });
        })
    })
}

// 创建群
exports.createRoom = (db, userId, roomName) =>{
    return new Promise((resolve, reject) => {
        let sql = `INSERT INTO rooms(room_name, creator_id) VALUES(?, ?)`;

        db.query(sql, [roomName, userId], function(err, results, fields){
            if(err){
                resolve({
                    flag: false,
                    message: 'error'
                });
                return;
            }

            let roomId = results.insertId;
            let sql2 = `INSERT INTO room_join (room_id, user_id) VALUES (?, ?)`;

            db.query(sql2, [roomId, userId], function(err, results, fields){
                if(err){
                    resolve({
                        flag: false,
                        message: 'error'
                    });
                    return;
                }
            })

            resolve({
                flag: true,
                message: 'success'
            });
        });
    })
}

// 根据群名模糊查找群
exports.queryRoomByName = (db, roomName) =>{
    return new Promise((resolve, reject) =>{
        let condition = "%" + roomName + "%";
        let sql = `SELECT r.id AS room_id, r.room_name, creator_id, u.email, u.nickname FROM rooms r, users u 
        WHERE r.room_name LIKE ?  AND r.room_name NOT LIKE '%-%' AND r.creator_id = u.id`;

        db.query(sql, [condition], function(err, results, fields){
            if(err){
                resolve({
                    flag: false,
                    message: 'error'
                });
                return;
            }

            var dataString = JSON.stringify(results);
            var data = JSON.parse(dataString);

            resolve({
                flag: true,
                message: 'success',
                data: data,
            });
        })
    })
}

// 添加审核
exports.addRoomExamine = (db, userId, roomId, creatorId) => {
    return new Promise((resolve, reject) =>{
        // 是否已经在群中
        let sql = `SELECT id FROM room_join WHERE user_id = ? AND room_id = ?`;

        db.query(sql, [userId, roomId], function(err, results, fields){
            if(err){
                resolve({
                    flag: false,
                    message: 'error'
                });
                return;
            }

            var dataString = JSON.stringify(results);
            var data = JSON.parse(dataString);

            if(data.length > 0){
                resolve({
                    flag: false,
                    message: '你已在群中'
                });
                return;
            }

            // 是否已经申请审核
            let sql1 = `SELECT id FROM room_examine WHERE send_id = ? AND room_id = ? AND state = 0`;

            db.query(sql1, [userId, roomId], function(err, results, fields){
                if(err){
                    resolve({
                        flag: false,
                        message: 'error'
                    });
                    return;
                }
                
                var dataString = JSON.stringify(results);
                var data = JSON.parse(dataString);

                if(data.length > 0){
                    resolve({
                        flag: false,
                        message: '已发送过申请'
                    });
                    return;
                }

                // 添加申请
                let sql2 = `INSERT INTO room_examine(send_id, room_id, creator_id, state) VALUES(?, ?, ?, 0)`;

                db.query(sql2, [userId, roomId, creatorId], function(err, results, fields){
                    if(err){
                        resolve({
                            flag: false,
                            message: 'error'
                        });
                        return;
                    }

                    resolve({
                        flag: true,
                        message: 'success'
                    });
                });
            });
        });

    })
}

// 查询审核列表
exports.queryRoomExamine = (db, userId) => {
    return new Promise((resolve, reject) =>{
        let sql = `SELECT re.id AS exid, r.id AS room_id, r.room_name, u.nickname, u.email, re.send_id 
        FROM room_examine re, users u, rooms r 
        WHERE re.room_id = r.id AND re.send_id = u.id AND re.state = 0 AND re.creator_id = ?`;

        db.query(sql, [userId], function(err, results, fields){
            if(err){
                resolve({
                    flag: false,
                    message: 'error'
                });
                return;
            }

            var dataString = JSON.stringify(results);
            var data = JSON.parse(dataString);
            resolve({
                flag: true,
                message: 'success',
                data: data
            });
        })
    })
}


// 处理审核-拒绝
exports.updateRoomExamine = (db, exId) => {
    return new Promise((resolve, reject) => {
        let exSql = `UPDATE room_examine SET state = 1 WHERE id = ?`;
        db.query(exSql, [exId], function(err, results, fields){
            if(err){
                resolve({
                    flag: false,
                    message: 'error'
                });
                return;
            }

            resolve({
                flag: true,
                message: 'success'
            });
        });
    });
}

// 处理申请-同意
exports.agreeRoomExamine = (db, roomId, sendId) =>{
    return new Promise((resolve, reject) =>{
        let sql = `INSERT INTO room_join (room_id, user_id) VALUES (?, ?)`;

        db.query(sql, [roomId, sendId], function(err, results, fields){
            if(err){
                resolve({
                    flag: false,
                    message: 'error'
                });
                return;
            }

            resolve({
                flag: true,
                message: 'success'
            });
        });
    })
}

// 退出群
exports.exitRoom = (db, roomId, userId) =>{
    return new Promise((resolve, reject) =>{
        // 是否是群主
        let sql = `SELECT id FROM rooms WHERE id = ? AND creator_id = ?`;

        db.query(sql, [roomId, userId], function(err, results, fields){
            if(err){
                resolve({
                    flag: false,
                    message: 'error'
                });
                return;
            }

            var dataString = JSON.stringify(results);
            var data = JSON.parse(dataString);

            if(data.length > 0){
                resolve({
                    flag: false,
                    message: '群主不能退群'
                });
                return;
            }

            let sql1 = `DELETE FROM room_join WHERE room_id = ? AND user_id = ?`;

            db.query(sql1, [roomId, userId], function(err, results, fields){
                if(err){
                    resolve({
                        flag: false,
                        message: 'error'
                    });
                    return;
                }

                resolve({
                    flag: true,
                    message: 'success'
                });
            })
        })
    })
}

// 删除群
exports.deleteRoom = (db, userId, roomId) =>{
    return new Promise((resolve, reject) =>{
        let sql = `DELETE FROM rooms WHERE id = ? AND creator_id = ?`;

        db.query(sql, [roomId, userId], function(err, results, fields){
            if(err){
                resolve({
                    flag: false,
                    message: 'error'
                });
                return;
            }

            resolve({
                flag: true,
                message: 'success'
            });
        });
    });
}