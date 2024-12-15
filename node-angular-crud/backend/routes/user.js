const express = require('express');
const router = express.Router();
const User = require('../models/user');

// Middleware para tratamento de erros centralizado
function handleError(err, res) {
    if (err.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).send({ error: 'Email já está em uso.' });
    }
    return res.status(400).send({ error: err.message });
}

// Rota para criação de um novo usuário
router.post('/', async (req, res) => {
    try {
        // Verifica se os dados estão completos
        const { name, email } = req.body;
        if (!name || !email) {
            return res.status(400).send({ error: 'Nome e email são obrigatórios.' });
        }

        const user = await User.create(req.body);
        res.status(201).send(user);
    } catch (error) {
        handleError(error, res);
    }
});

// Rota para obter todos os usuários
router.get('/', async (req, res) => {
    try {
        const users = await User.findAll();
        res.send(users);
    } catch (error) {
        res.status(500).send({ error: 'Erro ao buscar usuários.' });
    }
});

// Rota para atualizar um usuário
router.put('/:id', async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).send({ error: 'Usuário não encontrado' });
        }

        // Valida que os dados enviados não estão vazios
        const { name, email } = req.body;
        if (!name || !email) {
            return res.status(400).send({ error: 'Nome e email são obrigatórios.' });
        }

        await user.update(req.body);
        res.send(user);
    } catch (error) {
        handleError(error, res);
    }
});

// Rota para deletar um usuário
router.delete('/:id', async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).send({ error: 'Usuário não encontrado' });
        }

        await user.destroy();
        res.status(204).send(); // No Content
    } catch (error) {
        res.status(500).send({ error: 'Erro ao deletar usuário.' });
    }
});

module.exports = router;
