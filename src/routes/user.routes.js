const express = require('express');
const router = express.Router();
const {
    obtenerUser,
    createUser,
    getAllUsers,
    obtenerUserHuella,
    deleteUser,
    updateUser
} = require('../controllers/user.controller');
const {verifyToken} = require('../middleware/auth.middleware');

router.get('/id=:userId', obtenerUser);
router.post('/huella=:huellaId', verifyToken, createUser);
router.get('/', verifyToken, getAllUsers);
router.get('/huella=:huellaId',obtenerUserHuella);
router.delete('/id=:userId', verifyToken, deleteUser);
router.put('/id=:userId', verifyToken, updateUser);


module.exports= router;