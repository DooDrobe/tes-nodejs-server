//import conn.jss

const express =require('express')
const bodyparser = require('body-parser')
const mysql = require('mysql')
const cors = require('cors')
// const { request, response } = require('express')
const app = express()
// const port = process.env.PORT || 5000
// const bcrypt = require('bcrypt')
// const saltRounds = 10
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
    host            : 'ec2-34-235-31-124.compute-1.amazonaws.com',
    user            : 'rddcasdnynjiia',
    password        : '06a4fe7fa4c14142e78cea4e6ee6dc66dfb2706769b99784a138ef9008f9b168',
    database        : 'd2216jiu6ct1nr'
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
         res.send(result)
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
    // console.log(req.session)
    if(req.session.userid){
        // console.log(req.session.userid)
        res.send({ loggedIn: true, user: req.session.userid });
    }else{
        // console.log(req.session.userid)     
        //res.send('user logged out!');   
        res.send({ loggedIn: false });
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
            res.send({message : " "})
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
        res.send(result)
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
                res.send(rows)
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
        res.send(result)
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

        res.send(result)
        if(err) console.log(err)
    })
    
})

//getby UID buat auto ngisi textbox edit
app.get('/users/:UID', (req,res) => {
    const sqlSelect = 'SELECT * FROM calon_karyawan WHERE id = ?'
    pool.query(sqlSelect, req.params.UID,(err,result) => {
        //console.log(req)
        res.send(result)
    })
})

////////////////////////////ASPEK API///////////////////////////////////////
//insert ASPEK
app.post("/api/insert-aspek", (req,res) => {
    const kode  = req.body.kode
    const namaAspek  = req.body.namaAspek
    const persentasi = req.body.persentasi
    const jml = req.body.jml

    console.log(kode)
    console.log(namaAspek)
    console.log(persentasi)
    console.log(jml)
    const sqlInsert = 'INSERT INTO aspek(kd_aspek,aspek,persentasi,jml_kriteria) VALUES (?,?,?,?)'
    pool.query(sqlInsert, [kode,namaAspek,persentasi,jml], (err,result) => {
        res.send(result)
        console.log(result)
        console.log(err)
    })
})

//show list aspek
app.get('/api/list-aspek',(req, res) => {
    pool.getConnection((err, connection) => {
        if(err) throw err
        console.log(`connected as id ${connection.threadId}`)

        //query(sqlString, callback)
        connection.query('SELECT * FROM aspek', (err,rows) => {
            connection.release() //return the connection to pool

            if(!err){                
                res.send(rows)
            }else{
                console.log(err)
            }
        })


    })
})

//delete aspek
app.delete("/api/del-aspek/:kd_aspek", (req,res) => {
    console.log(req.params.id)
    const UID = req.params.kd_aspek
    const sqlDelete = 'DELETE FROM aspek WHERE kd_aspek = ?'
    pool.query(sqlDelete, UID,(err,result) => {
        res.send(result)
        if(err) console.log(err)
    })
})

//edit aspek
app.put("/api/edit-aspek", (req,res) => {

    const kode  = req.body.kode
    const aspek  = req.body.aspek
    const persentasi = req.body.persentasi
    const jml = req.body.jml
    const sqlUpdate = 'UPDATE aspek SET aspek = ?,persentasi=?,jml_kriteria=? WHERE kd_aspek = ?'
    pool.query(sqlUpdate, [aspek,persentasi,jml,kode], (err,result) => {
        console.log(result)
        console.log(err)
        if(err) console.log(err)
    })
    res.send('gud');
})

//getby UID buat auto ngisi textbox edit
app.get('/api/aspek/:UID', (req,res) => {
    const sqlSelect = 'SELECT * FROM aspek WHERE kd_aspek = ?'
    pool.query(sqlSelect, req.params.UID,(err,result) => {
        //console.log(req)
        res.send(result)
    })
})

////////////////////////////KRITERIA API///////////////////////////////////////
//insert kriteria
app.post("/api/insert-kriteria", (req,res) => {
    const kd_kriteria  = req.body.kode
    const kriteria  = req.body.kriteria
    const jenis = req.body.factor
    const bobot = req.body.bobot
    const kd_aspek = req.body.kd_aspek

    console.log(kd_aspek)
    const sqlInsert = 'INSERT INTO kriteria(kd_kriteria,kd_aspek,kriteria,bobot_ideal,jenis) VALUES (?,?,?,?,?) '
    pool.query(sqlInsert, [kd_kriteria,kd_aspek,kriteria,bobot,jenis,kd_aspek], (err,result) => {
        console.log(result)
        console.log(err)
        res.send(result)
    })
})

