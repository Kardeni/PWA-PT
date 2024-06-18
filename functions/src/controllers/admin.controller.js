//Import obj readUser which contains the user model where we make the database connection
const readUser = require('../models/user.model'); 
//Import firebase auth
const { auth } = require('./firebaseConfig');
const { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendPasswordResetEmail, EmailAuthCredential, deleteUser } = require('firebase/auth');
const admin = require('firebase-admin');
admin.initializeApp();


    //Function that gets all users in table Usuario
const getAllUsers=(req,res)=>{
    readUser.query('SELECT * FROM Usuario', (req,result)=>{
        res.send(result);
    });  
}
    //Function that shows all actions admin exclusive
const adminActions=(req,res, mensaje, usuarioCreado = 'false')=>{
    const createdUser = usuarioCreado === 'true';
    const list = [];//create an empty array 
    const nodesList = [];//create an empty array 
    //Get all users from DB
    readUser.query('SELECT * FROM Usuario ', (req,result)=>{
        //Fill the array with all the users info 
        for (let i = 0; i < result.length; i++) {
            //One user => one element of the array (i)
            list[i] = {
                // var in js array : var in result from DB query
                idUser: result[i].idUsuario,
                name: result[i].nombre,
                lastName: result[i].apellido,
                email: result[i].email,
                adminFlag: result[i].bandera_administrador
            };
        }
            readUser.query('SELECT * FROM Nodo ', (req,resultNodo)=>{
                //Fill the array with all the users info 
                for (let i = 0; i < resultNodo.length; i++) {
                    //One user => one element of the array (i)
                    nodesList[i] = {
                        // var in js array : var in result from DB query
                        idNodo: resultNodo[i].idNodo,
                        grade: resultNodo[i].grado,
                        name: resultNodo[i].nombre
                    };
                }
                //Render adminView.pug; {var-in-Pug:var-in-Js}
                res.render('adminView', { 
                        userList: list, 
                        nodesList:nodesList,
                        usuarioCreado:createdUser,
                        message:mensaje
                    }); 
            });
    }); 
}
    //Function that adds a user in the DB
const addUser=(req, res) => {
    //console.log(req.body);
    //Create a constant that contains the info in the body of the request 
    const { name, lastName, lastName2, email, birthday, gender, adminFlag, node, password } = req.body;
    //Insert query into table Usuario
    readUser.query('INSERT INTO Usuario (nombre, apellido, seg_apellido, correo, fecha_nacimiento, genero, bandera_administrador) VALUES (?, ?, ?, ?, ?, ?, ?);', [name, lastName, lastName2, email, birthday, gender, adminFlag ], (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).send("Error al agregar usuario en Azure");
            return;
        }else{
            readUser.query('SET @idUsuario = LAST_INSERT_ID();');
            readUser.query('INSERT INTO Usuario_tiene_Nodo (Usuario_idUsuario, Nodo_idNodo) VALUES (@idUsuario,?)', [node], (err, result) => {
                if (err) {
                    console.error(err);
                    res.status(500).send("Error al asignar el nodo");
                    return;
                }else{
                    createUserWithEmailAndPassword(auth, email, password)
                    .then((userCredential) => {
                        // Registered successfully
                        const user = userCredential.user;
                        //console.log('User registered successfully');
                        adminActions(req, res, 'Usuario agregado exitosamente', 'true');
                    })
                    .catch((error) => {
                        const errorCode = error.code;
                        const errorMessage = error.message;
                        res.status(400).send(`Error de Firebase: ${errorMessage}`);
                    });
                }
            })
        }
        //res.redirect('/');
    });
    }
    //Function that updates certain fields in a user in DB
