const {User} = require('../models');
const { getIO } = require('../socket');

const obtenerUser = async (req, res) => {
    try{
        const {userId} = req.params;

        const userExiste = await User.findByPk(userId)
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
        const {userId} = req.params;

        const userExiste = await User.findOne({where:{id: userId}})
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
        const {userId} = req.params
        const {nombre} = req.body;

        if(!nombre) return res.status(400).json({messagge:"Se necesita el nombre."});
        if(!userId) return res.status(400).json({messagge:"Se requiere el id."});

        const userExiste = await User.findOne({where:{id: userId}})
        if(userExiste){
            return res.status(400).json({messagge: "Ya existe un usuario con ese id"})
        } 
        
        const newUser = await User.create({id: userId, nombre: nombre})
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
        const {userId} = req.params;

        const userExiste = await User.findOne({where:{id: userId}})
        if(!userExiste){
            return res.status(404).json({messagge: "No hay usuario con ese id"})
        } 
        await User.destroy({where:{id: userId}});
        return res.status(200).json({messagge: "Se elimino el usuario:", id: userId});
    }catch(error){
        return res.status(500).json({messagge: error.messagge});
    }
}
const updateUser = async (req, res) => {
    try{
        const {userId} = req.params;
        const {nombre, huellaId} = req.body;


        const userExiste = await User.findOne({where:{id: userId}})
        if(!userExiste){
            return res.status(404).json({messagge: "No hay usuario con ese id"})
        } 
        await User.update({nombre: nombre, huellaId: huellaId}, {where:{id: userId}});
        return res.status(200).json({messagge: "Se actualizo el usuario:", id: userId, nombre: nombre, huellaId: huellaId});

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