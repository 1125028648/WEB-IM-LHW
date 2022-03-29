// 查询好友列表
exports.queryFriends = (db, userId) =>{
    return new Promise((resolve, reject) => {
        let sql = `SELECT u.id, u.nickname, u.email, u.picture FROM friends f, users u WHERE f.user_id = ? AND f.friend_id = u.id `;
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
        });
    })
}

// 好友审核查询
exports.queryFriendExamine = (db, userId) => {
    return new Promise((resolve, reject) =>{
        let sql = `SELECT u.id, u.nickname, u.email, u.picture, f.id AS exid FROM friend_examine f, users u 
        WHERE f.send_id = u.id AND f.receive_id = ? AND f.state = 0`;

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

// 在好友审核表中添加记录
exports.addFriendExamine = (db, userId, friendId) =>{
    return new Promise((resolve, reject) =>{
        // 查找是否已经申请过
        let sql = `SELECT id FROM friend_examine WHERE ((send_id = ? AND receive_id = ?) OR (send_id = ? AND receive_id = ?)) AND state = 0`;
        db.query(sql, [userId, friendId, friendId, userId], function(err, results, fields){
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
                    message: 'have sent request or please handle request before',
                });
                return;
            }

            let insertSql = `INSERT INTO friend_examine (send_id, receive_id) VALUES (?,?)`;
            db.query(insertSql, [userId, friendId], function(err, results, fields){
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
}

// 修改审核表记录
exports.updateFriendExamine = (db, exId) => {
    return new Promise((resolve, reject) => {
        let exSql = `UPDATE friend_examine SET state = 1 WHERE id = ?`;
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

// 同意添加好友后，添加到好友表
exports.addFriend = (db, userId, friendId) =>{
    return new Promise((resolve, reject) => {
        let insertSql = `INSERT INTO friends (user_id, friend_id) VALUES (?, ?)`;
        db.query(insertSql, [userId, friendId], function(err, results, fields){
            if(err){
                resolve({
                    flag: false,
                    message: 'error'
                });
                return;
            }
        });

        db.query(insertSql, [friendId, userId], function(err, results, fields){
            if(err){
                resolve({
                    flag: false,
                    message: 'error'
                });
                return;
            }
        });

        // 创建房间
        let sql = `INSERT INTO rooms(room_name, creator_id) VALUES (?, ?)`;
        let roomName = userId + "-" + friendId;
        db.query(sql, [roomName, userId], function(err, results, fields){
            if(err){
                resolve({
                    flag: false,
                    message: 'error'
                });
                return;
            }

            let roomId = results.insertId;
            // 加入房间
            let sql2 = `INSERT INTO room_join (room_id, user_id) VALUES (?, ?)`;

            db.query(sql2, [roomId, userId], function(err, results, fields){
                if(err){
                    resolve({
                        flag: false,
                        message: 'error'
                    });
                    return;
                }
            });

            db.query(sql2, [roomId, friendId], function(err, results, fields){
                if(err){
                    resolve({
                        flag: false,
                        message: 'error'
                    });
                    return;
                }
            });
        });

        resolve({
            flag: true,
            message: 'success'
        });
    });
}

// 删除好友
exports.deleteFriend = (db, userId, friendId) => {
    return new Promise((resolve, reject) =>{
        let sql = `DELETE FROM friends WHERE user_id = ? AND friend_id = ?`;
        db.query(sql, [userId, friendId], function(err, results, fields){
            if(err){
                resolve({
                    flag: false,
                    message: 'error'
                });
                return;
            }
        });

        db.query(sql, [friendId, userId], function(err, results, fields){
            if(err){
                resolve({
                    flag: false,
                    message: 'error'
                });
                return;
            }
        });

        // 删除房间
        let roomName1 = userId + "-" + friendId;
        let roomName2 = friendId + "-" + userId;
        let sql2 = `DELETE FROM rooms WHERE room_name = ? OR room_name = ?`;
        db.query(sql2, [roomName1, roomName2], function(err, results, fields){
            if(err){
                resolve({
                    flag: false,
                    message: 'error'
                });
                return;
            }
        });

        resolve({
            flag: true,
            message: 'success'
        });
    });
}