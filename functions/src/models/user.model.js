//AQUI VA LA CONSULTA A LA BASE DE DATOS
const mysql = require('mysql2');
const fs = require('fs');
const express = require('express');
const app = express();


var config =
{//var conn = mysql.createConnection({host: {your_host}, user: {username@servername}, password: {your_password}, database: {your_database}, Port: {your_port}[, ssl:{ca:fs.readFileSync({ca-cert filename})}}]);
    host:'huertalia.mysql.database.azure.com',
    user:'huertalia',
    password:'Proyecto5$',
    database:'huertalia',
    port: 3306,
    ssl: {rejectUnauthorized: true, ca: fs.readFileSync("src/DigiCertGlobalRootCA.crt.pem")},
    connectTimeout: 30000
};

const conn = new mysql.createConnection(config);


module.exports=conn;