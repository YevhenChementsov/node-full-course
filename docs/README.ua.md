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
