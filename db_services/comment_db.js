const Promise = require('bluebird');

module.exports = function(db){
    dbService = {};

    dbService.createComment = function (text,userId,broadcastId){
        return new Promise((resolve, reject) => {
            db.run(`INSERT INTO comments (text,user,broadcast) VALUES(?,?,?)`, 
                [text,userId,broadcastId],
                function(error){
                    if(error !== null) {
                        reject(error.message);
                    }else{
                        console.log("comment created by id " + this.lastID + " to live " + broadcastId);
                        resolve(this.lastID);
                    }
                }
            );
        });
    }

    return dbService;
}
