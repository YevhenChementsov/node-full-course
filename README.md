**Читать на других языках: [Українська](./docs/README.ua.md),
[English](./docs/README.en.md).**

# Аутентификация / Авторизация пользователя через JWT токен.

---

Создание коллекции пользователей users. Добавление логики
аутентификации/авторизации пользователя с помощью JWT токена. Получение данных
юзера по токену. Фильтрация и пагинация контактов. Обновление подписки
пользователя. Логаут.

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
  required: true,
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

### 4. Проверка / Аутентификация токена.

Создается мидлвара _`authenticate.js`_ в папке **middlewares** для проверки
токена и добавляется ко всем маршрутам контактов, которые должны быть защищены.

- Мидлвар берет токен из заголовков `Authorization`, проверяет токен на
  валидность

```js
// authenticate.js
const { authorization = '' } = req.headers;
const [bearer, token] = authorization.split(' ');
```

- Если токен не валидный, выбрасывает ошибку со статусом `401` и сообщением
  `'Unauthorized'`

```js
// authenticate.js
if (bearer !== 'Bearer') {
  next(HttpError(401));
}
```

- Если валидация прошла успешно, получить из токена `id` пользователя. Найти
  пользователя в базе данных по этому `id`

```js
// authenticate.js
const { id } = jwt.verify(token, SECRET_KEY);
const user = await User.findById(id);
```

- Если пользователя с таким `id` не существует или токены не совпадают, вернуть
  ошибку со статусом `401` и сообщением `'Unauthorized'`

```js
// authenticate.js
if (!user) {
  next(HttpError(401, 'User not found.'));
}
```

- Если пользователь существует и токен совпадает с тем, что находится в базе,
  записать его данные в `req.user` и вызвать метод `next()`

```js
// authenticate.js
req.user = user;
next();
```

После того как данные пользователя записаны, при добавлении контакта, с
`req.user` берется `id` пользователя и добавляется к запросу. После этого все
добавленные контакты будут приписываться в базе данных только к залогиненому
пользователю `_id: owner`.

```js
// controllers/contacts/add.js
const { _id: owner } = req.user;
const result = await Contact.create({ ...req.body, owner });
```

Тоже самое делается и с запросом всех контактов.

```js
// controllers/contacts/getAll.js
const { _id: owner } = req.user;
const result = await Contact.find({ owner });
```

Теперь пользователь будет получать только свои контакты. Чтобы при запросе в
поле `owner` записывало не `id`, а например имя и почту пользователя, который
делает запрос, после запроса добавляется `populate()`.

```js
// controllers/contacts/getAll.js
const result = await Contact.find({ owner }).populate('owner', 'name email');
```

Мидлвар _`authenticate`_ добавляется ко всем CRUD-запросам рута _`contacts.js`_.

### 5. Пагинация для коллекции контактов @ GET /contacts?page=1&limit=20.

Для получения параметров поиска из строки запроса используется `req.query`. В
функции-контроллере _`getAll.js`_ что в папке **controllers/contacts/** из
объекта `req.query` берутся `page` и `limit`. По умолчанию параметр `page`
ставится `1`, а параметр `limit` - `10`.

```js
// controllers/contacts/getAll.js
const { page = 1, limit = 10 } = req.query;
```

В методе `find()` при запросе третьим аргументом прописываются встроенные в
mongoose дополнительные настройки (`skip` и `limit`). `skip` высчитывается по
формуле `(page - 1) * limit`. В результате возвращается:

```js
// controllers/contacts/getAll.js
const result = await Contact.find({ owner }, '', {
  skip,
  limit,
}).populate('owner', 'name email');

res.json(result);
```

### 6. Текущий пользователь - получение данных юзера по токену.

Создается эндпоинт `/api/users/current`.

- Создается рут `@ GET /current` в файле _`users.js`_, в папке **routes**. Также
  импортируется _`authenticate`_ из папки **middlewares** и _`ctrlWrapper`_ из
  папки **helpers**. В файле _`app.js`_ создается _`usersRouter`_. Для нового
  рута создается контроллер
- Мидлвар _`authenticate`_ проверяет токен авторизированного пользователя
- Если пользователь не найден, токен не правильный или его время истекло -
  выбрасывается ошибка со статусом `401` и сообщением `'Unauthorized'`
- Если все хорошо, функция-контроллер возвращает статус `200` и объект с именем
  пользователя и его подпиской

```js
// controllers/users/getCurrentUser.js
const getCurrentUser = async (req, res) => {
  const { name, subscription } = req.user;

  res.json({
    name,
    subscription,
  });
};
```

### 7. Фильтрация контактов по полю избранного @ GET /contacts?favorite=true

Для того, чтобы отфильтровать контакты в функции-контроллере _`getAll.js`_ что в
папке **controllers/contacts/** из объекта `req.query` кроме `page` и `limit`
еще берется `favorite` и делается проверка с помощью оператора `if(){}`.

```js
// controllers/contacts/getAll.js
...
const { page = 1, limit = 10, favorite } = req.query;
...
const getFavorite = { owner };
if (favorite) {
  getFavorite.favorite = favorite === 'true';
}
const result = await Contact.find(getFavorite, '', {
  skip,
  limit,
}).populate('owner', 'name email');
```

### 8. Обновление подписки (subscription) пользователя через эндпоинт @ PATCH /users.

Чтобы добавить возможность обновления подписки пользователя через эндпоинт @
PATCH /users, нужно создать маршрут, который будет обрабатывать запрос на
обновление поля subscription в модели пользователя. Также нужно добавить
валидацию, чтобы убедиться, что значение subscription является одним из
допустимых значений: ['starter', 'pro', 'business'].

- Обновляется ваш файл маршрутов _`users.js`_ в папке **routes** для добавления
  нового маршрута `@ PATCH /users`

```js
// routes/users.js
router.patch('/:id/subscription', authenticate, isValidId);
```

- Создается контроллер для обработки обновления подписки. Затем он добавляется в
  _`users.js`_

```js
// controllers/users/updateSubscription.js
router.patch(
  '/:id/subscription',
  authenticate,
  isValidId,
  ctrlWrapper(ctrl.updateSubscription),
);
```

- Добавляется валидация для значения `subscription` с помощью `Joi` в модель
  пользователя

```js
// models/user.js
const updateUserSubscriptionSchema = Joi.object({
  subscription: Joi.string()
    .valid('starter', 'pro', 'business')
    .required()
    .messages({
      'any.only': 'Subscription must be one of: starter, pro or business',
      'string.empty': 'Subscription cannot be an empty field',
      'any.required': 'Subscription is a required field',
    }),
});
```

- Валидация добавляется в _`users.js`_

```js
// controllers/users/updateSubscription.js
router.patch(
  '/:id/subscription',
  authenticate,
  isValidId,
  validateBody(schemas.updateUserSubscriptionSchema),
  ctrlWrapper(ctrl.updateSubscription),
);
```

### 9. Логаут.
