const {Catedra} = require('../models');

const createCatedra = async (req, res) => {
    try{
        const {userId, materiaId} = req.body;

        if(!userId || !materiaId) return res.status(400).json({message: "Se necesitan las IDs de profesor y materia"})

        const catedraExiste = await Catedra.findOne({where: {userId: userId, materiaId: materiaId}})
        if(catedraExiste) return res.status(400).json({message: "La catedra ya existe"});

        const cuerpo = {userId: userId, materiaId: materiaId};

        const newCatedra = await Catedra.create(cuerpo, {returning: true});

        return res.status(201).json(newCatedra);
    }catch(error){
        return res.status(500).json({message: error.message})
    }
}

const deleteCatedra = async (req, res) => {
    try{
        const {catId} = req.params;

        const catedraExiste = await Catedra.findByPk(catId);
        if(!catedraExiste) return res.status(404).json({message: "No existe la catedra"});

        await catedraExiste.destroy();

        return res.status(200).json({message: "Se elimino correctamente", id: catId})
    }catch(error){
        return res.status(500).json({message: error.message})
    }
}
module.exports = {
    createCatedra,
    deleteCatedra
}