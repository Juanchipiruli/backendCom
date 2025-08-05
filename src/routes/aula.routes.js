const express = require('express');
const router = express.Router();
const {
    createAula,
    deleteAula,
} = require('../controllers/aula.controller');

router.post('/', createAula);
router.delete('/id=:aulaId',deleteAula);

module.exports = router;