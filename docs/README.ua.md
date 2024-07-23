**Читати іншими мовами: [Русский](../README.md), [English](./README.en.md).**

# Аутентифікація / Авторизація користувача через JWT токен.

---

Створення колекції користувачів users. Додавання логіки
аутентифікації/авторизації користувача за допомогою JWT токена. Отримання даних
юзера за токеном. Фільтрація та пагінація контактів. Оновлення підписки
користувача.

---

### 1. Створення схеми та моделі користувача для колекції users.

У коді створюється схема і модель користувача для колекції users.

```js
// models/user.js
{
  password: {
    type: String,
    required: [true, 'Password is required'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
  },
  subscription: {
    type: String,
    enum: ["starter", "pro", "business"],
    default: "starter"
  },
  token: {
    type: String,
    default: null,
  },
}
```

Щоб кожен користувач працював і бачив тільки свої контакти, у схемі контактів
додається властивість `owner`.

```js
// models/contacts.js
owner: {
  type: Schema.Types.ObjectId,
  ref: 'user',
}
```

> Примітка: 'user' - назва колекції (в однині), в якій зберігаються користувачі.

---

### 2. Реєстрація користувача.

Створюється ендпоінт `/api/auth/signup`.

Для цього в папці **routes** створюється файл _`auth.js`_, який відповідатиме за
всі маршрути, пов'язані з реєстрацією, авторизацією та розлогінюванням.
Створюється й експортується рутер. Додається, поки без валідації та контролера
ендпоінт реєстрації користувача.

```js
// routes/auth.js
const { Router } = require('express');

const router = Router();

router.post('/signup');

module.exports = router;
```

Рутер імпортується у файл _`app.js`_.

```js
// app.js
...
const contactsRouter = require('./routes/contacts');
const authRouter = require('./routes/auth');
...
app.use('/api/contacts', contactsRouter);
app.use('/api/auth', authRouter);
```

У файл _`user.js`_, що в папці **models**, додається та експортується
Joi-валідація необхідних полів під час реєстрації (`name`, `email` та
`password`).

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

У проєкт встановлюємо бібліотеку [bcrypt](https://www.npmjs.com/package/bcrypt)
для засолювання пароля користувача перед записом у базу даних. У папці
**controllers** створюється папка **auth** з файлом _`signup.js`_. У файлі
створюється контролер-функція `signUp()` для створення користувача за даними,
які пройшли валідацію.

- Якщо користувач із таким `email` уже зареєстрований, то повертається http
  помилка `409 Conflict` із текстом `'User with this email already exists'`.
- Якщо успішно - статус `201 Created` і користувача
  `{ name: newUser.name, email: newUser.email, }`

У файл _`auth.js`_, що в папці **routes**, додаються валідація і контролер.

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

### 3. Авторизація (Логін).

Створюється ендпоінт `/api/auth/signin`.

У файл _`user.js`_, що в папці **models**, додається та експортується
Joi-валідація необхідних полів під час авторизації (`email` та `password`).

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

Створюється файл _`signin.js`_ у папці **controllers/auth**. У файлі створюється
контролер-функція `signIn()` для перевірки та авторизації наявного користувача
за даними, що пройшли валідацію (`email` і `password`).

- Якщо `email` не існує в базі даних, то викидається помилка зі статусом `401` і
  повідомленням `Invalid email or password`.
- Якщо `email` існує в базі даних, але `password` не збігається, то викидається
  помилка зі статусом `401` і повідомленням `Invalid email or password`.
- Якщо успішно - згенерувати і повернути токен `{ token: generated token }` зі
  статусом `200`

Для генерації токена використовується бібліотека
[jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken).

Щоб згенерувати токен у файл _`.env`_ додається секретний ключ (SECRET_KEY). Він
може бути довільним або згенерований за допомогою сайту (наприклад
[randomkeygen](https://randomkeygen.com/)).

Далі в контролер авторизації - `signIn()`-функцію імпортується jwt бібліотека,
SECRET_KEY з `process.env`. Створюється `payload` необхідний для генерації jwt
токена.

Створюється токен з `payload`, `SECRET_KEY` і об'єкта налаштувань, в якому
вказується час життя токена.

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

### 4. Перевірка / Аутентифікація токена.
