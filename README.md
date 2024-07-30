**Читать на других языках: [Українська](./docs/README.ua.md),
[English](./docs/README.en.md).**

# Аутентификация / Авторизация пользователя через JWT токен.

---

Создание коллекции пользователей 'users'. Добавление аутентификации/авторизации
пользователя с помощью JWT токена. Разлогинивание пользователя. Получение данных
текущего пользователя по токену. Пагинация контактов. Фильтрация контактов по
полю 'favorite'. Обновление подписки пользователя ('starter', 'pro',
'business').

---

### 1. Создание схемы и модели пользователя для коллекции users.

1.1. В коде создается схема и модель пользователя для коллекции
[users](./models/user.js).

```js
// models/user.js
{
  name: {
    type: String,
    minlength: "your number",
    maxlength: "your number",
    required: [true, 'Name is required'],
  },
  password: {
    type: String,
    minlength: [
      "your number",
      'The value is shorter than the minimum allowed length ({MINLENGTH}).',
    ],
    required: [true, 'Password is required'],
  },
  email: {
    type: String,
    match: "any regular expression for email"
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

1.2. Чтобы каждый пользователь работал и видел только свои контакты в схеме
контактов добавляется свойство `owner`.

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

2.1. Создается эндпоинт [`/api/auth/signup`](#запрос-на-регистрацию).

2.2. Делается валидация всех обязательных полей (`name`, `email`, `password`).
При ошибке валидации возвращает
[Bad Request](#ошибка-валидации-при-регистрации).

2.3. В случае успешной валидации в модели `User` создается пользователь по
данным которые прошли валидацию. Для засолки пароля пользователя перед записью в
базу данных используется [bcrypt](https://www.npmjs.com/package/bcrypt) или
[bcrypt.js](https://www.npmjs.com/package/bcryptjs).

- Если пользователь с таким `email` уже зарегистрирован, то возвращает
  [Conflict](#ошибка-конфликт-при-регистрации).
- Если все хорошо - [Created](#ответ-успешной-регистрации).

##### Запрос на регистрацию

```js
@POST /api/auth/signup
Content-Type: application/json
RequestBody: {
  "name":"example name",
  "email": "example@example.com",
  "password": "example password"
}
```

##### Ошибка валидации при регистрации

```js
Status: 400 Bad Request
Content-Type: application/json
ResponseBody: <Ошибка от Joi или другой библиотеки валидации>
```

##### Ошибка-конфликт при регистрации

```js
Status: 409 Conflict
Content-Type: application/json
ResponseBody: {
  "message": "User with this email already exists"
}
```

##### Ответ успешной регистрации

```js
Status: 201 Created
Content-Type: application/json
ResponseBody: {
  "user": {
    "name":"example name",
    "email": "example@example.com",
    "subscription": "starter"
  }
}
```

---

### 3. Авторизация (Логин).

3.1. Создается эндпоинт [`/api/auth/signin`](#запрос-на-вход).

3.2. Делается валидация всех обязательных полей (`email` и `password`). При
ошибке валидации вернуть [Bad Request](#ошибка-валидации-логина).

3.3. В модели `User` найти зарегистрированного пользователя по `email`.

- Если пользователь с таким `email` отсутствует в базе данных, то возвращает
  [Unauthorized](#ошибка-авторизации-логина).
- Если пользователь с таким `email` есть, сравнивается захешированный пароль из
  базы данных с введенным.
- Если пароли не совпадают, то возвращает
  [Unauthorized](#ошибка-авторизации-логина).
- Если пароли совпадают, то создается `token` с помощью библиотеки
  [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken), сохраняется в
  текущем пользователе и возвращается [Ok](#ответ-об-успешном-входе).

##### Запрос на вход

```js
@POST /api/auth/signin
Content-Type: application/json
RequestBody: {
  "email": "example@example.com",
  "password": "example password"
}
```

##### Ошибка валидации логина

```js
Status: 400 Bad Request
Content-Type: application/json
ResponseBody: <Ошибка от Joi или другой библиотеки  валидации>
```

##### Ошибка авторизации логина

```js
Status: 401 Unauthorized
ResponseBody: {
  "message": "Email or password is wrong"
}
```

##### Ответ об успешном входе

```js
Status: 200 OK
Content-Type: application/json
ResponseBody: {
  "token": "example token"
  "user": {
    "name":"example name",
    "subscription": "starter"
  },
}
```

---

### 4. Проверка / Аутентификация токена.

4.1. Создается мидлвар [authenticate](./middlewares/authenticate.js) для
проверки токена и добавляется ко всем маршрутам контактов, которые должны быть
защищены.

- Мидлвар берет токен из заголовков `Authorization` и проверяет токен на
  валидность.
- Если токен не валидный, то возвращает
  [Unauthorized](#мидлвар-ошибка-авторизации).
- Если валидация прошла успешно, получить из токена `id` пользователя. Найти
  пользователя в базе данных по этому `id`.
- Если пользователя с таким `id` не существует или токены не совпадают, то
  возвращает [Unauthorized](#мидлвар-ошибка-авторизации).
- Если пользователь существует и токен совпадает с тем, что находится в базе,
  записать его данные в `req.user` и вызвать метод `next()`.

##### Мидлвар-ошибка авторизации

```js
Status: 401 Unauthorized
Content-Type: application/json
ResponseBody: {
  "message": "Unauthorized"
}
```

---

### 5. Логаут.

5.1. Создается эндпоинт [`/api/auth/signout`](#запрос-на-выход-из-системы).

5.2. Добавляется в маршрут [authenticate](./middlewares/authenticate.js) для
проверки токена / аутентификации.

5.3. В модели `User` найти пользователя по `_id`.

- Если пользователя не существует, то вернуть
  [Unauthorized](#ошибка-неавторизованного-выхода-из-системы).
- Если пользователь найден, то поле `token` текущего пользователя делается
  `null` и возвращается [No Content](#ответ-на-успешный-выход-из-системы).

##### Запрос на выход из системы

```js
@GET /api/auth/signout
Authorization: 'Bearer {{token}}';
```

##### Ошибка неавторизованного выхода из системы

```js
Status: 401 Unauthorized
Content-Type: application/json
ResponseBody: {
  "message": "Unauthorized"
}
```

##### Ответ на успешный выход из системы

```js
Status: 204 No Content
```

---

### 6. Текущий пользователь - получение данных пользователя по токену.

6.1. Создается эндпоинт [`/api/users/current`](#запрос-текущего-пользователя).

6.2. Добавляется в маршрут [authenticate](./middlewares/authenticate.js) для
проверки токена / аутентификации.

- Если пользователь не найден, токен не правильный или его время истекло -
  возвращает [Unauthorized](#ошибка-авторизации-текущего-пользователя).
- Если пользователь найден, то возвращает
  [Ok](#успешный-ответ-по-текущему-пользователю).

##### Запрос текущего пользователя

```js
@GET /api/users/current
Authorization: "Bearer {{token}}"
```

##### Ошибка авторизации текущего пользователя

```js
Status: 401 Unauthorized
Content-Type: application/json
ResponseBody: {
  "message": "Unauthorized"
}
```

##### Успешный ответ по текущему пользователю

```js
Status: 200 OK
Content-Type: application/json
ResponseBody: {
  "name": "example name",
  "subscription": "starter"
}
```

---

## Дополнительное задание

---

### 7. Пагинация для коллекции контактов @GET /api/contacts?page=1&limit=10.

7.1. Для того, чтобы сделать пагинацию при запросе на вывод всех контактов
пользователя нужно отредактировать функцию-контроллер
[getAll](./controllers/contacts/getAll.js). Для получения параметров поиска из
строки запроса используется `req.query`.

```js
// controllers/contacts/getAll.js
const { page = 1, limit = 10 } = req.query;
```

7.2. В методе `find()` при запросе третьим аргументом прописываются встроенные в
mongoose дополнительные настройки (`skip` и `limit`). `skip` высчитывается по
формуле `(page - 1) * limit`.

---

### 8. Фильтрация контактов по полю избранного @GET /api/contacts?favorite=true.

8.1. Для того, чтобы отфильтровать контакты, оставив те, где `favorite=true` в
функции-контроллере [getAll](./controllers/contacts/getAll.js) из `req.query`
кроме `page` и `limit` еще берется `favorite`.

8.2. Делается проверка, есть ли в контакте поле `favorite` со значением `true`.

---

### 9. Обновление подписки (subscription) пользователя через эндпоинт @PATCH /api/users/:id/subscription.

9.1. Создается эндпоинт [`/api/users/:id/subscription`](#запрос-подписки).

9.2. Делается валидация поля `subscription`, чтобы убедиться, что значение
`subscription` является одним из допустимых значений: ['starter', 'pro',
'business']. При ошибке валидации вернуть
[Bad Request](#ошибка-валидации-подписки).

9.3. В модели `User` найти зарегистрированного пользователя по `_id`.

- Если пользователь с таким `_id` отсутствует в базе данных, то возвращает
  [Not Found](#пользователь-подписки-не-найден).
- Если все хорошо - возвращает
  [обновленный объект контакта](#ответ-об-успешной-смене-подписки).

##### Запрос подписки

```js
@PATCH /api/users/:id/subscription
Content-Type: application/json
RequestBody: {
  "subscription": "one of: starter, pro or business"
}
```

##### Ошибка валидации подписки

```js
Status: 400 Bad Request
Content-Type: application/json
ResponseBody: <Ошибка от Joi или другой библиотеки  валидации>
```

##### Пользователь подписки не найден

```js
Status: 404 Not Found
Content-Type: application/json
ResponseBody: {
  "message": "User not found"
}
```

##### Ответ об успешной смене подписки

```js
Status: 200 OK
Content-Type: application/json
ResponseBody: {
  user
}
```
