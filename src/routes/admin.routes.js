const express = require('express');
const router = express.Router();
const {login, abrirCerradura, cerrarCerradura, estadoCerradura} = require('../controllers/admin.controller');

router.post('/login', login);
router.get('/abrir/:aulaId', abrirCerradura);
router.get('/cerrar/:aulaId', cerrarCerradura);
router.get('/estado/:aulaId', estadoCerradura);

module.exports = router;