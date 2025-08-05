const express = require('express');
const router = express.Router();
const {
    createMateria,
    updateMateria,
    deleteMateria
} = require('../controllers/materia.controller');

router.post('/', createMateria);
router.put('/id=:matId', updateMateria);
router.delete('/id=matId', deleteMateria);

module.exports= router;