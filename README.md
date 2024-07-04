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

### 3. Создание проекта. Установка зависимостей.

Копируются все файлы и папки с ветки
[rest-api-express](https://github.com/YevhenChementsov/node-full-course/tree/rest-api-express).
С помощью команды `yarn remove nanoid` удаляется пакет **nanoid**. Командой
`yarn add cross-env dotenv mongoose` устанавливаются необходимые пакеты для
работы.

> Подробнее о пакетах: [cross-env](https://www.npmjs.com/package/cross-env),
> [dotenv](https://www.npmjs.com/package/dotenv),
> [mongoose](https://www.npmjs.com/package/mongoose).

Меняются скрипты в _package.json_ файле.

```json
"scripts": {
    "start": "cross-env NODE_ENV=production node ./server.js",
    "dev": "cross-env NODE_ENV=development nodemon ./server.js"
  },
```
