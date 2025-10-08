const express = require('express');
const router = express.Router();
const userRoutes = require('./user.routes');
const materiaRoutes = require('./materia.routes');
const aulaRoutes= require('./aula.routes');
const catedraRoutes= require('./catedra.routes');
const horarioRoutes = require('./horario.routes');
const validateRoutes = require('./validate.routes');
const adminRoutes = require('./admin.routes');
const { Catedra } = require('../models');

router.use('/api/users', userRoutes);
router.use('/api/materias', materiaRoutes);
router.use('/api/aulas', aulaRoutes);
router.use('/api/catedras',catedraRoutes);
router.use('/api/horarios', horarioRoutes);
router.use('/api/validate', validateRoutes);
router.use('/api/admins', adminRoutes);

router.get('/health', (req, res) => {
    res.json({ message: 'API funcionando correctamente' });
});

module.exports = router;