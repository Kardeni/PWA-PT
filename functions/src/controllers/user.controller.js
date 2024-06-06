//Import express
const express = require('express');
const session = require('express-session'); //for express sessions

/*Import firebase auth
const firebase = require('firebase');
const firebaseui = require('firebaseui');

// Initialize the FirebaseUI Widget using Firebase
const ui = new firebaseui.auth.AuthUI(firebase.auth());
var uiConfig = {
    callbacks: {
      signInSuccessWithAuthResult: function(authResult, redirectUrl) {
        // User successfully signed in.
        // Return type determines whether we continue the redirect automatically
        // or whether we leave that to developer to handle.
        return true;
      },
      uiShown: function() {
        // The widget is rendered.
        // Hide the loader.
        document.getElementById('loader').style.display = 'none';
      }
    },
    // Will use popup for IDP Providers sign-in flow instead of the default, redirect.
    signInFlow: 'popup',
    signInSuccessUrl: '<url-to-redirect-to-on-success>',
    signInOptions: [
      // Leave the lines as is for the providers you want to offer your users.
      firebase.auth.GoogleAuthProvider.PROVIDER_ID,
      firebase.auth.FacebookAuthProvider.PROVIDER_ID,
      firebase.auth.TwitterAuthProvider.PROVIDER_ID,
      firebase.auth.GithubAuthProvider.PROVIDER_ID,
      firebase.auth.EmailAuthProvider.PROVIDER_ID,
      firebase.auth.PhoneAuthProvider.PROVIDER_ID
    ],
    // Terms of service url.
    tosUrl: '<your-tos-url>',
    // Privacy policy url.
    privacyPolicyUrl: '<your-privacy-policy-url>'
  };*/

const app = express(); //create an express object called app
//Give the app json and url properties
app.use(express.json());
app.use (express.urlencoded({extended:true}));

app.use(session({
    secret: 'mySecret',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Cambia a true si usas HTTPS
}));

//Import obj readUser which contains the user model where we make the database connection
const readUser = require('../models/user.model'); 


module.exports={
    registerUser:(req,res)=>{
        console.log("Estoy registrando");
        const { name, last_name1, last_name2, email, birthday, gender, isAdmin, password } = req.body;
        readUser.query('INSERT INTO Usuario (nombre, apellido, seg_apellido, correo, fecha_nacimiento, genero, bandera_administrador, contrasenia) VALUES (?, ?, ?, ?, ?, ?, ?, ?);', [name, last_name1, last_name2, email, birthday, gender, isAdmin, password], (err,result)=>{
            if (err) {
                console.error(err);
                res.status(500).send("Error al agregar usuario");
                return;
            }else{
                //readUser.query('SET @idUsuario = LAST_INSERT_ID();');
                
            }
            res.redirect('/');
        });
    },
    //Authentication function
    authLogin:(req,res)=>{
        console.log("Validar inicio de sesion")
        //Save in constants both email and psw form the request body
        const userEmail = req.body.email;
        const userPsw = req.body.contrasenia;
        console.log("usuario: "+userEmail);
        console.log("contraseña: "+userPsw);
        //Get info from the DB of the user which email=userEmail from request body
        readUser.query('SELECT * FROM Usuario where correo=?', [userEmail], (err,result)=>{
            if (err) throw err;
            //All the info from user is saved in result[0]
            //Compare if the psw got from DB is the same as the one got from the request body
            if (result.length > 0 && result[0].contrasenia === userPsw){ //success login
                // Save the email in the session
                req.session.userEmail = userEmail;
                //Save if is Admin in the session
                req.session.isAdmin = result[0].bandera_administrador == 1;
                req.session.idUsuario=result[0].idUsuario;
                req.session.name=result[0].nombre;
                const idUser = result[0].idUsuario;
                console.log("Bienvenido, ingreso exitoso")
                //res.status(200).send('Login successful');
                //render the dashboardView.pug
                showDashboard(req, res, idUser); //res is necessary to render the view; result is the object that contains the user info
                
            }else{//failed login
                res.status(401).send('Invalid credentials');
                console.log("Contraseña incorrecta");
            }
        });
    },
    showInfo:[isAuthenticated,(req,res)=>{
        listaNodos=[];
        const userEmail = req.session.userEmail; //obtain user email form express session
        //console.log(userEmail);
        readUser.query('SELECT * FROM Usuario where correo=?', [userEmail], (err,resultUser)=>{
            if (err) throw err;
            userID=resultUser[0].idUsuario; //save the user id from the result

            if (resultUser.length > 0) {
                userName=resultUser[0].nombre;
                lastName=resultUser[0].apellido;
                lastName2=resultUser[0].seg_apellido;
                email=resultUser[0].correo;
                birthday=resultUser[0].fecha_nacimiento;
                gender=resultUser[0].genero;
                esAdmin=resultUser[0].bandera_administrador;
                if(esAdmin==1){
                    isAdmin="Administrador";
                }else
                    isAdmin="No es administrador";
                psw=resultUser[0].contrasenia;
                readUser.query('SELECT * FROM Usuario_tiene_Nodo WHERE Usuario_idUsuario=? ', [userID], (err,resultNodosAsignados)=>{
                    if (err) throw err;
                    //console.log(resultNodosAsignados);
                    listaNodos = resultNodosAsignados.map(nodo => ({ nodo : nodo.Nodo_idNodo }));
                    //console.log(listaNodos);
                    res.render('userInfoView',{
                        userName : userName,
                        lastName:lastName,
                        lastName2:lastName2,
                        email:email,
                        birthday:birthday,
                        gender:gender,
                        isAdmin:isAdmin,
                        listaNodos:listaNodos,
                        esAdmin:esAdmin
                    })//pug:js
                });
            }else{
                //res.status(404).send('Usuario no encontrado :(');
            }
        });
    }],

    //Function where the personalized dashboard is shown 
    showNode:(req, res)=>{
        const vegetal = req.query.vegetal;
        // Aquí puedes manejar la lógica según el vegetal seleccionado
        console.log(`Has seleccionado: ${vegetal}`);
        res.send(`Has seleccionado: ${vegetal}`);
        const userID = req.session.idUsuario; //obtain user id form express session
        
        nodo=result[0].nodo; //este nodo estara dado por la seleccion del usuario
        //console.log(`Bienvenido usuario ${userName} y ${userID}`);
        const medicionesList = [];//create an empty array
        const suminsitrosList = [];//create an empty array
        readUser.query('SELECT m.* FROM Medicion m JOIN Usuario_tiene_Nodo utn ON m.idNodo = utn.Nodo_idNodo JOIN Usuario u ON utn.Usuario_idUsuario = u.idUsuario WHERE u.idUsuario = ?;', [userID], (req, resultMedicion) => {
            //console.log(resultMedicion);
            for (let i = 0; i < resultMedicion.length; i++) {
                //One medicion => one element of the array (i)
                medicionesList[i] = {
                    // var in js array : var in result from DB query
                    idMedicion: resultMedicion[i].idMedicion,
                    hora: resultMedicion[i].hora,
                    ph: resultMedicion[i].ph,
                    temp: resultMedicion[i].temp,
                    humedad: resultMedicion[i].humedad,
                    n: resultMedicion[i].nitrogeno,
                    p: resultMedicion[i].potasio,
                    k: resultMedicion[i].fosforo,
                    idNodo: resultMedicion[i].idNodo
                };
            } //console.log(medicionesList);
            //readUser.query('SELECT s.* FROM Suministro s JOIN Usuario u ON s.idUsuario_ejecutor = u.idUsuario WHERE u.idUsuario = ?;'
            
            readUser.query('SELECT s.*, u.nombre FROM Suministro s JOIN Nodo n ON s.idNodo = n.idNodo JOIN Usuario u ON s.idUsuario_ejecutor = u.idUsuario WHERE n.idNodo = ?;', [nodo], (req, resultSuministro) => {
                //console.log(resultSuministro);
                for (let i = 0; i < resultSuministro.length; i++) {
                    if(resultSuministro[i].bandera_tipo_suministro==0){
                        tipoSuministro=="Riego";
                    }else
                    tipoSuministro="Inyeccion de nutrientes";
                    //One suministro => one element of the array (i)
                    //console.log(resultSuministro[i].idSuministro);
                        suminsitrosList[i] = {
                            // var in js array : var in result from DB query
                            idSuministro: resultSuministro[i].idSuministro,
                            hora: resultSuministro[i].hora,
                            tipo: tipoSuministro,
                            idNodo: resultSuministro[i].idNodo,
                            idUsuario_ejecutor: resultSuministro[i].nombre
                        };   
                    
                }//console.log(suminsitrosList);
                /*res.render('dashboardView', {
                    usuario : userName, 
                    listMediciones :medicionesList, 
                    listSuministros:suminsitrosList,
                    esAdmin : esAdmin
                });//pug:js*/
            });
            
        });
        
    }

        
}

