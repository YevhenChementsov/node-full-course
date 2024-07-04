**Читать на других языках: [Українська](./docs/README.ua.md),
[English](./docs/README.en.md).**

# Express.js.

---

Написание REST API для работы с коллекцией контактов, имитируя базу данных.
Работа с Express.js. Создание функции-декоратора и функций-хелперов. Работа с
пакетом для валидации - `Joi`. Для работы с REST API используется
[Postman](https://www.getpostman.com/).

---

### 1. Создание проекта. Установка зависимостей.

Инициализируется проект с помощью команды `yarn init`. Устанавливаются
**_cors_**, **_express_**, **_joi_**, **_morgan_**, **_nanoid_** с помощью
команды `yarn add cors express joi morgan nanoid@3.3.4` как зависимость
(dependencies), **_nodemon_** с помощью команды `yarn add nodemon --dev` как
зависимость разработки (devDependencies). Обязательно добавляется _.gitignore_
файл в который добавляется папка **node_modules/**. Добавляем скрипты в
_package.json_ файл (команду dev можно заменить любой другой удобной командой).

```json
"scripts": {
    "start": "node ./app.js",
    "dev": "nodemon ./app.js"
  },
```

> Подробнее о пакетах: [cors](https://www.npmjs.com/package/cors),
> [express](https://www.npmjs.com/package/express),
> [joi](https://www.npmjs.com/package/joi),
> [morgan](https://www.npmjs.com/package/morgan),
> [nanoid](https://www.npmjs.com/package/nanoid) и
> [nodemon](https://www.npmjs.com/package/nodemon).

С помощью команды `yarn` устанавливаются все зависимости, перечисленные в файле
_package.json_, в локальную созданную папку **node_modules**.

---

### 2. Добавление contacts.json(database) и функций для работы с коллекцией контактов.

Копируется папка
[db](https://github.com/YevhenChementsov/node-full-course/tree/cli/db) из ветки
`cli` с файлом _`contacts.json`_ в корень проекта. Создается файл
_`contactsServices.js`_ в папке **services** в корне проекта и копируются все
функции из файла
[contacts.js](https://github.com/YevhenChementsov/node-full-course/blob/cli/contacts.js)
ветки `cli`.

---

### 3. Создание веб-сервера на Express.js с рутами.

Создается основной файл _`app.js`_ - веб сервер на express. Добавляются
прослойки **_morgan_** и **_cors_**. Создается папка **controllers** с файлом
_`contactsControllers.js`_ в которой пишутся контроллеры. Также, в корне проекта
создается папка **routes** с файлом _`contactsRouter.js`_ с настройками рутинга
для работы с коллекцией контактов.

REST API должен поддерживать следующие руты:

<details>
<summary>@ GET /api/contacts</summary>

- Ничего не получает
- Вызывает функцию-сервис `getListOfContacts` для работы с json-файлом
  _`contacts.json`_
- Возвращает массив всех контактов в json-формате со статусом `200`

</details>

<details>
<summary>@ GET /api/contacts/:id</summary>

- Не получает `data`
- Получает параметр `id`
- Вызывает функцию-сервис `getContactById` для работы с json-файлом
  _`contacts.json`_
- Если такой `id` есть, возвращает объект контакта в json-формате со статусом
  `200`
- Если такого `id` нет, возвращает json с ключом `"message": "Not found"` и
  статусом `404`

</details>

<details>
<summary>@ POST /api/contacts</summary>

- Получает `data` в формате `{name, email, phone}` (все поля обязательны)
- Если в `data` нет каких-то обязательных полей, возвращает json с ключом
  `{"message": "Missing required name field"}` и статусом `400`
- Если с `data` все хорошо, добавляет уникальный идентификатор в объект контакта
- Вызывает функцию-сервис `addContact(data)` для сохранения контакта в файле
  _`contacts.json`_
- По результату работы функции возвращает объект с добавленным
  `{id, name, email, phone}` и статусом `201`

</details>

<details>
<summary>@ PUT /api/contacts/:id</summary>

- Получает параметр `id`
- Получает `data` в json-формате c обновлением любых полей `name`, `email` и
  `phone`
- Если `data` нет, возвращает json с ключом `{"message": "Missing fields"}` и
  статусом `400`
- Если с `data` все хорошо, вызывает функцию-сервис
  `updateContactById(id, data)` для обновления контакта в файле
  _`contacts.json`_
- По результату работы функции возвращает обновленный объект контакта со
  статусом `200`. В противном случае, возвращает json с ключом
  `"message": "Not found"` и статусом `404`

</details>

<details>
<summary>@ DELETE /api/contacts/:id</summary>

- не получает `data`
- получает параметр `id`
- вызывает функцию-сервис `getContactById` для работы с json-файлом
  _`contacts.json`_
- если такой `id` есть, возвращает объект контакта в json-формате со статусом
  `200`
- если такого `id` нет, возвращает json с ключом `"message": "Not found"` и
  статусом `404`

</details>

---

### 4. Написание валидации.

Для маршрутов, которые принимают данные (`@ POST` и `@ PUT`), пишется проверка
(валидация) принимаемых данных. Для валидации принимаемых данных используется
пакет **_joi_**.

> Валидацию `body` можно как осуществлять в контроллере, так и создать для этих
> целей отдельную миддлвару, которая будет вызываться к контроллеру.

Для создания миддлвары валидации `body` - пишется функция _`validateBody.js`_ в
папке **helpers**, а схема для валидации в файле _`contactsSchema`_(в папке
**schemas**).
