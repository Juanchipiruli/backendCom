const { Aula } = require("../models");

const createAula = async (req, res) => {
  try {
    const { nombre, sensorId } = req.body;
    console.log("MAICO GAY")
    if (!nombre) return res.status(400).json({ messagge: "Se necesita el nombre de la aula." });
    if (!sensorId) return res.status(400).json({ messagge: "Se requiere el id del sensor." });
    console.log("MAICO GAY 2")
    const aulaExiste = await Aula.findOne({ where: { nombre: nombre } });
    
    if (aulaExiste) return res.status(400).json({ messagge: "Ya existe un aula con ese nombre" });
    console.log("MAICO GAY 3")

    const cuerpo = { nombre: nombre, sensorId: sensorId }

    const newAula = await Aula.create(cuerpo, {returning: true});
    console.log("MAICO GAY 4")
    return res.status(201).json(newAula);
  } catch (error) {
    return res.status(500).json({ messagge: error.messagge });
  }
};

const deleteAula = async (req, res) => {
  try {
    const { aulaId } = req.params;

    const aulaExiste = await Aula.findOne({ where: { id: aulaId } });
    if (!aulaExiste) {
      return res.status(404).json({ messagge: "No hay aula con ese id" });
    }
    await Aula.destroy({ where: { id: aulaId } });
    return res
      .status(200)
      .json({ messagge: "Se elimino el aula con id: " + aulaId });
  } catch (error) {
    return res.status(500).json({ messagge: error.messagge });
  }
};

module.exports = {
  createAula,
  deleteAula,
};
