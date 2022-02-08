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
        let sql = `SELECT u.id, u.nickname, u.email, u.picture FROM friend_examine f, users u 
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
        let sql = `INSERT INTO friend_examine (send_id, receive_id) VALUES (?,?)`;
        db.query(sql, [userId, friendId], function(err, results, fields){
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

        resolve({
            flag: true,
            message: 'success'
        });
    });
}