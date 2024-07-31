**Читати іншими мовами: [Русский](../README.md), [English](./README.en.md).**

# Аутентифікація / Авторизація користувача через JWT токен.

---

Створення колекції користувачів 'users'. Додавання аутентифікації/авторизації
користувача за допомогою JWT токена. Розлогінювання користувача. Отримання даних
поточного користувача за токеном. Пагінація контактів. Фільтрація контактів за
полем 'favorite'. Оновлення підписки користувача ('starter', 'pro', 'business').

---

### 1. Створення схеми та моделі користувача для колекції users.

1.1. У коді створюється схема і модель користувача для колекції
[users](../models/user.js).

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

1.2. Щоб кожен користувач працював і бачив тільки свої контакти в схемі
контактів додається властивість `owner`.

```js
// models/contacts.js
owner: {
  type: Schema.Types.ObjectId,
  ref: 'user',
  required: true,
}
```

> Примітка: 'user' - назва колекції (в однині), в якій зберігаються користувачі.

---

### 2. Реєстрація користувача.

2.1. Створюється ендпоінт [`/api/auth/signup`](#запит-на-реєстрацію).

2.2. Робиться валідація всіх обов'язкових полів (`name`, `email`, `password`). У
разі помилки валідації повертає
[Bad Request](#помилка-валідації-під-час-реєстрації).

2.3. У разі успішної валідації в моделі `User` створюється користувач за даними,
які пройшли валідацію. Для засолювання пароля користувача перед записом у базу
даних використовується [bcrypt](https://www.npmjs.com/package/bcrypt) або
[bcrypt.js](https://www.npmjs.com/package/bcryptjs).

- Якщо користувач із таким `email` уже зареєстрований, то повертає
  [Conflict](#помилка-конфлікт-під-час-реєстрації).
- Якщо все добре - [Created](#відповідь-успішної-реєстрації).

##### Запит на реєстрацію

```js
@POST /api/auth/signup
Content-Type: application/json
RequestBody: {
  "name":"example name",
  "email": "example@example.com",
  "password": "example password"
}
```

##### Помилка валідації під час реєстрації

```js
Status: 400 Bad Request
Content-Type: application/json
ResponseBody: <Ошибка от Joi или другой библиотеки валидации>
```

##### Помилка-конфлікт під час реєстрації

```js
Status: 409 Conflict
Content-Type: application/json
ResponseBody: {
  "message": "User with this email already exists"
}
```

##### Відповідь успішної реєстрації

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

### 3. Авторизація (Логін).

3.1. Створюється ендпоінт [`/api/auth/signin`](#запит-на-вхід).

3.2. Робиться валідація всіх обов'язкових полів (`email` і `password`). У разі
помилки валідації повернути [Bad Request](#помилка-валідації-логіну).

3.3. У моделі `User` знайти зареєстрованого користувача за `email`.

- Якщо користувач із таким `email` відсутній у базі даних, то повертає
  [Unauthorized](#помилка-авторизації-логіну).
- Якщо користувач із таким `email` є, порівнюється захешований пароль із бази
  даних із введеним.
- Якщо паролі не збігаються, то повертає
  [Unauthorized](#помилка-авторизації-логіну).
- Якщо паролі збігаються, то створюється `token` за допомогою бібліотеки
  [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken), зберігається в
  поточному користувачеві і повертається [Ok](#відповідь-про-успішний-вхід).

##### Запит на вхід

```js
@POST /api/auth/signin
Content-Type: application/json
RequestBody: {
  "email": "example@example.com",
  "password": "example password"
}
```

##### Помилка валідації логіну

```js
Status: 400 Bad Request
Content-Type: application/json
ResponseBody: <Ошибка от Joi или другой библиотеки  валидации>
```

##### Помилка авторизації логіну

```js
Status: 401 Unauthorized
ResponseBody: {
  "message": "Email or password is wrong"
}
```

##### Відповідь про успішний вхід

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

### 4. Перевірка / Аутентифікація токена.

4.1. Створюється мідлвар [authenticate](../middlewares/authenticate.js) для
перевірки токена і додається до всіх маршрутів контактів, які повинні бути
захищені.

- Мідлвар бере токен із заголовків `Authorization` і перевіряє токен на
  валідність.
- Якщо токен не валідний, то повертає
  [Unauthorized](#мідлвар-помилка-авторизації).
- Якщо валідація пройшла успішно, отримати з токена `id` користувача. Знайти
  користувача в базі даних за цим `id`.
- Якщо користувача з таким `id` не існує або токени не збігаються, то повертає
  [Unauthorized](#мідлвар-помилка-авторизації).
- Якщо користувач існує і токен збігається з тим, що знаходиться в базі,
  записати його дані в `req.user` і викликати метод `next()`.

##### Мідлвар помилка авторизації

```js
Status: 401 Unauthorized
Content-Type: application/json
ResponseBody: {
  "message": "Unauthorized"
}
```

---

### 5. Логаут.

5.1. Створюється ендпоінт [`/api/auth/signout`](#запит-на-вихід).

5.2. Додається в маршрут [authenticate](../middlewares/authenticate.js) для
перевірки токена / аутентифікації.

5.3. У моделі `User` знайти користувача за `_id`.

- Якщо користувача не існує, то повернути
  [Unauthorized](#помилка-неавторизованого-виходу-з-системи).
- Якщо користувача знайдено, то поле `token` поточного користувача робиться
  `null` і повертається [No Content](#відповідь-про-успішний-вихід-з-системи).

##### Запит на вихід

```js
@GET /api/auth/signout
Authorization: 'Bearer {{token}}';
```

##### Помилка неавторизованого виходу з системи

```js
Status: 401 Unauthorized
Content-Type: application/json
ResponseBody: {
  "message": "Unauthorized"
}
```

##### Відповідь про успішний вихід з системи

```js
Status: 204 No Content
```

---

### 6. Поточний користувач - отримання даних користувача за токеном.

6.1. Створюється ендпоінт [`/api/users/current`](#запит-поточного-користувача).

6.2. Додається в маршрут [authenticate](../middlewares/authenticate.js) для
перевірки токена / аутентифікації.

- Якщо користувач не знайдений, токен не правильний або його час минув -
  повертає [Unauthorized](#помилка-авторизації-поточного-користувача).
- Якщо користувача знайдено, то повертає
  [Ok](#успішна-відповідь-за-поточним-користувачем).

##### Запит поточного користувача

```js
@GET /api/users/current
Authorization: "Bearer {{token}}"
```

##### Помилка авторизації поточного користувача

```js
Status: 401 Unauthorized
Content-Type: application/json
ResponseBody: {
  "message": "Unauthorized"
}
```

##### Успішна відповідь за поточним користувачем

```js
Status: 200 OK
Content-Type: application/json
ResponseBody: {
  "name": "example name",
  "subscription": "starter"
}
```

---

## Додаткове завдання

---

### 7. Пагінація для колекції контактів @GET /api/contacts?page=1&limit=10.

7.1. Для того, щоб зробити пагінацію під час запиту на виведення всіх контактів
користувача, потрібно відредагувати функцію-контролер
[getAll](../controllers/contacts/getAll.js). Для отримання параметрів пошуку з
рядка запиту використовується `req.query`.

```js
// controllers/contacts/getAll.js
const { page = 1, limit = 10 } = req.query;
```

7.2. У методі `find()` під час запиту третім аргументом прописуються вбудовані в
mongoose додаткові налаштування (`skip` і `limit`). `skip` вираховується за
формулою `(page - 1) * limit`.

---

### 8. Фільтрація контактів за полем обраного @GET /api/contacts?favorite=true.

8.1. Для того, щоб відфільтрувати контакти, залишивши ті, де `favorite=true` у
функції-контролері [getAll](../controllers/contacts/getAll.js) з `req.query`
крім `page` і `limit` ще береться `favorite`.

8.2. Робиться перевірка, чи є в контакті поле `favorite` зі значенням `true`.

---

### 9. Оновлення підписки (subscription) користувача через ендпоінт @PATCH /api/users/:id/subscription.

9.1. Створюється ендпоінт [`/api/users/:id/subscription`](#запит-про-підписку).

9.2. Робиться валідація поля ``subscription`, щоб переконатися, що значення
`subscription` є одним із допустимих значень: ['starter', 'pro', 'business']. У
разі помилки валідації повернути [Bad Request](#помилка-валідації-підписки).

9.3. У моделі `User` знайти зареєстрованого користувача за `_id`.

- Якщо користувач із таким `_id` відсутній у базі даних, то повертає
  [Not Found](#користувача-підписки-не-знайдено).
- Якщо все добре - повертає
  [оновлений об'єкт контакту](#відповідь-про-успішну-зміну-підписки).

##### Запит про підписку

```js
@PATCH /api/users/:id/subscription
Content-Type: application/json
RequestBody: {
  "subscription": "one of: starter, pro or business"
}
```

##### Помилка валідації підписки

```js
Status: 400 Bad Request
Content-Type: application/json
ResponseBody: <Ошибка от Joi или другой библиотеки  валидации>
```

##### Користувача підписки не знайдено

```js
Status: 404 Not Found
Content-Type: application/json
ResponseBody: {
  "message": "User not found"
}
```

##### Відповідь про успішну зміну підписки

```js
Status: 200 OK
Content-Type: application/json
ResponseBody: {
  user
}
```
