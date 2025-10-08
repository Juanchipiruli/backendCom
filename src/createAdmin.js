const bcrypt = require('bcrypt');
const {Admin} = require('./models');
const sequelize = require('./config/database');

async function createAdmin() {
    try{
        await sequelize.authenticate();
        await sequelize.sync();

        const username = 'admin';
        const password = 'admin123'

        const hashedPassword = await bcrypt.hash(password, 10);

        const [admin, created] = await Admin.findOrCreate({
            where: {username},
            defaults: {
                username: username,
                password: hashedPassword
            }
        })
        if (created) {
            console.log('Usuario admin creado exitosamente:');
        } else {
            console.log('El usuario admin ya existe:');
        }
        console.log({
            username: admin.username,
            password: password // Solo para referencia, no mostrar en producción
        });

        process.exit(0);
    }catch (error) {
        console.error('Error creando usuario admin:', error);
        process.exit(1);
    }
}

createAdmin();