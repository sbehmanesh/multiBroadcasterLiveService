const express = require("express");
const router = express();
API_KEY = "testServerLiveService"

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('./live.db');
broadcastDbServices = require('.././db_services/broadcast_db')(db)
watcherDbServices = require('.././db_services/watcher_db')(db)

router.get('/new-live/:user_id',(req,res) => {
    if(req.query.API_KEY && req.query.API_KEY == API_KEY){
        broadcastDbServices.createBroadcast(req.query.title,req.params.user_id,req.query.username)
        .then((broadcastID) => {
            console.log('broadcast created : (' + broadcastID + ') title = ' + req.query.title + ' , username = ' + req.query.username);
            res.render('broadcast',{'liveId':broadcastID});
        });
    }else{
        res.status(403).send("You don't have access to this service !")
    }
})

router.get('/live/:user_id',(req,res) => {
    if(req.query.API_KEY && req.query.API_KEY == API_KEY){
        broadcastDbServices.getBroadcastInfoByUserId(req.params.user_id)
        .then((liveInfo) => {
            console.log('live id : ' + req.params.user_id + ' --> (' + liveInfo.id + ') title :' + liveInfo.title);
            
            watcherDbServices.joinUser(liveInfo.id,req.query.user_id,req.query.username)
            .then((userID) => {
                console.log('user joined : (' + userID + ') user_id = ' + req.query.user_id + ' , username = ' + req.query.username);
                res.render('watch',{'liveId':liveInfo.id , 'userId':req.params.user_id})
            });
            
        }).catch((errorMessage) => {
            console.log('checing errors');
            if(errorMessage == 'no live found'){
                res.render('noLiveFound');
            }else{
                console.log('going to error page');
                res.render('error');
            }
        });
    }else{
        res.status(403).send("You don't have access to this service !")
    }
})

module.exports = router