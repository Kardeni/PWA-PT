//Import express
const express = require('express');
const session = require('express-session'); //for express sessions

//Import admin.controller in obj adminController
const adminController=require('../controllers/admin.controller'); 
//Import user.controller in obj userController
const userController=require('../controllers/user.controller'); 
const routerLogIn = require('../controllers/index.controllers');

//Import routerUser; ==>'/user'
const routerUser = express.Router(); //router

//Give routerUser json properties
routerUser.use(express.json());

/*In each line we access to different functions in user.controller 
sintax=>routerUser.method-to-use('URL from /user/', controller.function-in-controller)*/

//ADMIN ACTIONS////////////////
routerUser.get('/', adminController.getAllUsers);
routerUser.get('/adminActions', adminController.adminActions);
routerUser.post('/adminActions/addUser', adminController.addUser);
routerUser.post('/adminActions/deleteUser', adminController.deleteUser);
routerUser.post('/adminActions/updateUser', adminController.updateUser);
routerUser.post('/adminActions/addNode', adminController.addNode);
routerUser.post('/adminActions/addNodetoUser', adminController.addNode_to_User);

//NORMAL USER ACTIONS/////////////
routerUser.post('/log-in', userController.authLogin);
routerUser.get('/log-in/mySession', userController.showInfo);
routerLogIn.post('/register/user', userController.registerUser);
routerUser.get('/log-in/myNode', userController.showNode);/* Add recently*/

//Export routerUser
module.exports = routerUser; 


