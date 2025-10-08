const {User, Aula, Horario, Materia, Catedra} = require('../models');
const { getIO } = require('../socket');
const {Op} = require('sequelize');

const validateProfe = async (req, res) => {
    try{
        const {sensorId} = req.params;
        const {ShuellaId} = req.body;

        const huellaId = parseInt(ShuellaId)
        console.log(huellaId)
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

        const io = getIO();
        if(catedraExiste){
            io.emit('aula_abrir', {
                aula: aulaExiste.id,
                nombreAula: aulaExiste.nombre,
                nombre: profeExiste.nombre,
                valido: true,
                cerradurAbierta: true
            });

            await Aula.update({cerraduraAbierta: true, lastAulaId: aulaExiste.id}, {where: {id: aulaExiste.id}});
            const updatedAula = await Aula.findByPk(aulaExiste.id)
            return res.status(200).json({messagge: "Profe valido", valido: true, aula:updatedAula});
        }else if(!catedraExiste){
            io.emit('aula_no_abrir', {
                aula: aulaExiste.id,
                nombreAula: aulaExiste.nombre,
                nombre: profeExiste.nombre,
                valido: false,
                cerradurAbierta: false
            });
            return res.status(400).json({messagge: "No existe una catedra para esta materia", valido: false});
        }
        return res.status(400).json({valido: false});
        
    }catch(error){
        return res.status(500).json({messagge: error.messagge});
    }
}



module.exports = {validateProfe}