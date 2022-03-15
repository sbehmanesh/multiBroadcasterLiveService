const Promise = require('bluebird');

module.exports = function(db){
    dbService = {};
    
    dbService.getWatcherInfoByUserId = function (watcherUserId){
        return new Promise((resolve, reject) => {
            db.get("SELECT * FROM watchers WHERE user_id = ? ORDER BY id DESC",
                [watcherUserId],
                (error, row) => {
                    if(error != null){
                        reject(error.message);
                    }else{
                        if(row){
                            resolve(row);
                        }else{
                            reject('no user found');
                        }
                    }
                }
            );
        });
    }

    dbService.getWatcherInfoById = function (watcherId){
        return new Promise((resolve, reject) => {
            db.get("SELECT * FROM watchers WHERE id = ?",
                [watcherId],
                (error, row) => {
                    if(error != null){
                        reject(error.message);
                    }else{
                        if(row){
                            resolve(row);
                        }else{
                            reject('no user found');
                        }
                    }
                }
            );
        });
    }

    dbService.joinUser = function (broadcastId,userId,userName){
        return new Promise((resolve, reject) => {
            db.run(`INSERT INTO watchers (broadcast,user_id,user_name) VALUES(?,?,?)`, 
                [broadcastId,userId,userName],
                function(error){
                    if(error !== null) {
                        reject(error.message);
                    }else{
                        console.log("User joined by id " + this.lastID + " to live " + broadcastId);
                        resolve(this.lastID);
                    }
                }
            );
        });
    }

    dbService.disconnect = function (userId , broadcastUserId){
        var endedTimestamp = new Date().getTime();
        db.run(`UPDATE broadcasts SET leaved_at = ? WHERE user_id = ? and broadcast.broadcaster_user_id = ?`, 
            [endedTimestamp , userId , broadcastUserId],
            function(error){
                if(error !== null) {
                    console.log(error.message);
                    return;
                }
                console.log("User " + userId + " leaved at " + endedTimestamp);
            }
        );
    }

    return dbService;
}
