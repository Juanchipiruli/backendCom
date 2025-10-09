const {Catedra, Materia, User} = require('../models');

const getCatedras = async (req, res) => {
    try{
    
    const allCatedras = await Catedra.findAll({
        include: [
            { model: Materia },
            { model: User }
        ]
        });

    if(allCatedras.length === 0) return res.status(200).json({message: "No existen catedras"});

    return res.status(200).json(allCatedras);
    }catch(error){
        return res.status(500).json({message: error.message})
    }
}

const createCatedra = async (req, res) => {
    try{
        const {userId, materiaId} = req.body;

        if(!userId || !materiaId) return res.status(400).json({message: "Se necesitan las IDs de profesor y materia"})

        const catedraExiste = await Catedra.findOne({where: {userId: userId, materiaId: materiaId}})
        if(catedraExiste) return res.status(400).json({message: "La catedra ya existe"});

        const cuerpo = {userId: userId, materiaId: materiaId};

        const newCatedra = await Catedra.create(cuerpo, {returning: true});

        const catedraCompleto = await Catedra.findOne({	
            where: {materiaId: newCatedra.materiaId, userId: newCatedra.userId},
            include: [{model: Materia}, {model: User}]
        })

        return res.status(201).json(catedraCompleto);
    }catch(error){
        return res.status(500).json({message: error.message})
    }
}

const editCatedra = async (req, res) => {
    try{
        const {materiaId, userId} = req.body;

        const catedraExiste = await Catedra.findByPk(catedraId);

        if(!catedraExiste) return res.status(404).json({message: "No existe esa catedra"});

        if((!materiaId && !userId) || (materiaId === "" && userId === "")) return res.status(400).json({message: "No se proporcionaron datos suficientes"})
        
        const editData = {}
        if(materiaId) editData.materiaId = materiaId;
        if(userId) editData.userId = userId;

        await catedraExiste.update(editData);

        const catedraUpdated = await Catedra.findByPk(catedraId, {include: [
            { model: Materia },
            { model: User }
        ]
        })

        return res.status(200).json(catedraUpdated);
    }catch{
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
    getCatedras,
    createCatedra,
    deleteCatedra,
    editCatedra
}