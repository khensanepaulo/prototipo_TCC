const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../database');

// Função para validar se o valor é uma string
const isString = (value, fieldName) => {
    if (typeof value !== 'string') {
        throw new Error(`${fieldName} must be a valid string`);
    }
};

const User = sequelize.define('User', {
    name: {
        type: DataTypes.STRING,
        allowNull: false, // Não permite nulos
        validate: {
            isString(value) {
                isString(value, 'Name'); // Reutilizando a validação
            }
        },
        set(value) {
            this.setDataValue('name', value.trim()); // Remove espaços extras
        }
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false, // Não permite nulos
        unique: true, // Garante que o email seja único
        validate: {
            isEmail: {
                msg: "Email must be a valid format",
            },
            isString(value) {
                isString(value, 'Email'); // Reutilizando a validação
            }
        },
        set(value) {
            this.setDataValue('email', value.toLowerCase().trim()); // Normaliza o email
        }
    }
}, {
    // Configurações do modelo
    tableName: 'Users',
    timestamps: true, // Adiciona createdAt e updatedAt
});

module.exports = User;