const updateUser=(req, res) => {
    //console.log(req.body);
    //Create a constant that contains the info in the body of the request
    const { idUpdate, name, lastName, lastName2, email, birthday, gender, adminFlag, node } = req.body;

    //Query to get the info of the user that idUsuario=idUpdate from the request
    readUser.query('SELECT * FROM Usuario WHERE idUsuario = ?', [idUpdate], (req, resultado) => {

        const user = resultado[0];//save the user info in user
        let updates = [];//array to fields to update in DB
        let values = [];//array to the values to updtae

        //This function adds only the fields that are present on the req body (the ones to update)
        const addUpdate = (field, value) => {
            if (value !== undefined && value !== '') { //condition to verify if the req field is empty or not
                //if the field is not empty means that is part of the update and will add to the updates and values arrays
                updates.push(`${field} = ?`); //adds a string to the updates array, ? is a position marker for the value
                values.push(value);//adds value to the array values
            }
        };

        //Add fields to update if they exist in the request body; with the addUpdate function
        addUpdate('nombre', name); //field, value
        addUpdate('apellido', lastName);
        addUpdate('seg_apellido', lastName2);
        addUpdate('correo', email);
        addUpdate('fecha_nacimiento', birthday);
        addUpdate('genero', gender);
        addUpdate('bandera_administrador', adminFlag);
        addUpdate('nodo', node);

        // Add idUpdate at the end of the value arrays for the WHERE condition in sql query
        values.push(idUpdate);

            /*To build the sql query we use an string interpolation, to include dinamically the fields and its new values
            Updates is an array that contains the fiels to update; join(', ') joins all the elements of the array in 
            just one string, separated with spaces and comas
            ['apellido = ?', 'fecha_nacimiento = ?']====>'apellido = ?, fecha_nacimiento = ?'*/
            readUser.query(`UPDATE Usuario SET ${updates.join(', ')} WHERE idUsuario = ?`,values, (err, result) => {
                if (err) {
                    console.error(err);
                    res.status(500).send("Error al actualizar usuario");
                    return;
                }
                adminActions(req, res, 'Usuario actualizado exitosamente', 'true');
            });
    });
}
    //Function that deletes a user from DB
const deleteUserAdmin=(req, res) => {
    //console.log(req.body);
    //Create a const that contains the id of the user to delete 
    const idDelete = req.body.idDelete;
    //Delete query in table User where idUsuario=idDelete from the body request
    readUser.query('SELECT correo FROM Usuario WHERE idUsuario=?', [idDelete], async (err, results) => {
        const emailtoDelete = results[0].correo;
        console.log(emailtoDelete);
        readUser.query('DELETE FROM Usuario WHERE idUsuario = ?', [idDelete], async (err, result) => {
            if (err) {
                console.error(err);
                res.status(500).send("Error al eliminar usuario");
                return;
            }
            /* //ESTA ES LA PARTE DE BORRAR EN FIREBASE
            try {
                const userRecord = await admin.auth().getUserByEmail(emailtoDelete);
                const userToDeleteUid = userRecord.uid;
                await admin.auth().deleteUser(userToDeleteUid);
                return { message: 'User deleted successfully' };
            } catch (error) {
                console.error('Error deleting user:', error);
                //throw new functions.https.HttpsError('internal', 'Unable to delete user');
            }*/
            adminActions(req, res, 'Usuario eliminado exitosamente', 'true');
        });
    });
}

const addNode=(req,res)=>{
    console.log(req.body);
    const{name}= req.body;
    readUser.query('INSERT INTO Nodo (nombre) VALUES (?);', [name], (err, result)=>{
        if (err) {
            console.error(err);
            res.status(500).send("Error al agregar nodo");
            return;
        }
        adminActions(req, res, 'Nodo agregado exitosamente', 'true');
    })
}
const addNode_to_User=(req,res)=>{
    console.log(req.body);
    const user = req.body.userSelect;
    const node = req.body.nodeSelect;
    readUser.query('INSERT INTO Usuario_tiene_Nodo (Usuario_idUsuario, Nodo_idNodo) VALUES (?, ?);', [user, node], (err, result)=>{
        if (err) {
            console.error(err);
            res.status(500).send("Error al asignar nodo");
            return;
        }
        adminActions(req, res, 'Nodo agregado al usuario exitosamente', 'true');
    })
}

const addAdmin=(req,res)=>{
    //Create a const that contains the id of the user to update to admin
    const newAdmin = req.body.idNewAdmin;
    //Delete query in table User where idUsuario=idDelete from the body request
    readUser.query('UPDATE Usuario SET bandera_administrador=1 WHERE idUsuario = ?;',[newAdmin], (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).send("Error al agregar usuario administrador");
            return;
        }
        adminActions(req, res, 'Administrador agregado exitosamente', 'true');
    });
}

module.exports = {
    getAllUsers,
    adminActions,
    addUser,
    updateUser,
    deleteUserAdmin,
    addNode,
    addNode_to_User,
    addAdmin
};

