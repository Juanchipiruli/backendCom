const express = require('express');
const router = express.Router();
const {
    createMateria,
    updateMateria,
    deleteMateria,
    getMaterias
} = require('../controllers/materia.controller');
const {verifyToken} = require('../middleware/auth.middleware');

router.get('/', verifyToken, getMaterias);

router.post('/', verifyToken, createMateria);
router.put('/id=:matId', verifyToken, updateMateria);
router.delete('/id=matId', verifyToken, deleteMateria);

module.exports= router;