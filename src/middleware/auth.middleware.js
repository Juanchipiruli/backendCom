const jwt = require('jsonwebtoken');
require('dotenv').config();
const {Admin} = require('../models');

// Middleware para verificar token
const verifyToken = async (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    
    if (!token) {
        return res.status(403).json({ message: 'Se requiere un token para autenticación' });
    }
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;

        const adminExiste = await Admin.findByPk(req.user.id);

        if(!adminExiste) return res.status(404).json({message: "El token es invalido"});
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Token inválido o expirado' });
    }
};
const ONLYverifyToken = async (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    
    if (!token) {
        return res.status(403).json({valid: false});
    }
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;

        const adminExiste = await Admin.findByPk(req.user.id);

        if(!adminExiste) return res.status(403).json({valid: false});
        return res.status(200).json({valid:  true});
    } catch (error) {
        return res.status(401).json({valid: false});
    }
};

module.exports = {
    verifyToken,
    ONLYverifyToken
};