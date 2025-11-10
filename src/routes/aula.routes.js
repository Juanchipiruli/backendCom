const express = require('express');
const router = express.Router();
const {
    createAula,
    deleteAula,
    closeDoor,
    doorState, 
    getAulas,
    editAula
} = require('../controllers/aula.controller');
const {verifyToken} = require('../middleware/auth.middleware');

router.post('/', verifyToken, createAula);
router.delete('/id=:aulaId',verifyToken, deleteAula);
router.get('/', verifyToken, getAulas)

router.patch('/close=:sensorId', closeDoor);
router.put('/update=:sensorId', doorState);
router.put('/id=:aulaId', verifyToken, editAula)

module.exports = router;