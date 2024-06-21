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
### 3. Создание веб-сервера на Express.js с рутами.

Создается основной файл *`app.js`* - веб сервер на express. Добавляются прослойки ***morgan*** и ***cors***.
Создается папка **controllers** с файлом *`contactsControllers.js`* в которой пишутся контроллеры. Также, в корне проекта создается папка **routes** с файлом *`contactsRouter.js`* с настройками рутинга для работы с коллекцией контактов.

REST API должен поддерживать следующие руты:

<details>
<summary>@ GET /api/contacts</summary>

- Ничего не получает
- Вызывает функцию-сервис `getListOfContacts` для работы с json-файлом *`contacts.json`*
- Возвращает массив всех контактов в json-формате со статусом `200`

</details>

<details>
<summary>@ GET /api/contacts/:id</summary>

- Не получает `body`
- Получает параметр `id`
- Вызывает функцию-сервис `getContactById` для работы с json-файлом *`contacts.json`*
- Если такой `id` есть, возвращает объект контакта в json-формате со статусом `200`
- Если такого `id` нет, возвращает json с ключом `"message": "Not found"` и статусом `404`

</details>

<details>
<summary>@ POST /api/contacts</summary>

- Получает `body` в формате `{name, email, phone}` (все поля обязательны)
- Если в `body` нет каких-то обязательных полей, возвращает json с ключом `{"message": "Missing required name field"}` и статусом `400`
- Если с `body` все хорошо, добавляет уникальный идентификатор в объект контакта
- Вызывает функцию-сервис `addContact(body)` для сохранения контакта в файле *`contacts.json`*
- По результату работы функции возвращает объект с добавленным `{id, name, email, phone}` и статусом `201`

</details>

<details>
<summary>@ PUT /api/contacts/:id</summary>

- Получает параметр `id`
- Получает `body` в json-формате c обновлением любых полей `name`, `email` и `phone`
- Если `body` нет, возвращает json с ключом `{"message": "Missing fields"}` и статусом `400`
- Если с `body` все хорошо, вызывает функцию-сервис `updateContactById(id, body)`  для обновления контакта в файле *`contacts.json`*
- По результату работы функции возвращает обновленный объект контакта со статусом `200`. В противном случае, возвращает json с ключом `"message": "Not found"` и статусом `404`

</details>

<details>
<summary>@ DELETE /api/contacts/:id</summary>

- не получает `body`
- получает параметр `id`
- вызывает функцию-сервис `getContactById` для работы с json-файлом *`contacts.json`*
- если такой `id` есть, возвращает объект контакта в json-формате со статусом `200`
- если такого `id` нет, возвращает json с ключом `"message": "Not found"` и статусом `404`

</details>

---
### 4.