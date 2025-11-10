const { Horario, Materia, Aula } = require("../models");

const getHorarios = async (req, res) => {
  try{
    const allHorarios = await Horario.findAll({include: [{model: Materia }, {model: Aula }]});

    if(allHorarios.length === 0) return res.status(200).json({message: "No hay horarios"});

    return res.status(200).json(allHorarios);
  }catch(error){
    return res.status(500).json({message: error.message})
  }
}

const createHorario = async (req, res) => {
  try {
    const { materiaId, aulaId, dia, horaInicio, horaFin } = req.body;

    if (!materiaId)
      return res
        .status(400)
        .json({ messagge: "Se necesita el id de la materia." });
    if (!aulaId)
      return res
        .status(400)
        .json({ messagge: "Se requiere el id de la aula." });
    if (!dia) return res.status(400).json({ messagge: "Se requiere el dia." });
    if (!horaInicio)
      return res
        .status(400)
        .json({ messagge: "Se requiere la hora de inicio." });
    if (!horaFin)
      return res.status(400).json({ messagge: "Se requiere la hora de fin." });

    const materiaExiste = await Materia.findByPk(materiaId);
    const aulaExiste = await Aula.findByPk(aulaId);

    if(!materiaExiste || !aulaExiste){
      return res.status(404).json({message: "El aula o la materia no existe"});
    }
    const horarioExiste = await Horario.findOne({
      where: {
        materiaId: materiaId,
        aulaId: aulaId,
        dia: dia,
        horaInicio: horaInicio,
        horaFin: horaFin,
      }
    });
    if (horarioExiste) {
      return res
        .status(400)
        .json({ messagge: "Ya existe un horario con esos datos" });
    }

    const newHorario = await Horario.create({
      materiaId: materiaId,
      aulaId: aulaId,
      dia: dia,
      horaInicio: horaInicio,
      horaFin: horaFin,
    });
    const horarioCompleto = await Horario.findOne({
      where: { id: newHorario.id },
      include: [{ model: Materia }, { model: Aula }],
    });

    return res.status(201).json(horarioCompleto);
  } catch (error) {
    return res.status(500).json({ messagge: error });
  }
};

const updateHorario = async (req, res) => {
  try{
    const {horarioId} = req.params;
    const { materiaId, aulaId, dia, horaInicio, horaFin } = req.body;

    const horarioExiste = await Horario.findByPk(horarioId);

    if(!horarioExiste) return res.status(404).json({message: "El horario no existe"});

    const horarioYaExiste = await Horario.findOne({where: {materiaId: materiaId, aulaId: aulaId, dia: dia, horaInicio: horaInicio, horaFin: horaFin}});

    if(horarioYaExiste) return res.status(400).json({message: "Ya existe un horario con esos datos"});

    if((!materiaId && !aulaId && !dia && !horaInicio && !horaFin) || (materiaId==="" && aulaId==="" && dia==="" && horaInicio==="" && horaFin==="")) return res.status(400).json({message: "No se proporcionaron datos suficientes"});

    let editData = {};

    if(materiaId && materiaId != "") editData.materiaId = materiaId;
    if(aulaId && aulaId != "") editData.aulaId = aulaId;
    if(dia && dia != "") editData.dia = dia;
    if(horaInicio && horaInicio != "") editData.horaInicio = horaInicio;
    if(horaFin && horaFin != "") editData.horaFin = horaFin;

    await horarioExiste.update(editData);

    const updatedHorario = await Horario.findByPk(horarioId, {include: [{model: Materia }, {model: Aula }]});

    return res.status(200).json(updatedHorario);
  }catch(error){
    return res.status(500).json({ messagge: error.messagge });
  }
}

const deleteHorario = async (req, res) => {
  try {
    const { horarioId } = req.params;

    const horarioExiste = await Horario.findOne({ where: { id: horarioId } });
    if (!horarioExiste) {
      return res.status(404).json({ messagge: "No hay horario con ese id" });
    }
    await Horario.destroy({ where: { id: horarioId } });
    return res.status(200).json({ messagge: "Se elimino el horario con id: " + horarioId, id: horarioId });
  } catch (error) {
    return res.status(500).json({ messagge: error.messagge });
  }
};

module.exports = {
  getHorarios,
  createHorario,
  deleteHorario,
  updateHorario
};
