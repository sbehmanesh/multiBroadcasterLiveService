const express = require("express");
const router = express();
API_KEY = "testServerLiveService"

router.get('/new-live/:id',(req,res) => {
    if(req.query.API_KEY && req.query.API_KEY == API_KEY){
        res.render('broadcast',{'liveId':req.params.id})
    }else{
        res.status(403).send("You don't have access to this service !")
    }
})

router.get('/live/:id',(req,res) => {
    if(req.query.API_KEY && req.query.API_KEY == API_KEY){
        res.render('watch',{'liveId':req.params.id})
    }else{
        res.status(403).send("You don't have access to this service !")
    }
})

module.exports = router