const express = require('express');
const router = express.Router();
const {
    createHorario,
    deleteHorario,
    getHorarios
} = require('../controllers/horario.controller');
const {verifyToken} = require('../middleware/auth.middleware');

router.get('/', verifyToken, getHorarios);

router.post('/', verifyToken, createHorario);
router.delete('/id=:horarioId', verifyToken, deleteHorario);

module.exports = router;