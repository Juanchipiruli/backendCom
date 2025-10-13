const {Materia} = require('../models');

const getMaterias = async (req, res) =>{
    try{
        const allMaterias = await Materia.findAll();

        if(allMaterias.length === 0) return res.status(200).json({message: "No hay materias"});

        return res.status(200).json(allMaterias);
    }catch(error){
        return res.status(500).json({message: error.message})
    }
}

const createMateria = async (req, res) =>{
    try{
        const {nombre, carrera} = req.body;

        if(!nombre || !carrera){
            return res.status(400).json({message: "Se necesitan el nombre y la carrera"});
        }

        const materiaExiste = await Materia.findOne({where: {nombre: nombre, carrera: carrera}});

        if(materiaExiste){
            return res.status(400).json({message: "Ya existe la materia."})
        }
        const cuerpo = {nombre: nombre, carrera: carrera};

        const newMateria = await Materia.create(cuerpo, {returning: true})

        return res.status(201).json(newMateria);
    }catch(error){
        return res.status(500).json({message: error.message})
    }
}

const updateMateria = async (req, res) =>{
    try{
        console.log("HOLA");
        const {matId} = req.params;
        const {nombre, carrera} = req.body;

        console.log(matId);
        console.log(nombre);
        console.log(carrera);

        const materiaExiste = await Materia.findByPk(matId);

        if(!materiaExiste) return  res.status(404).json({message: "No se encontro la materia"})

        if(!nombre && !carrera) return res.status(400).json({message: "No se proporcionaron datos suficientes"});

        const cuerpo = {}
        if(nombre && nombre != "") cuerpo.nombre = nombre;
        if(carrera && carrera != "") cuerpo.carrera = carrera;
        
        await materiaExiste.update(cuerpo);
        const updatedMateria = await Materia.findByPk(matId);

        return res.status(200).json(updatedMateria)
    }catch(error){
        return res.status(500).json({message: error.message})
    }
}

const deleteMateria = async (req, res) => {
    try{
        const {matId} = req.params;
        const materiaExiste = await Materia.findByPk(matId);

        if(!materiaExiste) return  res.status(404).json({message: "No se encontro la materia"});

        await materiaExiste.destroy()

        return res.status(200).json({message: "Se elimino correctamente", id: matId})
    }catch(error){
        return res.status(500).json({message: error.message});
    }
}

module.exports = {
    getMaterias,
    createMateria,
    updateMateria,
    deleteMateria
}