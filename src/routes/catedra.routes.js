const express = require('express');
const router = express.Router();
const {
    createCatedra,
    deleteCatedra
} = require('../controllers/catedra.controller');

router.post('/', createCatedra);
router.delete('/id=catId', deleteCatedra);

module.exports = router;