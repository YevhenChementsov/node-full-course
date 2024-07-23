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

Створюється мідлвара _`authenticate.js`_ у папці **middlewares** для перевірки
токена і додається до всіх маршрутів контактів, які мають бути захищені.

- Мідлвар бере токен із заголовків `Authorization`, перевіряє токен на
  валідність

```js
// authenticate.js
const { authorization = '' } = req.headers;
const [bearer, token] = authorization.split(' ');
```

- Якщо токен не валідний, викидає помилку зі статусом `401` і повідомленням
  `'Unauthorized'`

```js
// authenticate.js
if (bearer !== 'Bearer') {
  next(HttpError(401));
}
```

- Якщо валідація пройшла успішно, отримати з токена `id` користувача. Знайти
  користувача в базі даних за цим `id`

```js
// authenticate.js
const { id } = jwt.verify(token, SECRET_KEY);
const user = await User.findById(id);
```

- Якщо користувача з таким `id` не існує або токени не збігаються, повернути
  помилку зі статусом `401` і повідомленням `'Unauthorized'`

```js
// authenticate.js
if (!user) {
  next(HttpError(401, 'User not found.'));
}
```

- Якщо користувач існує і токен збігається з тим, що знаходиться в базі,
  записати його дані в `req.user` і викликати метод `next()`

```js
// authenticate.js
req.user = user;
next();
```

Після того як дані користувача записані, при додаванні контакту, з `req.user`
береться `id` користувача і додається до запиту. Після цього всі додані контакти
будуть приписуватися в базі даних тільки до залогіненого користувачеві
`_id: owner`.

```js
// controllers/contacts/add.js
const { _id: owner } = req.user;
const result = await Contact.create({ ...req.body, owner });
```

Теж саме робиться і з запитом усіх контактів.

```js
// controllers/contacts/getAll.js
const { _id: owner } = req.user;
const result = await Contact.find({ owner });
```

Тепер користувач отримуватиме тільки свої контакти. Щоб під час запиту в поле
`owner` записувало не `id`, а, наприклад, ім'я та пошту користувача, який робить
запит, після запиту додається `populate()`.

```js
// controllers/contacts/getAll.js
const result = await Contact.find({ owner }).populate('owner', 'name email');
```

Мідлвар _`authenticate`_ додається до всіх CRUD-запитів рута _`contacts.js`_.

### 5. Пагінація.

Для отримання параметрів пошуку з рядка запиту використовується `req.query`. У
функції-контролері _`getAll.js`_, що в папці **controllers/contacts/**, з
об'єкта `req.query` беруться `page` і `limit`. За замовчуванням параметр `page`
ставиться `1`, а параметр `limit` - `10`.

```js
// controllers/contacts/getAll.js
const { page = 1, limit = 10 } = req.query;
```

У методі `find()` під час запиту третім аргументом прописуються вбудовані в
mongoose додаткові налаштування (`skip` і `limit`). `skip` вираховується за
формулою `(page - 1) * limit`. У результаті повертається:

```js
// controllers/contacts/getAll.js
const result = await Contact.find({ owner }, '', {
  skip,
  limit,
}).populate('owner', 'name email');

res.json(result);
```
