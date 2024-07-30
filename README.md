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
    minlength: 3,
    maxlength: 30,
    required: [true, 'Name is required'],
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

2.1. Создается эндпоинт [`/api/auth/signup`](#registration-request).

2.2. Делается валидация всех обязательных полей (`name`, `email`, `password`).
При ошибке валидации возвращает [Bad Request](#registration-validation-error).

2.3. В случае успешной валидации в модели `User` создается пользователь по
данным которые прошли валидацию. Для засолки пароля пользователя перед записью в
базу данных используется [bcrypt](https://www.npmjs.com/package/bcrypt) или
[bcrypt.js](https://www.npmjs.com/package/bcryptjs).

- Если пользователь с таким `email` уже зарегистрирован, то возвращает
  [Conflict](#registration-conflict-error)
- Если все хорошо - [Created](#registration-success-response).

##### Registration request

```js
@POST /api/auth/signup
Content-Type: application/json
RequestBody: {
  "name":"example name",
  "email": "example@example.com",
  "password": "example password"
}
```

##### Registration validation error

```js
Status: 400 Bad Request
Content-Type: application/json
ResponseBody: <Ошибка от Joi или другой библиотеки валидации>
```

##### Registration conflict error

```js
Status: 409 Conflict
Content-Type: application/json
ResponseBody: {
  "message": "User with this email already exists"
}
```

##### Registration success response

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

3.1. Создается эндпоинт [`/api/auth/signin`](#login-request).

3.2. Делается валидация всех обязательных полей (`email` и `password`). При
ошибке валидации вернуть [Bad Request](#login-validation-error).

3.3. В модели `User` найти зарегистрированного пользователя по `email`.

- Если пользователь с таким `email` отсутствует в базе данных, то возвращает
  [Unauthorized](#login-auth-error).
- Если пользователь с таким `email` есть, сравнивается захешированный пароль из
  базы данных с введенным.
- Если пароли не совпадают, то возвращает [Unauthorized](#login-auth-error).
- Если пароли совпадают, то создается `token` с помощью библиотеки
  [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken), сохраняется в
  текущем пользователе и возвращается [Ok](#login-success-response).

##### Login request

```js
@POST /api/auth/signin
Content-Type: application/json
RequestBody: {
  "email": "example@example.com",
  "password": "examplepassword"
}
```

##### Login validation error

```js
Status: 400 Bad Request
Content-Type: application/json
ResponseBody: <Ошибка от Joi или другой библиотеки  валидации>
```

##### Login auth error

```js
Status: 401 Unauthorized
ResponseBody: {
  "message": "Email or password is wrong"
}
```

##### Login success response

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
  [Unauthorized](#middleware-unauthorized-error).
- Если валидация прошла успешно, получить из токена `id` пользователя. Найти
  пользователя в базе данных по этому `id`.
- Если пользователя с таким `id` не существует или токены не совпадают, то
  возвращает [Unauthorized](#middleware-unauthorized-error).
- Если пользователь существует и токен совпадает с тем, что находится в базе,
  записать его данные в `req.user` и вызвать метод `next()`.

##### Middleware unauthorized error

```js
Status: 401 Unauthorized
Content-Type: application/json
ResponseBody: {
  "message": "Unauthorized"
}
```

---

### 5. Логаут.

5.1. Создается эндпоинт [`/api/auth/signout`](#logout-request).

5.2. Добавляется в маршрут [authenticate](./middlewares/authenticate.js) для
проверки токена / аутентификации.

5.3. В модели `User` найти пользователя по `_id`.

- Если пользователя не существует, то вернуть
  [Unauthorized](#logout-unauthorized-error).
- Если пользователь найден, то поле `token` текущего пользователя делается
  `null` и возвращается [No Content](#logout-success-response).

##### Logout request

```js
@GET /api/auth/signout
Authorization: 'Bearer {{token}}';
```

##### Logout unauthorized error

```js
Status: 401 Unauthorized
Content-Type: application/json
ResponseBody: {
  "message": "Unauthorized"
}
```

##### Logout success response

```js
Status: 204 No Content
```

---

### 6. Текущий пользователь - получение данных пользователя по токену.

6.1. Создается эндпоинт [`/api/users/current`](#current-user-request).

6.2. Добавляется в маршрут [authenticate](./middlewares/authenticate.js) для
проверки токена / аутентификации.

- Если пользователь не найден, токен не правильный или его время истекло -
  возвращает [Unauthorized](#current-user-unauthorized-error).
- Если пользователь найден, то возвращает [Ok](#current-user-success-response).

##### Current user request

```js
@GET /api/users/current
Authorization: "Bearer {{token}}"
```

##### Current user unauthorized error

```js
Status: 401 Unauthorized
Content-Type: application/json
ResponseBody: {
  "message": "Unauthorized"
}
```

##### Current user success response

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

9.1. Создается эндпоинт [`/api/users/:id/subscription`](#subscription-request).

9.2. Делается валидация поля `subscription`, чтобы убедиться, что значение
`subscription` является одним из допустимых значений: ['starter', 'pro',
'business']. При ошибке валидации вернуть
[Bad Request](#subscription-validation-error).

9.3. В модели `User` найти зарегистрированного пользователя по `_id`.

- Если пользователь с таким `_id` отсутствует в базе данных, то возвращает
  [Not Found](#subscription-id-not-found).
- Если все хорошо - возвращает
  [обновленный объект контакта](#subscription-success-response).

##### Subscription request

```js
@PATCH /api/users/:id/subscription
Content-Type: application/json
RequestBody: {
  "subscription": "one of: starter, pro or business"
}
```

##### Subscription validation error

```js
Status: 400 Bad Request
Content-Type: application/json
ResponseBody: <Ошибка от Joi или другой библиотеки  валидации>
```

##### Subscription id not found

```js
Status: 404 Not Found
Content-Type: application/json
ResponseBody: {
  "message": "User not found"
}
```

##### Subscription success response

```js
Status: 200 OK
Content-Type: application/json
ResponseBody: {
  user
}
```
