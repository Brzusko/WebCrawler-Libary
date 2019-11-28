const mysql = require('mysql');

class DB {
    constructor(options){
        this.pool = mysql.createPool(options);
    }

    Query(query){
        return new Promise((resolve, reject) => {
            this.pool.getConnection((err, connection) =>{
                if(err) reject(err);
                connection.query(query, (error, results, fields) => {
                    if(error){
                        connection.release();
                        reject(error);
                    }
                    resolve(results);
                })
            })
        });
    }
}

module.exports = DB;