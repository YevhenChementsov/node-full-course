**Читать на других языках: [Українська](./docs/README.ua.md),
[English](./docs/README.en.md).**

# Аутентификация / Авторизация пользователя через JWT токен.

---

Создание коллекции пользователей users. Добавление логики
аутентификации/авторизации пользователя с помощью JWT токена. Получение данных
юзера по токену. Фильтрация и пагинация контактов. Обновление подписки
пользователя.

---

### 1. Создание схемы и модели пользователя для коллекции users.

В коде создается схема и модель пользователя для коллекции users.

```js
// models/user.js
{
  name: {
    type: String,
    minlength: 3,
    maxlength: 30,
  },
  password: {
    type: String,
    minlength: [
      6,
      'The value is shorter than the minimum allowed length ({MINLENGTH}).',
    ],
    required: [true, 'Password is required'],
  },
  email: {
    type: String,
    match: regexp.emailRegExp,
    required: [true, 'Email is required'],
    unique: true,
  },
  subscription: {
    type: String,
    enum: ['starter', 'pro', 'business'],
    default: 'starter',
  },
  token: {
    type: String,
    default: null,
  },
},
{ versionKey: false, timestamps: true },
```

Чтобы каждый пользователь работал и видел только свои контакты в схеме контактов
добавляется свойство `owner`.

```js
// models/contacts.js
owner: {
  type: Schema.Types.ObjectId,
  ref: 'user',
}
```

> Примечание: 'user' - название коллекции (в единственном числе), в которой
> хранятся пользователи.

---

### 2. Регистрация пользователя.

Создается эндпоинт `/api/auth/signup`.

Для этого в папке **routes** создается файл _`auth.js`_, который будет отвечать
за все маршруты, связанные с регистрацией, авторизацией и разлогиниванием.
Создается и экспортируется рутер. Добавляется, пока без валидации и контроллера
эндпоинт регистрации пользователя.

```js
// routes/auth.js
const { Router } = require('express');

const router = Router();

router.post('/signup');

module.exports = router;
```

Рутер импортируется в файл _`app.js`_.

```js
// app.js
...
const contactsRouter = require('./routes/contacts');
const authRouter = require('./routes/auth');
...
app.use('/api/contacts', contactsRouter);
app.use('/api/auth', authRouter);
```

В файл _`user.js`_ что в папке **models** добавляется и экспортируется
Joi-валидация необходимых полей при регистрации (`name`, `email` и `password`).

```js
// models/user.js
...
const signUpSchema = Joi.object({
  name: Joi.string()
    .pattern(regexp.nameRegExp)
    .min(3)
    .max(30)
    .required()
    .messages({
      'string.base': 'Name should be a string',
      'string.pattern.base': 'Name should be a string',
      'string.empty': 'Name cannot be an empty field',
      'string.min': 'Name should have a minimum of {#limit} letters',
      'string.max': 'Name should have a maximum of {#limit} letters',
      'any.required': 'Name is a required field',
    }),
  email: Joi.string().pattern(regexp.emailRegExp).required().messages({
    'string.email': 'Please enter a valid email address',
    'string.empty': 'Email cannot be an empty field',
    'any.required': 'Email is a required field',
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Password should have a minimum of {#limit} symbols',
    'string.empty': 'Password cannot be an empty field',
    'any.required': 'Password is a required field',
  }),
});

const schemas = {
  signUpSchema,
};

module.exports = {
  User,
  schemas,
};
```

В проект устанавливаем библиотеку [bcrypt](https://www.npmjs.com/package/bcrypt)
для засолки пароля пользователя перед записью в базу данных. В папке
**controllers** создается папка **auth** с файлом _`signup.js`_. В файле
создается контроллер-функция `signUp()` для создания пользователя по данным,
которые прошли валидацию.

- Если пользователь с таким `email` уже зарегистрирован, то возвращается http
  ошибка `409 Conflict` с текстом `'User with this email already exists'`
- Если успешно - статус `201 Created` и пользователя
  `{ name: newUser.name, email: newUser.email, }`

В файл _`auth.js`_, что в папке **routes**, добавляются валидация и контроллер.

```js
// routes/auth.js
...
const { auth: ctrl } = require('../controllers');
const { ctrlWrapper } = require('../helpers');
const { validateBody } = require('../middlewares');
const { schemas } = require('../models/user');
...
router.post('/signup', validateBody(schemas.signUpSchema), ctrlWrapper(ctrl.signUp));
```

---

### 3. Авторизация (Логин).

Создается эндпоинт `/api/auth/signin`.

В файл _`user.js`_ что в папке **models** добавляется и экспортируется
Joi-валидация необходимых полей при авторизации (`email` и `password`).

```js
// models/user.js
...
const signInSchema = Joi.object({
  email: Joi.string().pattern(regexp.emailRegExp).required().messages({
    'string.email': 'Please enter a valid email address',
    'string.empty': 'Email cannot be an empty field',
    'any.required': 'Email is a required field',
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Password should have a minimum of {#limit} symbols',
    'string.empty': 'Password cannot be an empty field',
    'any.required': 'Password is a required field',
  }),
});

const schemas = {
  signUpSchema,
  signInSchema,
};

module.exports = {
  User,
  schemas,
};
```

Создается файл _`signin.js`_ в папке **controllers/auth**. В файле создается
контроллер-функция `signIn()` для проверки и авторизации существующего
пользователя по данным, которые прошли валидацию (`email` и `password`).

- Если `email` не существует в базе данных, то выбрасывается ошибка со статусом
  `401` и сообщением `'Invalid email or password'`
- Если `email` существует в базе данных, но `password` не совпадает, то
  выбрасывается ошибка со статусом `401` и сообщением
  `'Invalid email or password'`
- Если успешно - сгенерировать и вернуть токен `{ token: generated token }` со
  статусом `200`

Для генерации токена используется библиотека
[jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken).

Чтобы сгенерировать токен в файл _`.env`_ добавляется секретный ключ
(SECRET_KEY). Он может быть произвольным или сгенерирован с помощью сайта
(например [randomkeygen](https://randomkeygen.com/)).

Далее в контроллер авторизации - `signIn()`-функцию импортируется jwt
библиотека, SECRET_KEY из `process.env`. Создается `payload` необходимый для
генерации jwt токена.

Создается токен из `payload`, `SECRET_KEY` и объекта настроек, в котором
указывается время жизни токена.

```js
// signin.js
...
const jwt = require('jsonwebtoken');

const { SECRET_KEY } = process.env;
...
const payload = {
  id: user._id,
}
const token = jwt.sign(payload, SECRET_KEY, { expiresIn: '1h' });
```

### 4. Проверка токена.
