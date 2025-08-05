const express = require('express');
const router = express.Router();
const {
    obtenerUser,
    createUser,
    getAllUsers,
    obtenerUserHuella,
    deleteUser,
    updateUser
} = require('../controllers/user.controller')

router.get('/id=:userId', obtenerUser);
router.post('/huella=:huellaId', createUser);
router.get('/', getAllUsers)
router.get('/huella=:huellaId',obtenerUserHuella)
router.delete('/id=:userId', deleteUser)
router.put('/id=:userId', updateUser)

module.exports= router;