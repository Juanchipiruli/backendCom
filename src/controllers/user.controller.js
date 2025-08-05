const {User} = require('../models');
const { getIO } = require('../socket');

const obtenerUser = async (req, res) => {
    try{
        const {id} = req.params;

        const userExiste = await User.findByPk(id)
        if(!userExiste){
            return res.status(404).json({messagge: "No se encontro usuario."})
        } 
        return res.status(200).json({nombre: userExiste.nombre, huellaId: userExiste.huellaId});
    }catch(error){
        return res.status(500).json({messagge: error.messagge});
    }
}
const obtenerUserHuella = async (req, res) => {
    try{
        const {huellaId} = req.params;

        const userExiste = await User.findOne({where:{huellaId: huellaId}})
        if(!userExiste){
            return res.status(404).json({messagge: "No se encontro usuario."})
        } 
        const io = getIO();
        io.emit('huella_detectada', {
            nombre: userExiste.nombre,
            huellaId: userExiste.huellaId,
            timestamp: new Date(),
        });

        return res.status(200).json({nombre: userExiste.nombre});
    }catch(error){
        return res.status(500).json({messagge: error.messagge});
    }
}
const createUser = async(req, res) => {
    try{
        const {huellaId} = req.params
        const {nombre} = req.body;

        if(!nombre) return res.status(400).json({messagge:"Se necesita el nombre."});
        if(!huellaId) return res.status(400).json({messagge:"Se requiere el id."});

        const userExiste = await User.findOne({where:{huellaId: huellaId}})
        if(userExiste){
            return res.status(400).json({messagge: "Ya existe un usuario con esa huella"})
        } 
        
        const newUser = await User.create({huellaId: huellaId, nombre: nombre})
        return res.status(201).json(newUser);
    }catch(error){
        return res.status(500).json({messagge: error.messagge});
    }
}
const getAllUsers = async (req, res) => {
    try{
        const allUsers = await User.findAll();

        if(allUsers.length === 0) return res.status(404).json({messagge: "No existen usuarios"});

        return res.status(200).json(allUsers);
    }catch(error){
        return res.status(500).json({messagge: error.messagge});
    }
}
const deleteUser = async (req, res) => {
    try{
        const {huellaId} = req.params;

        const userExiste = await User.findOne({where:{huellaId: huellaId}})
        if(!userExiste){
            return res.status(404).json({messagge: "No hay usuario con esa huella"})
        } 
        await User.destroy({where:{huellaId: huellaId}});
        return res.status(200).json({messagge: "Se elimino el usuario:"})
    }catch(error){
        return res.status(500).json({messagge: error.messagge});
    }
}

module.exports = {
    obtenerUser,
    createUser,
    getAllUsers,
    obtenerUserHuella,
    deleteUser
}