**Читать на других языках: [Українська](./docs/README.ua.md),
[English](./docs/README.en.md).**

# MongoDB и Mongoose.

---

Создание MongoDB базы, установка MongoDB Compass для работы с базой, подключение
к базе с помощью Mongoose. Создание mongoose схемы и модели.

---

### 1. Создание аккаунта на MongoDB Atlas.

Создается аккаунт на **_[MongoDB Atlas](https://www.mongodb.com/)_**. После
этого создается новый проект и настраивается **бесплатный кластер**. Во время
настройки кластера выбирается регион и провайдер наиболее близкий к вашему
месторасположению. Если выбрать слишком отдаленный от вас регион, скорость
ответа сервера будет намного дольше. Далее, в MongoDB Atlas создается
пользователь с правами администратора.

---

### 2. Установка и подключение графического редактора MongoDB Compass.

Устанавливается графический редактор
**_[MongoDB Compass](https://www.mongodb.com/products/tools/compass)_** для
удобной работы с базой данных для MongoDB. Настраивается подключение облачной
базы данных к Compass.

![first step](./docs/images/1_step.jpg)

![second step](./docs/images/2_step.jpg)

![third step](./docs/images/3_step.jpg)

Скопированная строка вставляется в MongoDB Compass url. В строке слово
`<password>` заменяется на пароль от MongoDB.

Через Compass создается база данных _`db-contacts`_ и в ней коллекция
_`contacts`_.

---

### 3. Подключение к MongoDB с помощью Mongoose.

Копируются все файлы и папки с ветки
[rest-api-express](https://github.com/YevhenChementsov/node-full-course/tree/rest-api-express)
и заменяется хранение контактов из json-файла на созданную базу данных. С
помощью команды `yarn remove nanoid` удаляется пакет **nanoid**. Командой
`yarn add cross-env dotenv mongoose` устанавливаются необходимые пакеты для
работы.

> Подробнее о пакетах: [cross-env](https://www.npmjs.com/package/cross-env),
> [dotenv](https://www.npmjs.com/package/dotenv),
> [mongoose](https://www.npmjs.com/package/mongoose).

Меняются скрипты в _`package.json`_ файле.

```json
"scripts": {
    "start": "cross-env NODE_ENV=production node ./server.js",
    "dev": "cross-env NODE_ENV=development nodemon ./server.js"
  },
```

Удаляются папки **db** и **services** со всем содержимым.

В файле _`server.js`_ создается подключение к MongoDB при помощи Mongoose.

- При успешном подключении выводится в консоль сообщение
  `"Database connection successful"`
- При ошибке выводится в консоль сообщение ошибки и завершается процесс с
  помощью process.exit(1)

```js
// server.js
const mongoose = require('mongoose');

const app = require('./app');

const { DB_HOST, PORT = 3000 } = process.env;

mongoose.set('strictQuery', true);

mongoose
  .connect(DB_HOST)
  .then(() => {
    console.log('Database connection successful');
    app.listen(PORT, () => {
      console.log(`Server running. Use our API on port: ${PORT}`);
    });
  })
  .catch(error => {
    console.log(error.message);
    process.exit(1);
  });
```

В переменную окружения _`DB_HOST`_ в файле _`.env`_ вставляется скопированная
строка с MongoDB:

![fourth step](./docs/images/4_step.jpg) ![fifth step](./docs/images/5_step.jpg)

Перед знаком вопроса в скопированной строке прописывается название базы данных
_`db-contacts`_

```js
DB_HOST =
  'mongodb+srv://*********:<your password from mongodb>@cluster0.*******.mongodb.net/db-contacts?retryWrites=true&w=majority&appName=Cluster0';
```

> Важно! Внимательно проверить точное название базы данных, так как mongoose при
> подключении не покажет ошибку если название базы данных введено неверно.

В файл _`.env.example`_ добавляется имя переменной _`DB_HOST`_ чтобы знать какая
переменная окружения используется - `DB_HOST=`. В _`app.js`_ добавляется импорт
`require('dotenv').config();` для работы с .env файлом и переменными окружения.

---

### 4. Создание схемы модели контактов.

Создается файл _`contact.js`_ в папке **models** в котором будет храниться схема
и модель коллекции контактов. Для этого импортируется с mongoose схема и модель:

```js
// contact.js
const { Schema, model } = require('mongoose');
```

Создается схема модели для коллекции contacts:

```js
// contact.js
const contactSchema = new Schema(
  {
    name: {
      type: String,
      match: nameRegExp,
      required: [true, 'Name is a required field'],
    },
    email: {
      type: String,
      required: [true, 'Email is a required field'],
    },
    phone: {
      type: String,
      match: phoneRegExp,
      required: [true, 'Phone is a required field'],
    },
    favorite: {
      type: Boolean,
      default: false,
    },
  },
  { versionKey: false, timestamps: true },
);
```

Методы mongoose выбрасывают ошибку без статуса и поэтому он по умолчанию
ставится `500` (когда доходит до _`app.js`_). Исправляется отображение статуса с
помощью функции-хелпера _`handleMongooseError`_, которая создается в папке
**helpers**.

```js
// helpers/handleMongooseError.js
const handleMongooseError = (error, data, next) => {
  error.status = 400;
  next();
};

module.exports = handleMongooseError;
```

Далее импортируется функция _`handleMongooseError`_, создается модель и экспорт
коллекции contacts:

```js
// contact.js
const { handleMongooseError } = require('../helpers');

...

contactSchema.post('save', handleMongooseError);

const Contact = model('contact', contactSchema);

module.exports = Contact;
```

> Важно! Первый аргумент модели должно быть имя существительное в единственном
> числе.

---

### 5. Переписывание функций обработки запросов - controllers.

В функциях обработки запросов заменяется код CRUD-операций над контактами из
файла, на Mongoose-методы для работы с коллекцией контактов в базе данных. Для
этого импортируется модель **_Contact_**
`const { Contact } = require('../../models/contact');` и заменяются на методы
модели:

- `find()` - находит все контакты
- `findById()` - находит контакт по `id`
- create() - создает новый контакт
- findByIdAndUpdate() - полностью перезаписывает контакт по `id`
- findByIdAndDelete() - удаляет контакт по `id`

---

### 6. Добавление нового маршрута @ PATCH /api/contacts/:id/favorite

В контактах появляется дополнительное поле статуса _favorite_, которое принимает
логическое значение true или false. Оно отвечает за то, что в избранном или нет
находится указанный контакт. Реализуется для обновления статуса контакта новый
рут:

<details>
<summary>@ PATCH /api/contacts/:id/favorite</summary>

- Получает параметр `id`
- Получает `body` в json-формате c обновлением поля `favorite`
- Если `body` нет, возвращает json с ключом {"message": "missing field
  favorite"} и статусом `400`
- Если с `body` все хорошо, вызывает функцию
  _`updateFavorite(id, body, { new: true })`_ (добавляется к
  /controllers/contacts) для обновления контакта в базе. Третьим аргументом
  передается объект `{ new: true }`, чтобы возвращался обновленный контакт.
- По результату работы функция возвращает обновленный объект контакта со
  статусом `200`. В противном случае, возвращает json с ключом
  `"message": "Not found"` и статусом `404`

</details>

---

### 7. Валидация для @ PATCH

Так как patch обновляет одно поле, для него отдельно пишется валидация. Для
удобства, mongoose-валидацию и joi-валидацию лучше хранить в одном файле.
Поэтому содержимое файла _`contactsSchema.js`_ из папки **schemas** переносится
в файл _`contact.js`_, который находится в папке **models**,
_`contactsSchema.js`_ и папка **schemas** удаляются.

```js
// contact.js
const Joi = require('joi');
//* Regular expression for name
const nameRegExp = /^[a-zA-Zа-яА-Я]+(([' -][a-zA-Zа-яА-Я ])?[a-zA-Zа-яА-Я]*)*$/;
//* Regular expression for phone
const phoneRegExp =
  /^\+?\d{0,4}?[-.\s]?\(?\d{1,3}?\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}$/;
//* Joi validation
const addSchema = Joi.object({
  name: Joi.string().pattern(nameRegExp).min(3).max(30).required().messages({
    'string.base': 'Name should be a string',
    'string.pattern.base': 'Name should be a string',
    'string.empty': 'Name cannot be an empty field',
    'string.min': 'Name should have a minimum of {#limit} letters',
    'string.max': 'Name should have a maximum of {#limit} letters',
    'any.required': 'Name is a required field',
  }),
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      'string.email': 'Please enter a valid email address',
      'string.empty': 'Email cannot be an empty field',
      'any.required': 'Email is a required field',
    }),
  phone: Joi.string().pattern(phoneRegExp).required().messages({
    'string.pattern.base': 'Phone number must be in the format (012) 345-67-89',
    'string.empty': 'Phone number cannot be an empty field',
    'any.required': 'Phone number is a required field',
  }),
  favorite: Joi.bool(),
});

const updateFavoriteSchema = Joi.object({
  favorite: Joi.bool().required(),
});

const schemas = {
  addSchema,
  updateFavoriteSchema,
};

module.exports = {
  Contact,
  schemas,
};
```
