const request = require('supertest');
const app = require('../server');
const sequelize = require('../database'); // Importar o sequelize para limpar o banco de dados após os testes

describe('User CRUD API', () => {
    let userId;

    beforeAll(async () => {
        await sequelize.sync({ force: true }); // Limpa o banco de dados antes dos testes
    });

    // Teste para criar um novo usuário
    it('should create a new user', async () => {
        const response = await request(app)
            .post('/api/users')
            .send({ name: 'João', email: 'joao@email.com' });

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('id');
        userId = response.body.id;
    });

    // Teste para criar um usuário com dados inválidos (sem nome)
    it('should return 400 for missing name', async () => {
        const response = await request(app)
            .post('/api/users')
            .send({ email: 'no_name@email.com' });

        expect(response.status).toBe(400);
    });

    // Teste para criar um usuário com dados inválidos (sem email)
    it('should return 400 for missing email', async () => {
        const response = await request(app)
            .post('/api/users')
            .send({ name: 'No Email' });

        expect(response.status).toBe(400);
    });

    // Teste para criar um usuário com email duplicado
    it('should return 409 for duplicate email', async () => {
        await request(app)
            .post('/api/users')
            .send({ name: 'Another João', email: 'joao@email.com' });

        const response = await request(app)
            .post('/api/users')
            .send({ name: 'Duplicate João', email: 'joao@email.com' });

        expect(response.status).toBe(409);
    });

    // Teste para atualizar um usuário que não existe
    it('should return 404 for updating a non-existent user', async () => {
        const response = await request(app)
            .put('/api/users/99999') // ID que não existe
            .send({ name: 'Non-existent User' });

        expect(response.status).toBe(404);
    });

    // Teste para excluir um usuário que não existe
    it('should return 404 for deleting a non-existent user', async () => {
        const response = await request(app)
            .delete('/api/users/99999'); // ID que não existe

        expect(response.status).toBe(404);
    });

    // Teste para ler um usuário que não existe
    it('should return 404 for getting a non-existent user', async () => {
        const response = await request(app)
            .get('/api/users/99999'); // ID que não existe

        expect(response.status).toBe(404);
    });

    // Teste para garantir que o email é único
    it('should return 400 if email is not unique', async () => {
        await request(app)
            .post('/api/users')
            .send({ name: 'Unique User', email: 'unique@email.com' });

        const response = await request(app)
            .post('/api/users')
            .send({ name: 'Duplicate Email User', email: 'unique@email.com' });

        expect(response.status).toBe(409);
    });

    // Teste para garantir que o campo `name` é uma string
    it('should return 400 if name is not a string', async () => {
        const response = await request(app)
            .post('/api/users')
            .send({ name: 123, email: 'test@email.com' });

        expect(response.status).toBe(400);
    });

    // Teste para garantir que o campo `email` é uma string
    it('should return 400 if email is not a string', async () => {
        const response = await request(app)
            .post('/api/users')
            .send({ name: 'Test User', email: 123 });

        expect(response.status).toBe(400);
    });

    // Teste para garantir que o sistema retorna erro ao tentar atualizar um usuário com dados inválidos
    it('should return 400 for invalid update data', async () => {
        const response = await request(app)
            .put(`/api/users/${userId}`)
            .send({ name: '', email: 'invalid' }); // Dados inválidos

        expect(response.status).toBe(400);
    });

    // Teste para garantir que o sistema retorna todos os usuários criados
    it('should return all users', async () => {
        const response = await request(app)
            .get('/api/users');

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBeGreaterThan(0);
    });

    // Teste para garantir que a atualização retorna o usuário atualizado
    it('should return updated user', async () => {
        const response = await request(app)
            .put(`/api/users/${userId}`)
            .send({ name: 'João Atualizado', email: 'joaoatualizado@email.com' });

        expect(response.status).toBe(200);
        expect(response.body.name).toBe('João Atualizado');
    });

    // Teste para garantir a criação de múltiplos usuários
    it('should create multiple users', async () => {
        const users = [
            { name: 'User 1', email: 'user1@email.com' },
            { name: 'User 2', email: 'user2@email.com' }
        ];

        for (const user of users) {
            const response = await request(app)
                .post('/api/users')
                .send(user);

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('id');
        }
    });

    // Teste para garantir que a resposta contém o formato esperado
    it('should return users in the expected format', async () => {
        const response = await request(app)
            .get('/api/users');

        expect(response.status).toBe(200);
        expect(response.body[0]).toHaveProperty('id');
        expect(response.body[0]).toHaveProperty('name');
        expect(response.body[0]).toHaveProperty('email');
    });

    // Teste para garantir que os campos createdAt e updatedAt são retornados
    it('should return createdAt and updatedAt fields', async () => {
        const response = await request(app)
            .get('/api/users');

        expect(response.status).toBe(200);
        expect(response.body[0]).toHaveProperty('createdAt');
        expect(response.body[0]).toHaveProperty('updatedAt');
    });

    // Teste para garantir que a API não permite a criação de usuários sem dados
    it('should return 400 for missing data', async () => {
        const response = await request(app)
            .post('/api/users')
            .send({}); // Enviando um objeto vazio

        expect(response.status).toBe(400);
    });

    // Teste para garantir que a API retorna 200 ao acessar a rota base
    it('should return 200 when accessing the base route', async () => {
        const response = await request(app)
            .get('/api/users');

        expect(response.status).toBe(200);
    });

    afterAll(async () => {
        await sequelize.close(); // Fechar a conexão com o banco de dados
    });
});
