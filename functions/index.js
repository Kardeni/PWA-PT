//Import express
const express = require('express');
const session = require('express-session'); //for express sessions
const path = require('path');
const functions = require('firebase-functions');
const swal = require('sweetalert2');
const usuarioCreado = 'false';
const conn = require('./src/models/user.model'); 
//Import firebase auth
const firebase = require('./src/controllers/firebaseConfig.js');

const app = express();//declare an express object (app)

//Give the app json and url properties
app.use(express.json());
app.use (express.urlencoded({extended:true}));

app.use(session({
    secret: 'mySecret',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Cambia a true si usas HTTPS
}));

//Assing pug functions to app
app.set('view engine','pug');
app.set('views', path.join(__dirname, 'views'));//"views" is the directory where the pug files are
app.use(express.static(path.join(__dirname, 'public')));


//USER ROUTE IMPORT
const routerUser =require('./src/routes/user.routes.js');
app.use('/user', routerUser); // /user is the url on which we can access to routerUser

//USER LOGIN ROUTER - this router contains the controller for the login
const routerLogIn =require('./src/controllers/index.controllers.js');
app.use('/log-in', routerLogIn); // /log-in is the url on which we can access to routerLogIn


//FOR THE ROOT URL
app.get('/',(req,res)=>{//metodo y ruta
    res.render('index');
});

app.post("/update-sensor", (req,res)=>{
    //"{\"api_key\":\"tPmAT5Ab3j7F9\",\"sensor\":\"BME280\",\"value1\":\"Hola desde la esp32\"}"
    //console.log("Body:", req.body);
    const {node, sensorTemp, sensorHum, sensorPH,N,P,K}= req.body;
    console.log(node, sensorTemp, sensorHum, sensorPH,N,P,K);
    //res.render('index',{sensorTemp:sensorTemp, sensorHum:sensorHum, sensorPH:sensorPH,N:N,P:P,K:K});
    //humedad1=value1;
    //Se llama a la funcion que realiza la insercion a la base
    queryDatabase(node, sensorTemp, sensorHum, sensorPH,N,P,K);
    res.send("Okey");
});

exports.app = functions.https.onRequest(app);

function queryDatabase(node, sensorTemp, sensorHum, sensorPH,N,P,K){
    var hoy = new Date();
    var dd = hoy.getDate();
    var mm = hoy.getMonth()+1;
    var yyyy = hoy.getFullYear();
    var hora = hoy.getHours();
    var min = hoy.getMinutes();
    var segu = hoy.getSeconds();

    var tiempo = yyyy+"-"+mm+"-"+dd+" "+hora+":"+min+":"+segu;
    //INSERT INTO Medicion (hora, ph, temp, humedad, nitrogeno, potasio, fosforo,  idNodo) VALUES ('2024-05-21 21:37:30', '5', '28', '70', '20', '78', '90', '1'); VALUES (?, ?, ?, ?);', [currentDate, tipo_suminsitro,nodo ,idUser], (err,result)
    conn.query('INSERT INTO Medicion (hora, ph, temp, humedad, nitrogeno, potasio, fosforo,  idNodo)  VALUES (?, ?, ?, ?,?,?,?,?);', [tiempo, sensorPH, sensorTemp, sensorHum, N, P, K, node],
        function (err, results, fields) {
            if (err) throw err;
            else console.log('Inserted ' + results.affectedRows + ' row(s).');
        }
    )

    conn.end(function (err) {
        if (err) throw err;
        else  console.log('Done.')
    });
};
