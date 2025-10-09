const express = require('express');
const router = express.Router();
const {login, abrirCerradura, cerrarCerradura, estadoCerradura} = require('../controllers/admin.controller');
const {verifyToken} = require('../middleware/auth.middleware');

router.post('/login', login);
router.get('/abrir/:aulaId', verifyToken, abrirCerradura);
router.get('/cerrar/:aulaId', verifyToken, cerrarCerradura);
router.get('/estado/:aulaId', verifyToken, estadoCerradura);

module.exports = router;