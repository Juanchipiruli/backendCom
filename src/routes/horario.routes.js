const express = require('express');
const router = express.Router();
const {
    createHorario,
    deleteHorario
} = require('../controllers/horario.controller');

router.post('/', createHorario);
router.delete('/id=:horarioId', deleteHorario);

module.exports = router;