//show list kriteria
app.get('/api/list-kriteria',(req, res) => {
    pool.getConnection((err, connection) => {
        if(err) throw err
        console.log(`connected as id ${connection.threadId}`)

        //query(sqlString, callback)
        connection.query('SELECT * FROM kriteria', (err,rows) => {
            connection.release() //return the connection to pool

            if(!err){                
                res.send(rows)
            }else{
                console.log(err)
            }
        })


    })
})

//delete kriteria
app.delete("/api/del-kriteria/:kd_kriteria", (req,res) => {
    console.log(req.params.id)
    const kode = req.params.kd_kriteria
    const sqlDelete = 'DELETE FROM kriteria WHERE kd_kriteria = ?'
    pool.query(sqlDelete, kode,(err,result) => {
        res.send(result)
        if(err) console.log(err)
    })
})

//edit kriteria
app.put("/api/edit-kriteria", (req,res) => {

    const kode  = req.body.kode
    const kriteria  = req.body.kriteria
    const factor = req.body.factor
    const bobot = req.body.bobot
    console.log(factor)
    console.log(bobot)
    console.log(kode)
    console.log(kriteria)
    const sqlUpdate = 'UPDATE kriteria SET kriteria = ?,jenis=?,bobot_ideal=? WHERE kd_kriteria = ?'
    pool.query(sqlUpdate, [kriteria,factor,bobot,kode], (err,result) => {
        res.send(result)
        if(err) console.log(err)
    })
})

//getby UID buat auto ngisi textbox edit
app.get('/api/kriteria/:UID', (req,res) => {
    const sqlSelect = 'SELECT * FROM kriteria WHERE kd_kriteria = ?'
    pool.query(sqlSelect, req.params.UID,(err,result) => {
        //console.log(req)
        res.send(result)
    })
})


////////////////////////////PROFILE MATCHING API///////////////////////////////////////
//insert profilematching
app.post("/api/insert-profilematching", (req,res) => {
    const nilai_calon = req.body.nilai //clear
    const kd_kriteria  = req.body.kd_kriteria //clear
    // const id_nilai = req.body.id_nilai
    const id_karyawan = req.body.id_karyawan //clear
    const bobot = req.body.bobot_ideal
    const s_gap = req.body.s_gap
    const k_gap = req.body.k_gap
    const sqlInsert = 'INSERT INTO nilai_karyawan(id_karyawan,kd_kriteria,nilai_calon,selisih_gap,bobot_ideal,konversi_gap) VALUES (?,?,?,?,?,?)'
    pool.query(sqlInsert, [id_karyawan,kd_kriteria,nilai_calon,s_gap,bobot,k_gap], (err,result) => {
        console.log(result.data)
        // console.log(err)     
        res.send(result)   
    })
})

//show list profilematching
app.get('/api/list-profilematching',(req, res) => {
    pool.getConnection((err, connection) => {
        if(err) throw err
        console.log(`connected as id ${connection.threadId}`)

        //query(sqlString, callback)
        connection.query('SELECT * FROM nilai_karyawan', (err,rows) => {
            connection.release() //return the connection to pool

            if(!err){                
                //res.send(rows)
                res.send(rows)
                //console.log(rows)
            }else{
                console.log(err)
            }
        })


    })
})
app.get('/api/get-idnilai',(req, res) => {
    pool.getConnection((err, connection) => {
        if(err) throw err
        console.log(`connected as id ${connection.threadId}`)

        //query(sqlString, callback)
        connection.query('SELECT `id_nilai` FROM nilai_karyawan ORDER BY id_nilai DESC LIMIT 1', (err,rows) => {
            connection.release() //return the connection to pool

            if(!err){                
                //res.send(rows)
                res.send(rows)
                //console.log(rows)
            }else{
                console.log(err)
            }
        })


    })
})
//show super table profilematching x kriteria x calon_karyawan
app.get('/api/list-supertable',(req, res) => {
    pool.getConnection((err, connection) => {
        if(err) throw err
        // console.log(`connected as id ${connection.threadId}`)

        //query(sqlString, callback)
        // connection.query('SELECT nilai_karyawan.id_nilai, nilai_karyawan.id_karyawan,calon_karyawan.nama, nilai_karyawan.nilai_calon,nilai_karyawan.selisih_gap,nilai_karyawan.bobot_ideal,nilai_karyawan.konversi_gap, kriteria.kd_kriteria,kriteria.kd_aspek from nilai_karyawan INNER JOIN kriteria ON nilai_karyawan.kd_kriteria = kriteria.kd_kriteria INNER JOIN calon_karyawan ON nilai_karyawan.id_karyawan = calon_karyawan.id', (err,rows) => {
        connection.query('SELECT nilai_karyawan.id_nilai, nilai_karyawan.id_karyawan,calon_karyawan.nama, nilai_karyawan.nilai_calon,nilai_karyawan.selisih_gap,nilai_karyawan.bobot_ideal,nilai_karyawan.konversi_gap, kriteria.kd_kriteria,kriteria.kd_aspek,kriteria.jenis from nilai_karyawan INNER JOIN kriteria ON nilai_karyawan.kd_kriteria = kriteria.kd_kriteria INNER JOIN calon_karyawan ON nilai_karyawan.id_karyawan = calon_karyawan.id', (err,rows) => {   
            connection.release() //return the connection to pool

            if(!err){                
                //res.send(rows)
                res.send(rows)
                //console.log(rows)
            }else{
                console.log(err)
            }
        })


    })
})

