const { Horario } = require("../models");

const createHorario = async (req, res) => {
  try {
    const { materia_id, aula_id, dia, hora_inicio, hora_fin } = req.body;

    if (!materia_id)
      return res
        .status(400)
        .json({ messagge: "Se necesita el id de la materia." });
    if (!aula_id)
      return res
        .status(400)
        .json({ messagge: "Se requiere el id de la aula." });
    if (!dia) return res.status(400).json({ messagge: "Se requiere el dia." });
    if (!hora_inicio)
      return res
        .status(400)
        .json({ messagge: "Se requiere la hora de inicio." });
    if (!hora_fin)
      return res.status(400).json({ messagge: "Se requiere la hora de fin." });

    const horarioExiste = await Horario.findOne({
      where: {
        materia_id: materia_id,
        aula_id: aula_id,
        dia: dia,
        hora_inicio: hora_inicio,
        hora_fin: hora_fin,
      },
    });
    if (horarioExiste) {
      return res
        .status(400)
        .json({ messagge: "Ya existe un horario con esos datos" });
    }

    const newHorario = await Horario.create({
      materia_id: materia_id,
      aula_id: aula_id,
      dia: dia,
      hora_inicio: hora_inicio,
      hora_fin: hora_fin,
    });
    return res.status(201).json(newHorario);
  } catch (error) {
    return res.status(500).json({ messagge: error.messagge });
  }
};

const deleteHorario = async (req, res) => {
  try {
    const { horarioId } = req.params;

    const horarioExiste = await Horario.findOne({ where: { id: horarioId } });
    if (!horarioExiste) {
      return res.status(404).json({ messagge: "No hay horario con ese id" });
    }
    await Horario.destroy({ where: { id: horarioId } });
    return res.status(200).json({ messagge: "Se elimino el horario con id: " + horarioId });
  } catch (error) {
    return res.status(500).json({ messagge: error.messagge });
  }
};

module.exports = {
  createHorario,
  deleteHorario
};
