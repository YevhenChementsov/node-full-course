**Читать на других языках: [Русский](README.md),
[Українська](README.ua.md), [English](README.en.md).**

# Написание REST API для работы с коллекцией контактов. Работа с Express.js.
---
Для работы с REST API используется [Postman](https://www.getpostman.com/).

---
### 1. Создание проекта. Установка зависимостей.
Инициализируется проект с помощью команды `yarn init`.
Устанавливаются ***cors***, ***express***, ***joi***, ***morgan***, ***nanoid*** с помощью команды `yarn add cors express joi morgan nanoid` как зависимость (dependencies), ***nodemon*** с помощью команды `yarn add nodemon --dev` как зависимость разработки (devDependencies). Обязательно добавляется *.gitignore* файл в который добавляется папка **node_modules/**.
Добавляем скрипты в *package.json* файл (команду dev можно заменить любой другой удобной командой).
```json
"scripts": {
    "start": "node ./app.js",
    "dev": "nodemon ./app.js"
  },
```
> Подробнее о пакетах: [cors](https://www.npmjs.com/package/cors), [express](https://www.npmjs.com/package/express), [joi](https://www.npmjs.com/package/joi), [morgan](https://www.npmjs.com/package/morgan), [nanoid](https://www.npmjs.com/package/nanoid)  и [nodemon](https://www.npmjs.com/package/nodemon).

С помощью команды `yarn` устанавливаются все зависимости, перечисленные в файле *package.json*, в локальную созданную папку **node_modules**.

---
### 2. Добавление contacts.json(database) и функций для работы с коллекцией контактов.

Копируется папка [db](https://github.com/YevhenChementsov/node-full-course/tree/cli/db) из ветки `cli` с файлом *`contacts.json`* в корень проекта.
Создается файл *`contactsServices.js`* в папке **services** в корне проекта и копируются все функции из файла [contacts.js](https://github.com/YevhenChementsov/node-full-course/blob/cli/contacts.js) ветки `cli`.

---
### 3.