const express = require('express');
const router = express.Router();
const {
    createAula,
    deleteAula,
    closeDoor,
    doorState, 
    getAulas
} = require('../controllers/aula.controller');
const {verifyToken} = require('../middleware/auth.middleware');

router.post('/', verifyToken, createAula);
router.delete('/id=:aulaId',verifyToken, deleteAula);
router.get('/', verifyToken, getAulas)

router.patch('/close=:sensorId', closeDoor);
router.post('/update=:sensorId', doorState);

module.exports = router;