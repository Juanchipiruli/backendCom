const express = require('express');
const router = express.Router();
const userRoutes = require('./user.routes');

router.use('/api/users', userRoutes);

router.get('/health', (req, res) => {
    res.json({ message: 'API funcionando correctamente' });
});

module.exports = router;