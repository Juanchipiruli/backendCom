const {User, Aula, Horario, Materia, Catedra} = require('../models');
const { getIO } = require('../socket');
const {Op} = require('sequelize')

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

const validateProfe = async (req, res) => {
    try{
        const {sensorId} = req.params;
        const {huellaId} = req.body;

        const aulaExiste = await Aula.findOne({where: {sensorId: sensorId}});
        const profeExiste = await User.findOne({where: {huellaId: huellaId}});

        if(!aulaExiste) return res.status(400).json({messagge: "No existe el aula", valido: false});
        if(!profeExiste) return res.status(400).json({messagge: "No existe profe", valido: false});

        const now = new Date();
        const diaSemana = now.getDay();
        const horaActual = now.toTimeString().slice(0, 5);

        const horarioCoincidente = await Horario.findOne({
            where: {
                aulaId: aulaExiste.id,
                dia: diaSemana,
                horaInicio: { [Op.lte]: horaActual },
                horaFin: { [Op.gte]: horaActual }
            }
        });
        
        if(!horarioCoincidente) {
            return res.status(404).json({messagge: "No hay horario programado para esta aula en este momento", valido: false});
        }

        const materiaExiste = await Materia.findByPk(horarioCoincidente.materiaId);
        if(!materiaExiste) return res.status(400).json({messagge:"El horario no coincide con la materia", valido: false});

        const catedraExiste = await Catedra.findOne({where: {materiaId: materiaExiste.id, userId: profeExiste.id}});

        if(catedraExiste){
            io.emit('aula_abrir', {
                aula: aulaExiste.id,
                nombreAula: aulaExiste.nombre,
                nombre: profeExiste.nombre,
                valido: true
            });
            return res.status(200).json({messagge: "Profe valido", valido: true});
        }else if(!catedraExiste){
            io.emit('aula_no_abrir', {
                aula: aulaExiste.id,
                nombreAula: aulaExiste.nombre,
                nombre: profeExiste.nombre,
                valido: false
            });
            return res.status(400).json({messagge: "No existe una catedra para esta materia", valido: false});
        }
        return res.status(400).json({valido: false});
        
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
            return res.status(400).json({messagge: "Ya existe un usuario con ese id"})
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
    deleteUser,
    updateUser,
    validateProfe
}