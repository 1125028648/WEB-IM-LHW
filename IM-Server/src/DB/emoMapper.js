// 保存表情包信息
exports.addEmo = (db, userId, emoName) =>{
    return new Promise((resolve, reject)=>{
        let sql = `INSERT INTO emo(user_id, emo_name) VALUES(?, ?)`;

        db.query(sql, [userId, emoName], function(err, results, fields){
            if(err) {
                resolve({
                    flag: false,
                    message: 'error'
                });
                return;
            };

            resolve({
                flag: true,
                message: 'success',
            });
        })
    })
}

exports.queryEmo = (db, userId) =>{
    return new Promise((resolve, reject) =>{
        let sql = `SELECT emo_name FROM emo WHERE user_id = ?`;

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
                data: data,
            });
        })
    })
}