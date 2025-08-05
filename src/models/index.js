const User  = require('./user');
const Aula = require('./aula');
const Horario = require('./horario');
const Materia = require('./materia');
const Catedra = require('./catedra');
//MATERIA-AULA
Materia.hasMany(Aula, {foreignKey: 'materiaId'});
Aula.belongsTo(Materia, {foreignKey: 'materiaId'});
//MATERIA-USER
Materia.hasMany(User, {foreignKey: 'materiaId'});
User.belongsTo(Materia, {foreignKey: 'materiaId'});
//MATERIA-HORARIO
Materia.hasMany(Horario, {foreignKey: 'materiaId'});
Horario.belongsTo(Materia, {foreignKey: 'materiaId'});
//CATEDRA-TABLAINTERMEDIA
User.belongsToMany(Materia, {through: Catedra, foreignKey: 'materiaId', otherKey:'userId'});
Materia.belongsToMany(User, {through: Catedra, foreignKey: 'materiaId', otherKey: 'userId'});

module.exports = {
    User,
    Aula,
    Horario,
    Materia
}
