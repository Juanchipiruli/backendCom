const { Aula, User, Catedra, Materia } = require("../models");
const { getIO } = require('../socket');

const getAulas = async (req, res) => {
  try{
    const allAulas = await Aula.findAll();
    if(allAulas.length === 0) return res.status(200).json({message: "No hay aulas"});
    const allMaterias = await Materia.findAll();
    let allAulasMats = [];
    if(allMaterias.length > 0){
      allAulasMats = allAulas.map(aula =>{
        if(aula.ultimaMateriaId){
          const aulaMateria = allMaterias.find(mat => mat.id = aula.ultimaMateriaId);
          if(aulaMateria){
            return {
              id: aula.id,
              nombre: aula.nombre,
              sensorId: aula.sensorId,
              puertaAbierta: aula.puertaAbierta,
              cerraduraAbierta: aula.cerraduraAbierta,
              ultimaMateriaId: aula.ultimaMateriaId,
              ultimaMateriaNombre: aulaMateria.nombre || null
            }
          }
        }else{
          return {
            id: aula.id,
            nombre: aula.nombre,
            sensorId: aula.sensorId,
            puertaAbierta: aula.puertaAbierta,
            cerraduraAbierta: aula.cerraduraAbierta,
            ultimaMateriaId: null,
            ultimaMateriaNombre: null
          }
        }
      })
    }
    const aulasFinal = allAulasMats.filter(a => a !== undefined);

    return res.status(200).json(aulasFinal);
  }catch(error){
    return res.status(500).json({ messagge: error.messagge });
  }
}

const createAula = async (req, res) => {
  try {
    const { nombre, sensorId } = req.body;
    if (!nombre) return res.status(400).json({ messagge: "Se necesita el nombre de la aula." });
    if (!sensorId) return res.status(400).json({ messagge: "Se requiere el id del sensor." });
    const aulaExiste = await Aula.findOne({ where: { nombre: nombre } });
    
    if (aulaExiste) return res.status(400).json({ messagge: "Ya existe un aula con ese nombre" });

    const cuerpo = { nombre: nombre, sensorId: sensorId }

    const newAula = await Aula.create(cuerpo, {returning: true});
    return res.status(201).json(newAula);
  } catch (error) {
    return res.status(500).json({ messagge: error.messagge });
  }
};

const editAula = async (req, res) => {
  try{
    const {aulaId} = req.params;
    const {nombre, sensorId} = req.body;
    const aulaExiste = await Aula.findByPk(aulaId);
    
    if(!aulaExiste) return res.status(404).json({message: "Aula no encontrada"})
    
    if((!nombre && !sensorId) || (nombre === "" && sensorId === "")) return res.status(400).json({message: "No se proporcionaron datos suficientes"})
    
    const aulaYaExiste = await Aula.findOne({where: {nombre: nombre, sensorId: sensorId}});

    if(aulaYaExiste) return res.status(400).json({message: "Ya existe un aula con esos datos"});

    const editData = {}
    
    if(nombre) editData.nombre = nombre;
    if(sensorId) editData.sensorId = sensorId;

    await aulaExiste.update(editData);

    const aulaUpdated = await Aula.findByPk(aulaId);

    if(aulaUpdated.ultimaMateriaId){
      const aulaMat = await Materia.findByPk(aulaUpdated.ultimaMateriaId);
      if(aulaMat) aulaUpdated.ultimaMateriaNombre = aulaMat.nombre
    }
    
    return res.status(200).json(aulaUpdated)

  }catch(error){
    return res.status(500).json({ messagge: error.messagge })
  }
}

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
      .json({ messagge: "Se elimino el aula con id: " + aulaId , id: aulaId});
  } catch (error) {
    return res.status(500).json({ messagge: error.messagge });
  }
};

const closeDoor= async (req, res) => {
  try{
      const {sensorId} = req.params;
      const {ShuellaId} = req.body;

      const aulaExiste = await Aula.findOne({where: {sensorId: sensorId}});

      if(!aulaExiste) return res.status(404).json({message: `Aula no existe`});

      if(aulaExiste.ultimaMateriaId){
        const profeExiste = await User.findOne({where: {huellaId: ShuellaId}});

        if(!profeExiste) return res.status(404).json({message: "Profesor no existe"})

        const catedraExiste = await Catedra.findOne({where: {materiaId: aulaExiste.ultimaMateriaId, userId: profeExiste.id}})

        if(!catedraExiste) return res.status(404).json({message: "El profesor no dicta la materia adecuada"});
      }

      const io = getIO();
      io.emit('aula_cerrar',{
          aula:aulaExiste.id,
          nombreAula: aulaExiste.nombre,
          cerraduraAbierta: false
      })
      await aulaExiste.update({cerraduraAbierta: false, ultimaMateriaId: null});
      return res.status(200).json({message: `Aula ${aulaExiste.nombre} Cerradura cerrada`})
  }catch(error){
    console.log(error);
    return res.status(500).json({message: error.messagge});
  }
}

const doorState = async (req, res)=>{
  try{
      const {sensorId} = req.params;
      const {doorState} = req.body;

      const aulaExiste = await Aula.findOne({where: {sensorId: sensorId}});
      if(!aulaExiste) return res.status(404).json({messagge: "No existe el aula"});

      const io = getIO();
      io.emit('aula_door', {
          aula:aulaExiste.id,
          nombreAula: aulaExiste.nombre,
          puertaAbierta: doorState === "abierta" 
      })
      await aulaExiste.update({puertaAbierta: doorState === "abierta" });
      return res.status(200).json({messagge: `Aula ${aulaExiste.nombre} con estado: ${doorState}`})
  }catch(error){
      return res.status(500).json({messagge: error.messagge});
  }
}



module.exports = {
  getAulas,
  createAula,
  deleteAula,
  closeDoor,
  doorState,
  editAula
};
