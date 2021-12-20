exports.queryUser = (db, email, password) =>{
    return new Promise((resolve, reject) => {
        let sql = `SELECT id, username, password, role, email, birthday, 
        sex FROM users WHERE email = ? and password = ?`;

        db.query(sql,
        [email, password], function (err, results, fields) {
            if(err) {
                resolve({
                    message: 'error'
                });
                return;
            };
            // 去掉 RowDataPacket
            var dataString = JSON.stringify(results);
            var data = JSON.parse(dataString);
            resolve(data);
        });
    })
}

exports.userLogin = (db, email, password) => {
    return new Promise((resolve, reject) => {
        let sql = `SELECT id, username, password, role, email, birthday, 
        sex FROM users WHERE email = ? and password = ?`;

        db.query(sql,
        [email, password], function (err, results, fields) {
            if(err) {
                resolve({
                    message: 'error'
                });
                return;
            };
            // 去掉 RowDataPacket
            var dataString = JSON.stringify(results);
            var data = JSON.parse(dataString);
            if(data.length > 0){
                resolve({
                    message: 'success'
                });
            }else{
                resolve({
                    message: 'failed'
                })
            }
        });
    })
}

exports.insertUser = (db, user) => {
    return new Promise((resolve, reject) => {
        const {username, password, email} = user;
        const role = 1;
        // 查询用户邮箱是否已经注册过
        let queryEmail = `SELECT count(*) as nums FROM users WHERE email = ?`;
        db.query(queryEmail, [email], function(err, results, fields){
            if(err) {
                resolve({
                    message: 'error'
                });
                return;
            };

            let dataString = JSON.stringify(results);
            let data = JSON.parse(dataString);
            if(data[0].nums > 0){
                resolve({
                    message: 'email is used.'
                });
            }else{
                let sql = `INSERT INTO users (username, password, role, email) VALUES (?, ?, ?, ?)`;

                db.query(sql, [username, password, role, email], function (err, results, fields) {
                    if(err) {
                        resolve({
                            message: 'error'
                        })
                        return;
                    };

                    let dataString = JSON.stringify(results);
                    let data = JSON.parse(dataString);
                    resolve(data);
                });
            }
        })
    })
}