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
app.use(cookieParser());


app.use(cors({
    origin: ["http://localhost:3000"],
    methods: ["GET","POST","DELETE","PUT"],
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
    saveUninitialized:false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 },
    resave: false, 
}));

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
app.get('/authcheck',(req,res) => {
    console.log(req.session)
    if(req.session.userid){
        //res.send("Welcome User <a href=\'/logout'>click to logout</a>");
        console.log(req.session.userid)
        //res.send(req.session.userid)
        res.send({ loggedIn: true, user: req.session.userid });
        //console.log(res)
    }else{
        //res.sendFile('views/index.html',{root:__dirname})
        console.log(req.session.userid)     
        //res.send('user logged out!');   
        res.send({ loggedIn: false });
        //res.redirect('/login');
    }
});
app.post("/auth", (req,res) => {
    const username = req.body.username
    const password = req.body.password
    const sqlSelect = 'SELECT * FROM admin WHERE username = ? AND password = ?'
    pool.query(sqlSelect, [username,password],(err,result) => {
        if(err){
            res.send({ err: err});
        }
        if(result.length > 0){                                      
            req.session.userid = username   
            req.session.save()
            console.log(req.session.userid)      
            res.send(req.session.userid);      
        }else{
            res.send({message : "WRONG USERNAME OR PASSWORD!"})
        }
    })
})

//logout
app.get('/logout',(req,res) => {   
    req.session.destroy();
    console.log(req.session)
    res.send("logged out");
});

/////////CALON KARYAWAN API//////////
//insert data karyawan
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

//show list karyawan
app.get('/listkaryawan',(req, res) => {
    pool.getConnection((err, connection) => {
        if(err) throw err
        console.log(`connected as id ${connection.threadId}`)

        //query(sqlString, callback)
        connection.query('SELECT * FROM calon_karyawan', (err,rows) => {
            connection.release() //return the connection to pool

            if(!err){                
                //res.send(rows)
                const a = JSON.stringify(rows)
                const b = JSON.parse(a)
                res.send(b)
                //console.log(rows)
            }else{
                console.log(err)
            }
        })


    })
})

//delete calon karyawan
app.delete("/api/delkaryawan/:id", (req,res) => {
    console.log(req.params.id)
    const UID = req.params.id
    const sqlDelete = 'DELETE FROM calon_karyawan WHERE id = ?'
    pool.query(sqlDelete, UID,(err,result) => {
        if(err) console.log(err)
    })
})

//edit karyawan
app.put("/tambahcalon/api/edit", (req,res) => {
    const id  = req.body.id
    const nama  = req.body.nama
    const jk = req.body.jk
    const email = req.body.email
    const umur = req.body.umur
    const alamat = req.body.alamat
    //console.log(req)
    console.log(id)
    console.log(nama)
    console.log(email)
    console.log(jk)
    console.log(umur)
    console.log(alamat)
    const sqlUpdate = 'UPDATE calon_karyawan SET nama = ?,umur=?,jk=?,email=?,alamat=? WHERE id = ?'
    pool.query(sqlUpdate, [nama,umur,jk,email,alamat,id], (err,result) => {
        console.log(result)
        console.log(err)
        if(err) console.log(err)
    })
})

//listen port
app.listen(3001, () => {
    console.log("running on port 3001")
});