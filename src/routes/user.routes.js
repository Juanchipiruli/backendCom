const express = require('express');
const router = express.Router();
const {
    obtenerUser,
    obtenerUserHuella,
    getAllUsers,
    createUser,
    deleteUser
} = require('../controllers/user.controller')

router.get('/api/users/id=:id', obtenerUser);
router.post('/api/users/huella=:huellaId', createUser);
router.get('/api/users/', getAllUsers)
router.get('/api/users/huella=:huellaId',obtenerUserHuella)
router.delete('/api/users/huella=:huellaId', deleteUser)

module.exports= router;