//delete profilematching
app.delete("/api/del-profilematching/:id", (req,res) => {
    console.log(req.params.id)
    const kode = req.params.id
    const sqlDelete = 'DELETE FROM nilai_karyawan WHERE id_karyawan = ?'
    pool.query(sqlDelete, kode,(err,result) => {
        res.send(result)
        if(err) console.log(err)
    })
})


////////////////////////////CFSF API///////////////////////////////////////
//insert core second
app.post("/api/insert-cfsf", (req,res) => {

    const id_karyawan = req.body.id_karyawan //clear
    const jenis_cf = req.body.jenis_cf
    const jenis_sf = req.body.jenis_sf 
    const jenis_na = req.body.jenis_na 
    const hasil_core = req.body.hasil_core
    const hasil_second = req.body.hasil_second
    const hasil_na = req.body.hasil_na

    const sqlInsert = 'INSERT INTO cf_sf(id_karyawan,kode,hasil) VALUES ?'
    var values = [
        [id_karyawan,jenis_cf,hasil_core],
        [id_karyawan,jenis_sf,hasil_second],
        [id_karyawan,jenis_na,hasil_na]
    ]
    pool.query(sqlInsert, [values], (err,result) => {
        // console.log(result)
        console.log(err)
    })
})

//insert hasil akhir
app.post("/api/insert-h-akhir", (req,res) => {

    const id_karyawan = req.body.id_karyawan //clear
    const jenis_ha = req.body.jenis_ha
    const hasil_ha = req.body.hasil_ha
    console.log(id_karyawan,jenis_ha,hasil_ha)

    const sqlInsert = 'INSERT INTO cf_sf(id_karyawan,kode,hasil) VALUES (?,?,?)'
    // var values = [
    //     [id_karyawan,jenis_ha,hasil_ha]
    // ]
    pool.query(sqlInsert, [id_karyawan,jenis_ha,hasil_ha], (err,result) => {
        // console.log(result.data)
        // console.log(err)     
        res.send(result)   
    })
})
//delete profilematching
app.delete("/api/del-cfsf/:id", (req,res) => {
    console.log(req.params.id)
    const kode = req.params.id
    const sqlDelete = 'DELETE FROM cf_sf WHERE id_karyawan = ?'
    pool.query(sqlDelete, kode,(err,result) => {
        res.send(result)
        if(err) console.log(err)
    })
})

//show super table cs_fs x calon_karyawan
app.get('/api/list-supertable-cfsf',(req, res) => {
    pool.getConnection((err, connection) => {
        if(err) throw err
        console.log(`connected as id ${connection.threadId}`)

        //query(sqlString, callback)
        connection.query('SELECT cf_sf.id_core_secondary,calon_karyawan.nama,cf_sf.id_karyawan, cf_sf.kode, cf_sf.hasil FROM cf_sf INNER JOIN calon_karyawan on calon_karyawan.id = cf_sf.id_karyawan', (err,rows) => {
            connection.release() //return the connection to pool

            if(!err){              
                res.send(rows)
                //console.log(rows)
            }else{
                console.log(err)
            }
        })


    })
})


//listen port
app.listen(3001, () => {
    console.log("running on port 3001")
});
