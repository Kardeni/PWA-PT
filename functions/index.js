//Import express
const express = require('express');
const session = require('express-session'); //for express sessions
const path = require('path');
const functions = require('firebase-functions');

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

exports.app = functions.https.onRequest(app);

