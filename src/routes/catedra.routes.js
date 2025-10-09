const express = require('express');
const router = express.Router();
const {
    createCatedra,
    deleteCatedra,
    getCatedras,
    editCatedra
} = require('../controllers/catedra.controller');
const {verifyToken} = require('../middleware/auth.middleware');

router.get('/', verifyToken, getCatedras);

router.post('/', verifyToken, createCatedra);
router.delete('/id=catId', verifyToken, deleteCatedra);
router.put('/', verifyToken, editCatedra);

module.exports = router;