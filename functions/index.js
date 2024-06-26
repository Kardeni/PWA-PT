//Import express
const express = require('express');
//const session = require('express-session'); //for express sessions
const session = require('cookie-session');
const path = require('path');
const functions = require('firebase-functions');

const conn = require('./src/models/user.model'); 
//Import firebase auth
const firebase = require('./src/controllers/firebaseConfig.js');

const app = express();//declare an express object (app)

app.set('trust proxy', 1); // Confiar en el primer proxy
//Give the app json and url properties
app.use(express.json());
app.use (express.urlencoded({extended:true}));


app.use(session({
    secret: 'mySecret',
    name:'idUsuario',
    saveUninitialized:true,
    cookie: {
      secure: app.get('env') === 'production', // serve secure cookies in production
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 1 day
      sameSite: app.get('env') === 'production' ? 'strict' : 'lax'
    }
  }));
  
/*
var sess = {
    secret: 'mySecret',
    cookie: {}
  }
  
  if (app.get('env') === 'production') {
    app.set('trust proxy', 1) // trust first proxy
    sess.cookie.secure = true // serve secure cookies
  }
  
  app.use(session(sess));
/*
app.use(session({
    secret: 'mySecret',
    proxy: true,
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: true,
        httpOnly: true,
        sameSite: 'none', // Asegura que las cookies se envían en contextos cross-site
        maxAge: 24 * 60 * 60 * 1000 // 1 día de vida para la cookie
    }
}));


/*app.use(session({
    secret: 'mySecret',
    proxy: true,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true }
 }))*/

/*app.use(session({
    secret: 'mySecret',
    resave: true,
    saveUninitialized: true,
    cookie: { secure: true ,
        httpOnly : true } // Cambia a true si usas HTTPS
}));
app.use(session({
    secret: 'mySecret',
    resave: false,
    saveUninitialized: true,
    cookie: {maxAge : 60000,
        secure: false,
        httpOnly: false }
}));
*/
/*
app.use(session({
    secret: 'mySecret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: process.env.NODE_ENV === 'production', // Solo true en producción
        httpOnly: true,
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
    }
}));*/

//Assing pug functions to app
app.set('view engine','pug');
app.set('views', path.join(__dirname, 'views'));//"views" is the directory where the pug files are
app.use(express.static(path.join(__dirname, 'public')));

/*app.use((req, res, next) => {
    console.log(req.session);
    next();
});*/



// Rutas
/*app.get('/', (req, res) => {
    if (!req.session.views) {
        req.session.views = 1;
    } else {
        req.session.views++;
    }
    res.render('index', { views: req.session.views });
});*/

//USER ROUTE IMPORT
const routerUser =require('./src/routes/user.routes.js');
app.use('/user', routerUser); // /user is the url on which we can access to routerUser

//USER LOGIN ROUTER - this router contains the controller for the login
const routerLogIn =require('./src/controllers/index.controllers.js');
app.use('/log-in', routerLogIn); // /log-in is the url on which we can access to routerLogIn


//FOR THE ROOT URL
app.get('/',(req,res)=>{//metodo y ruta
    //res.render('index', { views: req.session.idUsuario });
    res.render('index');
});

app.post("/update-sensor", (req,res)=>{
    //"{\"api_key\":\"tPmAT5Ab3j7F9\",\"sensor\":\"BME280\",\"value1\":\"Hola desde la esp32\"}"
    //console.log("Body:", req.body);
    const {node, sensorTemp, sensorHum, sensorPH,N,P,K}= req.body;
    console.log(node, sensorTemp, sensorHum, sensorPH,N,P,K);
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
};
