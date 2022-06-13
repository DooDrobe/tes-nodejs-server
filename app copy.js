//import conn.jss

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
//const filestore = require("session-file-store")(session)
app.use(cookieParser());


app.use(cors({
    origin: ["http://localhost:3000"],
    methods: ["GET","POST"],
    credentials: true,
}))
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
    cookie: { maxAge: 1000 * 60 * 60 * 24 },
    resave: false, 
    //signed : true
    //store: new filestore()
}));
//var session;

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

    // bcrypt.hash(password,saltRounds, (err,hash) =>{
    //     pool.query(sqlInsert, [username, hash], (err,result) => {
    //         console.log(err)
    //     })
    // })
    console.log(username)
    console.log(password)
    const sqlInsert = 'INSERT INTO admin (username,password) VALUES (?,?)'
    pool.query(sqlInsert, [username, password], (err,result) => {
        // console.log(result)
         console.log(err)
    })
})

/////////LOGIN//////////
app.get("/api/get", (req,res) => {
    const sqlSelect = 'SELECT * FROM admin'
    pool.query(sqlSelect, (err,result) => {
        res.send(result)
        console.log(result)
        console.log(err)
    })
})
app.get('/auth',(req,res) => {
    //req.session.destroy();
    //console.log(req.session.userid)
    if(req.session.userid){
        //res.send("Welcome User <a href=\'/logout'>click to logout</a>");
        console.log(req.session.userid)
        res.send({ loggedIn: true, user: req.session.userid });
        console.log(res)
    }else{
        //res.sendFile('views/index.html',{root:__dirname})
        console.log(req.session.userid)
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
                req.session.userid = result   
                console.log(req.session.userid)      
                res.send(result);      
            }else{
                res.send({message : "WRONG USERNAME OR PASSWORD!"})
            }
        })
})


//logout
app.get('/logout',(req,res) => {      
    //req.session.destroy();    
    // req.session.destroy();
    // res.cookie("UID",{maxAge: Date.now() })
    res.clearCookie("UID");
    // console.log(req)
    // cookies.set({maxAge: 0});
    res.redirect('/login');
    //req.session = null
    // req.session.destroy((err) => {
    //     res.redirect('/login') // will always fire after session is destroyed
    //   })
});

/////////CALON KARYAWAN API//////////
app.post("/tambahcalon/api/insert", (req,res) => {
    const id  = req.body.id
    const nama  = req.body.nama
    const jk = req.body.jk
    const email = req.body.email
    const umur = req.body.umur
    const alamat = req.body.alamat

    console.log(id)
    console.log(nama)
    console.log(email)
    console.log(jk)
    console.log(umur)
    console.log(alamat)
    const sqlInsert = 'INSERT INTO calon_karyawan(id,nama,umur,jk,email,alamat) VALUES (?,?,?,?,?,?)'
    pool.query(sqlInsert, [id,nama,umur,jk,email,alamat], (err,result) => {
        console.log(result)
        console.log(err)
    })
})







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