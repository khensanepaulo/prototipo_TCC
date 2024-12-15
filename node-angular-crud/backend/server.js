const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const sequelize = require('./database');
// require('dotenv').config(); // Carrega variáveis de ambiente do arquivo .env

const app = express();
app.use(bodyParser.json());
app.use(cors());

// Autenticação e conexão com o banco de dados
async function initializeDatabaseConnection() {
    try {
        await sequelize.authenticate();
        console.log('Conexão com o banco de dados bem-sucedida');
        await sequelize.sync({ force: false }); // Sincroniza os modelos com o banco, sem forçar mudanças
    } catch (err) {
        console.error('Erro ao conectar com o banco de dados:', err);
        process.exit(1); // Encerra o processo em caso de falha crítica
    }
}

// Middleware de erro global
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send({ error: 'Algo deu errado!' });
});

// Rotas
const userRoutes = require('./routes/user');
app.use('/api/users', userRoutes);

// Exporta a aplicação
module.exports = app;

// Inicia o servidor se o arquivo for executado diretamente
if (require.main === module) {
    const port = process.env.PORT || 3000; // Usa a variável de ambiente ou porta 3000
    initializeDatabaseConnection().then(() => {
        app.listen(port, (err) => {
            if (err) {
                console.error('Erro ao iniciar o servidor:', err);
            } else {
                console.log(`Servidor rodando na porta ${port}`);
            }
        });
    });
}