//Auth Middleware=> verifies if the user is authenticaded (if his email is in the express session)
function isAuthenticated(req, res, next) {
    console.log(req.session.userEmail);
    if (req.session.userEmail) {
        return next();
    } else {
        res.status(401).send('You are not authenticated');
    }
}

function showDashboard(req, res, idUser){
    const userName=req.session.name;
    const esAdmin=req.session.isAdmin;
    nodosList=[];
    readUser.query('SELECT Nodo_idNodo FROM Usuario_tiene_Nodo WHERE Usuario_idUsuario=?; ',[idUser], (request,resNodos)=>{
        for (let i = 0; i < resNodos.length; i++) {
            //One nodo => one element of the array (i)
            nodosList[i] = {
                // var in js array : var in result from DB query
                idNodo:resNodos[i].Nodo_idNodo
            };
        }//console.log(nodosList);
        res.render('dashboardView', {
            userName:userName,
            listaNodos:nodosList, 
            esAdmin : esAdmin
        });
    });
}
/*
//Firebase Authentication Functions
function signInWithEmailPassword() {
    var email = "test@example.com";
    var password = "hunter2";
    // [START auth_signin_password]
    firebase.auth().signInWithEmailAndPassword(email, password)
      .then((userCredential) => {
        // Signed in
        var user = userCredential.user;
        // ...
      })
      .catch((error) => {
        var errorCode = error.code;
        var errorMessage = error.message;
      });
    // [END auth_signin_password]
  }
  
  function signUpWithEmailPassword() {
    var email = "test@example.com";
    var password = "hunter2";
    // [START auth_signup_password]
    firebase.auth().createUserWithEmailAndPassword(email, password)
      .then((userCredential) => {
        // Signed in 
        var user = userCredential.user;
        // ...
      })
      .catch((error) => {
        var errorCode = error.code;
        var errorMessage = error.message;
        // ..
      });
    // [END auth_signup_password]
  }

  function signOut() {
    // [START auth_sign_out]
    firebase.auth().signOut().then(() => {
      // Sign-out successful.
    }).catch((error) => {
      // An error happened.
    });
    // [END auth_sign_out]
  }*/



