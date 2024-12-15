const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('prototipo', 'root', 'root', {
    host: 'localhost',
    dialect: 'mysql',
    dialectOptions: {
        charset: 'utf8mb4',  // Apenas o charset é necessário
    },
});

module.exports = sequelize;
