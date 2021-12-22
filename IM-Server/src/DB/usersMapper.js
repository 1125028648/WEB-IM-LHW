exports.queryUser = (db, email, password) =>{
    return new Promise((resolve, reject) => {
        let sql = `SELECT id, nickname, password, role, email, birthday, 
        sex FROM users WHERE email = ? and password = ?`;

        db.query(sql,
        [email, password], function (err, results, fields) {
            if(err) {
                resolve({
                    flag: false,
                    message: 'error'
                });
                return;
            };
            // 去掉 RowDataPacket
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

exports.userLogin = (db, email, password) => {
    return new Promise((resolve, reject) => {
        let sql = `SELECT id, nickname, role, email, birthday, sex FROM users WHERE email = ? and password = ?`;

        db.query(sql,
        [email, password], function (err, results, fields) {
            if(err) {
                resolve({
                    flag: false,
                    message: 'error'
                });
                return;
            };
            var dataString = JSON.stringify(results);
            var data = JSON.parse(dataString);
            if(data.length > 0){
                // 根据user_id查询用户状态表
                let query_user = `SELECT id, user_id, socket_id, state FROM users_state WHERE user_id = ?`;

                db.query(query_user, [data[0].id], function(err, results, fields){
                    if(err) {
                        resolve({
                            flag: false,
                            message: 'error'
                        });
                        return;
                    };
                
                    var query_string = JSON.stringify(results);
                    var query_data = JSON.parse(query_string);
                    // 状态表中存在
                    if(query_data.length > 0){
                        if(query_data[0].state === 0){
                            let update_user = `UPDATE users_state SET state = ? WHERE user_id = ?`;

                            db.query(update_user, [1, data[0].id], function(err, results, fields){
                                if(err) {
                                    resolve({
                                        flag: false,
                                        message: 'error'
                                    });
                                    return;
                                };
                            });
                        }
                    }else{
                        // 状态表中不存在
                        let insert_user = `INSERT INTO users_state (user_id, state) VALUES (?, ?)`;

                        db.query(insert_user, [data[0].id, 1], function(err, results, fields){
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
                    data: data[0]
                });
            }else{
                resolve({
                    flag: false,
                    message: 'failed'
                })
            }
        });
    })
}

exports.insertUser = (db, user) => {
    return new Promise((resolve, reject) => {
        const {nickname, password, email} = user;
        const role = 1;
        // 查询用户邮箱是否已经注册过
        let queryEmail = `SELECT count(*) as nums FROM users WHERE email = ?`;
        db.query(queryEmail, [email], function(err, results, fields){
            if(err) {
                resolve({
                    flag: false,
                    message: 'error'
                });
                return;
            };

            let dataString = JSON.stringify(results);
            let data = JSON.parse(dataString);
            if(data[0].nums > 0){
                resolve({
                    flag: false,
                    message: 'email is used.'
                });
            }else{
                let sql = `INSERT INTO users (nickname, password, role, email) VALUES (?, ?, ?, ?)`;

                db.query(sql, [nickname, password, role, email], function (err, results, fields) {
                    if(err) {
                        resolve({
                            flag: false,
                            message: 'error'
                        });
                        return;
                    };

                    let dataString = JSON.stringify(results);
                    let data = JSON.parse(dataString);
                    resolve({
                        flag: true,
                        message: 'success'
                    });
                });
            }
        })
    })
}

exports.exitUser = (db, userId) => {
    return new Promise((resolve, reject) => {
        let query_user = `UPDATE users_state SET state = 0 WHERE user_id = ?`;

        db.query(query_user, [userId], function(err, results, fields){
            if(err) {
                resolve({
                    flag: false,
                    message: 'error'
                });
                return;
            };

            resolve({
                flag: true,
                message: 'success'
            });
        });
    })
}