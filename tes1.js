

var express = require('express');
const sessions = require('express-session'); //untuk ngebuat session
const cookieParser = require("cookie-parser");
var app = express();
app.use(cookieParser());
app.use(sessions({
    key: "ID",
    secret: "thisismysecrctekeyfhrgfgrfrty84fwir767",
    // saveUninitialized:true,
    // cookie: { maxAge: 1000 * 60 * 60 * 24 },
    // resave: false, 
    //signed : true
    //store: new filestore()
}));
//app.use(express.session({secret: 'jdepp'}));

app.get('/user/:user', function(req, res){
    req.session.name = req.params.user;
    res.send('<p>Session Set: <a href="/user">View Here</a></p>');
    console.log(req.session.name);
    });

app.get('/user', function(req, res){
    console.log(req.session)
    if(req.session.name){
        console.log(req.session.name)
        res.send(req.session.name+'<br /><a href="/logout">Logout</a>');
        //res.send({ loggedIn: true, user: req.session.userid });
    }       
    
    else
        res.send('user logged out!');
    });

app.get('/logout', function(req, res){
    req.session.destroy();
    res.send('<br />logged out!<br /><a href="/user">Check Session</a>');
    });

app.listen(3001, () => {
    console.log("running on port 3001")
});