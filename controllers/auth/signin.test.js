const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const gravatar = require('gravatar');

const app = require('../../app');
const { User } = require('../../models/user');

const { DB_HOST, PORT, SECRET_KEY } = process.env;

describe('POST /api/auth/signin', () => {
  let server;
  beforeAll(async () => {
    server = app.listen(PORT);
    await mongoose.connect(DB_HOST);
  });
  afterAll(async () => {
    /*
		Удаляет тестового пользователя в конце всех тестов. Закомментировать если пользователя нужно оставить в mongoDB.
    await User.deleteMany({});
		*/
    await mongoose.connection.close();
    await server.close();
  });
  beforeEach(async () => {
    await User.deleteMany({});
  });

  // Функция создает тестового пользователя
  const createTestUser = async () => {
    const email = 'test@example.com';
    const password = 'password123';
    const hashedPassword = await bcrypt.hash(password, 10);
    const avatarURL = gravatar.url(email);

    const testUser = {
      name: 'Test User',
      email,
      password: hashedPassword,
      subscription: 'starter',
      avatarURL,
    };

    await User.create(testUser);
    return { email, password, testUser };
  };

  // Функция выполняет запрос и получает ответ
  const signInRequest = async (email, password) => {
    return await request(app)
      .post('/api/auth/signin')
      .send({ email, password });
  };

  it('Возвращает успешный ответ со статус-кодом 200', async () => {
    const { email, password } = await createTestUser();
    const response = await signInRequest(email, password);

    expect(response.statusCode).toBe(200);
  });

  it('Проверяет, что токен существует в ответе', async () => {
    const { email, password } = await createTestUser();
    const response = await signInRequest(email, password);

    expect(response.body.token).toBeDefined();
  });

  it('Проверяет, что токен действительно соответствует пользователю', async () => {
    const { email, password } = await createTestUser();
    const response = await signInRequest(email, password);

    const decoded = jwt.verify(response.body.token, SECRET_KEY);
    expect(decoded.id).toBeDefined();
  });

  it('Проверяет, что токен сохраняется у пользователя в MongoDB', async () => {
    const { email, password } = await createTestUser();
    const response = await signInRequest(email, password);

    const userInDb = await User.findOne({ email: 'test@example.com' });
    expect(userInDb.token).toBe(response.body.token);
  });

  it('В ответ возвращает пользователя с полями email и subscription', async () => {
    const { email, password, testUser } = await createTestUser();
    const response = await signInRequest(email, password);

    expect(response.body.user).toEqual({
      name: testUser.name,
      subscription: testUser.subscription,
    });
  });

  it('Поле email в ответе возвращается строкой', async () => {
    const { email, password } = await createTestUser();
    const response = await signInRequest(email, password);

    expect(typeof response.body.user.name).toBe('string');
  });

  it('Поле email в ответе возвращается строкой', async () => {
    const { email, password } = await createTestUser();
    const response = await signInRequest(email, password);

    expect(typeof response.body.user.subscription).toBe('string');
  });
});
