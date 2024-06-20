//Import express
const express = require('express');

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
routerUser.post('/adminActions/deleteUser', adminController.deleteUserAdmin);
routerUser.post('/adminActions/updateUser', adminController.updateUser);
routerUser.post('/adminActions/addNode', adminController.addNode);
routerUser.post('/adminActions/addNodetoUser', adminController.addNode_to_User);
routerUser.post('/adminActions/addAdmin', adminController.addAdmin);

//NORMAL USER ACTIONS/////////////
routerUser.post('/log-in', (req,res)=>userController.authLogin(req,res));
routerUser.get('/log-in/mySession', userController.showInfo);
routerLogIn.post('/register/user', userController.registerUser);

routerUser.get('/log-in/myNode/:id', userController.showNode);
routerUser.post('/log-in/myNode/addWater/:id', userController.addWater);
routerUser.post('/log-in/myNode/addNPK/:id', userController.addNPK);

routerUser.get('/log-out', userController.signOutFunction);
routerUser.post('/log-in/restorePsw', userController.restorePsw);


//Export routerUser
module.exports = routerUser; 


