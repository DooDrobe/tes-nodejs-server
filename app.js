const express =require('express')
const bodyparser = require('body-parser')
const mysql = require('mysql')
const cors = require('cors')
const { request, response } = require('express')
const app = express()
const port = process.env.PORT || 5000
const bcrypt = require('bcrypt')
const saltRounds = 10
//session
const sessions = require('express-session'); //untuk ngebuat session
const cookieParser = require("cookie-parser");
app.use(cookieParser());

// app.use(session({
// 	secret: 'secret',
// 	resave: true,
// 	saveUninitialized: true
// }));

app.use(cors())
app.use(express.json())
app.use(bodyparser.urlencoded({extended: true}))
app.use(bodyparser.json())

//mysql
const pool = mysql.createPool({
    connectionLimit :  10,
    host            : 'localhost',
    user            : 'root',
    password        : '',
    database        : 'elfadh'
});

//session
const oneDay = 1000 * 60 * 60 * 24;
app.use(sessions({
    key: "UID",
    secret: "thisismysecrctekeyfhrgfgrfrty84fwir767",
    saveUninitialized:true,
    cookie: { maxAge: oneDay },
    resave: false 
}));
var session;

//MAIN QUERY
//REGISTER USER without AUTH
// app.post("/api/insert", (req,res) => {
//     const username = req.body.username
//     const password = req.body.password
//     console.log(username)
//     console.log(password)
//     const sqlInsert = 'INSERT INTO admin (username,password) VALUES (?,?)'
//     pool.query(sqlInsert, [username, password], (err,result) => {
//         // console.log(result)
//         // console.log(err)
//     })
// })

//REGISTER USER WITH AUTH
app.post("/api/insert", (req,res) => {
    const username = req.body.username
    const password = req.body.password

    bcrypt.hash(password,saltRounds, (err,hash) =>{
        pool.query(sqlInsert, [username, hash], (err,result) => {
            console.log(err)
        })
    })
    console.log(username)
    console.log(password)
    // const sqlInsert = 'INSERT INTO admin (username,password) VALUES (?,?)'
    // pool.query(sqlInsert, [username, password], (err,result) => {
    //     // console.log(result)
    //     // console.log(err)
    // })
})

app.get("/api/get", (req,res) => {
    const sqlSelect = 'SELECT * FROM admin'
    pool.query(sqlSelect, (err,result) => {
        res.send(result)
        console.log(result)
        console.log(err)
    })
})
app.get('/auth',(req,res) => {
    session=req.session;
    if(session.userid){
        res.send("Welcome User <a href=\'/logout'>click to logout</a>");
        res.send({ loggedIn: true, user: req.session.user });
    }else{
        //res.sendFile('views/index.html',{root:__dirname})
        res.send({ loggedIn: false });
    }
});
app.post("/auth", (req,res) => {
    const username = req.body.username
    const password = req.body.password
    
    console.log(username)
    // if(username && password){
        const sqlSelect = 'SELECT * FROM admin WHERE username = ? AND password = ?'
        pool.query(sqlSelect, [username,password],(err,result) => {
            if(err){
                res.send({ err: err});
            }
            if(result.length > 0){                    
                session=req.session;   
                session.userid = username   
                console.log(req.session)      
                res.send(result);      
            }else{
                res.send({message : "WRONG USERNAME OR PASSWORD!"})
            }
        })
})


//logout
app.get('/logout',(req,res) => {
    req.session.destroy();
    res.redirect('/login');
});









//TEST QUERY

//select all query
// app.get('',(req, res) => {
//     pool.getConnection((err, connection) => {
//         if(err) throw err
//         console.log(`connected as id ${connection.threadId}`)

//         //query(sqlString, callback)
//         connection.query('SELECT * FROM ADMIN', (err,rows) => {
//             connection.release() //return the connection to pool

//             if(!err){
                
//                 res.send(rows)
//             }else{
//                 console.log(err)
//             }
//         })


//     })
// })

//select all query by UID
app.get('/:UID',(req, res) => {
    pool.getConnection((err, connection) => {
        if(err) throw err
        console.log(`connected as id ${connection.threadId}`)

        //query(sqlString, callback)
        connection.query('SELECT * FROM ADMIN WHERE USERNAME = ?', [req.params.UID], (err,rows) => {
            connection.release() //return the connection to pool

            if(!err){
                res.send(rows)
            }else{
                console.log(err)
            }
        })


    })
})

//delete record
app.delete('/:UID',(req, res) => {
    pool.getConnection((err, connection) => {
        if(err) throw err
        console.log(`connected as id ${connection.threadId}`)

        //query(sqlString, callback)
        connection.query('DELETE FROM ADMIN WHERE USERNAME = ?', [req.params.UID], (err,rows) => {
            connection.release() //return the connection to pool

            if(!err){
                res.send(`Admin with UID: ${[req.params.UID]} has been removed`)
            }else{
                console.log(err)
            }
        })


    })
})


//add record

app.post('',(req, res) => {
    pool.getConnection((err, connection) => {
        if(err) throw err
        console.log(`connected as id ${connection.threadId}`)

        const params = req.body

        //query(sqlString, callback)
        connection.query('INSERT INTO ADMIN SET ?', params, (err,rows) => {
            connection.release() //return the connection to pool

            if(!err){
                res.send(`Admin with UID: ${params.username} has been added`)
            }else{
                console.log(err)
            }
        })

        console.log(req.body)

    })
})

//update record
app.put('',(req, res) => {
    pool.getConnection((err, connection) => {
        if(err) throw err
        console.log(`connected as id ${connection.threadId}`)

        const {username, password} = req.body

        //query(sqlString, callback)
        connection.query('UPDATE ADMIN SET password = ? WHERE username = ?', [password,username], (err,rows) => {
            connection.release() //return the connection to pool

            if(!err){
                res.send(`Admin with UID: ${username} has been updated`)
            }else{
                console.log(err)
            }
        })

        console.log(req.body)

    })
})

//listen port
app.listen(3001, () => {
    console.log("running on port 3001")
});