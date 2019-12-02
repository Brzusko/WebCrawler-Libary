const mysql = require('mysql');

class DB {
    constructor(options){
        this.pool = mysql.createPool(options);
    }

    Query(query){
        return new Promise((resolve, reject) => {
            if(query === undefined) reject(new Error('Query string is not defined, plx fix that'));
            this.pool.getConnection((err, connection) =>{
                if(err) reject(err);
                connection.query(query, (error, results, fields) => {
                    if(error){
                        connection.release();
                        reject(error);
                        return;
                    }
                    connection.release();
                    resolve(results);
                })
            })
        });
    }
    QueryChain(queries) {
        return new Promise((resolve, reject)=>{
            this.pool.getConnection((err, connection) =>{
                if(err) reject(err);
                const resultsToReturn = [];
                for(let i = 0; i<queries.length; i++){
                    connection.query(queries[i], (error, results, fileds) =>{
                        if(error) {
                            connection.release();
                            reject(error);
                            return;
                        }
                        resultsToReturn.push(results);
                        if(i === queries.length - 1)
                        {
                            connection.release();
                            resolve(resultsToReturn);
                        }
                    });
                }
            });
        });
    }
}

module.exports = DB;