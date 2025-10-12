const { Catedra, Materia, User } = require("../models");

const getCatedras = async (req, res) => {
  try {
    const allCatedras = await Catedra.findAll({
      include: [{ model: Materia }, { model: User }],
    });

    if (allCatedras.length === 0)
      return res.status(200).json({ message: "No existen catedras" });

    return res.status(200).json(allCatedras);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const createCatedra = async (req, res) => {
  try {
    const { userId, materiaId } = req.body;

    if (!userId || !materiaId)
      return res
        .status(400)
        .json({ message: "Se necesitan las IDs de profesor y materia" });

    const catedraExiste = await Catedra.findOne({
      where: { userId: userId, materiaId: materiaId },
    });
    if (catedraExiste)
      return res.status(400).json({ message: "La catedra ya existe" });

    const cuerpo = { userId: userId, materiaId: materiaId };

    const newCatedra = await Catedra.create(cuerpo, { returning: true });

    const catedraCompleto = await Catedra.findOne({
      where: { materiaId: newCatedra.materiaId, userId: newCatedra.userId },
      include: [{ model: Materia }, { model: User }],
    });

    return res.status(201).json(catedraCompleto);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const editCatedra = async (req, res) => {
  try {
    const { materiaId, userId, newMateriaId, newUserId } = req.body;

    const catedraExiste = await Catedra.findOne({
      where: { materiaId: materiaId, userId: userId },
    });

    if (!catedraExiste)
      return res.status(404).json({ message: "No existe esa catedra" });

    const newCatExiste = await Catedra.findOne({where: {materiaId: newMateriaId, userId: newUserId}});

    if(newCatExiste) return res.status(400).json({message: "Ya existe una catedra igual"});

    if (
      (!newMateriaId && !newUserId) ||
      (newMateriaId === "" && newUserId === "")
    )
      return res
        .status(400)
        .json({ message: "No se proporcionaron datos suficientes" });


    await catedraExiste.destroy();
    await Catedra.create({userId: newUserId !== "" ? newUserId : userId, materiaId: newMateriaId !== "" ? newMateriaId : materiaId});

    const catedraUpdated = await Catedra.findOne({
      where: {
        materiaId: newMateriaId !== "" ? newMateriaId : materiaId,
        userId: newUserId !== "" ? newUserId : userId,
      },
      include: [{ model: Materia }, { model: User }],
    });

    return res.status(200).json(catedraUpdated);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const deleteCatedra = async (req, res) => {
  try {
    console.log(req.body);
    const { materiaId, userId } = req.body;

    const catedraExiste = await Catedra.findOne({
      where: { materiaId: materiaId, userId: userId },
    });
    if (!catedraExiste)
      return res.status(404).json({ message: "No existe la catedra" });

    await catedraExiste.destroy();

    return res
      .status(200)
      .json({ message: "Se elimino correctamente", id: { materiaId, userId } });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
module.exports = {
  getCatedras,
  createCatedra,
  deleteCatedra,
  editCatedra,
};
