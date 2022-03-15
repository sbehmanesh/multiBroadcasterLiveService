const Promise = require('bluebird');

module.exports = function(db){
    dbService = {};
    
    dbService.getBroadcastInfoByUserId = function (broadcasterUserId){
        return new Promise((resolve, reject) => {
            db.get("SELECT * FROM  broadcasts WHERE broadcaster_user_id = ? ORDER BY id DESC",
                [broadcasterUserId],
                (error, row) => {
                    if(error != null){
                        reject(error.message);
                    }else{
                        if(row){
                            resolve(row);
                        }else{
                            reject('no live found');
                        }
                    }
                }
            );
        });
    }

    dbService.getBroadcastInfoByBroadcastId = function (broadcastId){
        return new Promise((resolve, reject) => {
            db.get("SELECT * FROM  broadcasts WHERE id = ?",
                [broadcastId],
                (error, row) => {
                    if(error != null){
                        reject(error.message);
                    }else{
                        if(row){
                            resolve(row);
                        }else{
                            reject('no live found');
                        }
                    }
                }
            );
        });
    }
    
    dbService.updateBroadcastVisitNumber = function (broadcastId,visitNumber){
        db.run(`UPDATE broadcasts SET visit_number = ? WHERE id = ?`, 
            [visitNumber,broadcastId],
            function(error){
                if(error !== null) {
                    console.log(error.message);
                    return;
                }
                console.log("Broadcast " + broadcastId + " visitors changed to " + visitNumber);
            }
        );
    }

    dbService.createBroadcast = function (title,broadcasterUserId,broadcasterUserName){
        return new Promise((resolve, reject) => {
            db.run(`INSERT INTO  broadcasts (title,broadcaster_user_id,broadcaster_user_name) VALUES(?,?,?)`, 
                [title,broadcasterUserId,broadcasterUserName],
                function(error){
                    if(error !== null) {
                        reject(error.message);
                    }else{
                        console.log("Broadcast " + this.lastID + " created.");
                        resolve(this.lastID);
                    }
                }
            );
        });
    }

    dbService.closeBroadcast = function (broadcastId){
        var endedTimestamp = new Date().getTime();
        db.run(`UPDATE broadcasts SET ended_at = ? WHERE id = ?`, 
            [broadcastId , endedTimestamp],
            function(error){
                if(error !== null) {
                    console.log(error.message);
                    return;
                }
                console.log("Broadcast " + broadcastId + " ended at " + endedTimestamp);
            }
        );
    }

    return dbService;
}
