const {Admin, Aula} = require('../models/');
const jwt = require('jsonwebtoken');
let token = {};
require('dotenv').config();
const { getWSS, getESP } = require('../espSocket'); 
const { getIO } = require('../socket');
const bcrypt = require('bcrypt');


const login = async (req, res) => {
    try{
        const {username, password} = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: 'Se requiere email y contraseña' });
        }

        const adminExiste = await Admin.findOne({where : {username: username}});

        if(!adminExiste) return res.status(404).json({message: "Username incorrecto"});

        const isPasswordValid = await bcrypt.compare(password, adminExiste.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Contraseña incorrecta' });
        }

        token = jwt.sign(
            {
                id: adminExiste.id,
                username: adminExiste.username
            },
            process.env.JWT_SECRET,
            {expiresIn: '12h'}
        )
        return res.status(200).json({
            message: "Login Exitoso",
            token
        })
    }catch(error){
      return res.status(500).json({ message: error.message });
    }
}

const pedirEstado = (client, comando, campo) => {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject('ESP no respondió'), 3000);
    client.send(comando);

    client.once('message', (msg) => {
      clearTimeout(timeout);
      try {
        const data = JSON.parse(msg);

        if (data[campo] !== undefined) {
          const valor = String(data[campo]).trim().toLowerCase();

          // "abierta" → true, "cerrada" → false
          if (valor === 'abierta') resolve(true);
          else if (valor === 'cerrada') resolve(false);
          else reject('Valor desconocido en respuesta del ESP');
        } else {
          reject('Respuesta inválida');
        }
      } catch (e) {
        reject('Error parseando respuesta del ESP');
      }
    });
  });
};

const abrirCerradura = async (req, res) => {
    try {
      const {aulaId} = req.params;

      const aulaExiste = await Aula.findByPk(aulaId);
      
      if(!aulaExiste) return res.status(404).json({message: "Aula no encontrada"});
      const sensorId = aulaExiste.sensorId;
  
      const client = getESP(sensorId);

      if (!client || client.readyState !== 1) {
        return res.status(500).json({ message: 'ESP no conectado' });
      }

      const state = await pedirEstado(client, 'STATUS', 'estado');
      const doorState = await pedirEstado(client, 'DOORSTATUS', 'estadoPuerta');

      if(state===false){
        if(doorState){
          return res.status(400).json({message: "La puerta esta abierta"})
        }
        client.send('OPEN');
  
        // Notificar al frontend
        getIO().emit('cerradura_estado', { abierta: true });
        await Aula.update({cerraduraAbierta: true}, {where: {id: aulaId}})
    
        return res.json({ message: 'Cerradura abierta', cerraduraAbierta: true });
      }else{
        return res.status(400).json({message: "La cerradura ya esta abierta"});
      }
      
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  };
  
  const cerrarCerradura = async (req, res) => {
    try {
      const {aulaId} = req.params;

      const aulaExiste = await Aula.findByPk(aulaId);
      
      if(!aulaExiste) return res.status(404).json({message: "Aula no encontrada"});
      const sensorId = aulaExiste.sensorId;
  
      const client = getESP(sensorId);

      if (!client || client.readyState !== 1) {
        return res.status(500).json({ message: 'ESP no conectado' });
      }

      const state = await pedirEstado(client, 'STATUS', 'estado');
      const doorState = await pedirEstado(client, 'DOORSTATUS', 'estadoPuerta');

      if(state){
        if(doorState){
          return res.status(400).json({message: "La puerta esta abierta"})
        }
        client.send('CLOSE')
  
        getIO().emit('cerradura_estado', { abierta: false });
    
        await Aula.update({cerraduraAbierta: false}, {where: {id: aulaId}})
        return res.json({ message: 'Cerradura cerrada', cerraduraAbierta : false });
      }else{
        return res.status(400).json({message: "La puerta ya esta cerrada"});
      }
      
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  };
  
  const estadoCerradura = async (req, res) => {
    try {
      const {aulaId} = req.params;

      const aulaExiste = await Aula.findByPk(aulaId);
      
      if(!aulaExiste) return res.status(404).json({message: "Aula no encontrada"});
      const sensorId = aulaExiste.sensorId;

      const client = getESP(sensorId);

      if (!client || client.readyState !== 1) {
        return res.status(500).json({ message: 'ESP no conectado' });
      }
      const state = await pedirEstado(client, 'STATUS', 'estado');

      return res.status(200).json({abierta: state})
  
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  };

module.exports = {
    login,
    abrirCerradura,
    cerrarCerradura,
    estadoCerradura
}