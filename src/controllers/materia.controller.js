const {Materia} = require('../models');

const createMateria = async (req, res) =>{
    try{
        const {nombre, carrera} = req.body;

        if(!nombre || !carrera){
            return res.status(400).json({message: "Se necesitan el nombre y la carrera"});
        }
        const cuerpo = {nombre: nombre, carrera: carrera};

        const newMateria = await Materia.create(cuerpo, {returning: true})

        return res.status(201).json(newMateria);
    }catch(error){
        return res.status(500).json({message: error.message})
    }
}


module.exports = {
    createMateria
}