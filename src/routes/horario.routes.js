const express = require('express');
const router = express.Router();
const {
    createHorario,
    deleteHorario,
    getHorarios,
    updateHorario
} = require('../controllers/horario.controller');
const {verifyToken} = require('../middleware/auth.middleware');

router.get('/', verifyToken, getHorarios);

router.post('/', verifyToken, createHorario);
router.delete('/id=:horarioId', verifyToken, deleteHorario);
router.put('/id=horarioId', verifyToken, updateHorario);

module.exports = router;