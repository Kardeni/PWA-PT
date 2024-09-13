//AQUI VA LA CONSULTA A LA BASE DE DATOS
const mysql = require('mysql2');
const fs = require('fs');
const express = require('express');
const app = express();


var config =
{
    host: 'your_host', 
    user: 'username@servername', 
    password: 'your_password', 
    database: 'your_database', 
    Port: 'your_port', 
    ssl:{ca:fs.readFileSync('ca-cert filename')},
    connectTimeout: 30000
};

const conn = new mysql.createConnection(config);


module.exports=conn;