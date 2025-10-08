const User  = require('./user');
const Aula = require('./aula');
const Horario = require('./horario');
const Materia = require('./materia');
const Catedra = require('./catedra');
const Admin = require('./admin');
//HORARIO-AULA
Aula.hasMany(Horario, {foreignKey: 'aulaId'});
Horario.belongsTo(Aula, {foreignKey: 'aulaId'});

//MATERIA-HORARIO
Materia.hasMany(Horario, {foreignKey: 'materiaId'});
Horario.belongsTo(Materia, {foreignKey: 'materiaId'});
//CATEDRA-TABLAINTERMEDIA
User.belongsToMany(Materia, { through: Catedra, foreignKey: 'userId', otherKey: 'materiaId' });
Materia.belongsToMany(User, { through: Catedra, foreignKey: 'materiaId', otherKey: 'userId' });

// Opcionalmente, si querés poder incluir directamente desde Catedra
Catedra.belongsTo(User, { foreignKey: 'userId' });
Catedra.belongsTo(Materia, { foreignKey: 'materiaId' });

module.exports = {
    User,
    Aula,
    Horario,
    Materia,
    Catedra,
    Admin
}
