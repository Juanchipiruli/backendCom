const express = require('express');
const router = express.Router();
const {validateProfe} = require('../controllers/validation.controller')
const {ONLYverifyToken} = require('../middleware/auth.middleware');

router.post('/sensor=:sensorId', validateProfe);
router.get('/', ONLYverifyToken);

module.exports = router;