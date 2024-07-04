**Читати іншими мовами: [Русский](../README.md), [English](./README.en.md).**

# Express.js.

---

Написання REST API для роботи з колекцією контактів, імітуючи базу даних. Робота
з Express.js. Створення функції-декоратора та функцій-хелперів. Робота з пакетом
для валідації - `Joi`. Для роботи з REST API використовується
[Postman](https://www.getpostman.com/).

---

### 1. Створення проєкту. Встановлення залежностей.

Ініціалізується проєкт за допомогою команди `yarn init`. Встановлюються
**_cors_**, **_express_**, **_joi_**, **_morgan_**, **_nanoid_** за допомогою
команди `yarn add cors express cors express joi morgan nanoid@3.3.4` як
залежність (dependencies), **_nodemon_** за допомогою команди
`yarn add nodemon --dev` як залежність розробки (devDependencies). Обов'язково
додається _.gitignore_ файл, до якого додається папка **node_modules/**. Додаємо
скрипти в _package.json_ файл (команду dev можна замінити будь-якою іншою
зручною командою).

```json
"scripts": {
    "start": "node ./app.js",
    "dev": "nodemon ./app.js"
  },
```

> Детальніше про пакети: [cors](https://www.npmjs.com/package/cors),
> [express](https://www.npmjs.com/package/express),
> [joi](https://www.npmjs.com/package/joi),
> [morgan](https://www.npmjs.com/package/morgan),
> [nanoid](https://www.npmjs.com/package/nanoid) і
> [nodemon](https://www.npmjs.com/package/nodemon).

За допомогою команди `yarn` встановлюються всі залежності, перелічені у файлі
_package.json_, у локальну створену папку **node_modules**.

---

### 2. Додавання contacts.json(database) і функцій для роботи з колекцією контактів.

Копіюється папка
[db](https://github.com/YevhenChementsov/node-full-course/tree/cli/db) з гілки
`cli` з файлом _`contacts.json`_ у корінь проекту. Створюється файл
_`contactsServices.js`_ у папці **services** у корені проєкту і копіюються всі
функції з файлу
[contacts.js](https://github.com/YevhenChementsov/node-full-course/blob/cli/contacts.js)
гілки `cli`.

---

### 3. Створення веб-сервера на Express.js з рутами.

Створюється основний файл _`app.js`_ - веб сервер на express. Додаються прошарки
**_morgan_** і **_cors_**. Створюється папка **controllers** з файлом
_`contactsControllers.js`_, в якій пишуться контролери. Також у корені проєкту
створюється папка **routes** із файлом _`contactsRouter.js`_ з налаштуваннями
рутингу для роботи з колекцією контактів.

REST API має підтримувати такі рути:

<details>
<summary>@ GET /api/contacts</summary>

- Нічого не отримує
- Викликає функцію-сервіс `getListOfContacts` для роботи з json-файлом
  _`contacts.json`_
- Повертає масив усіх контактів у json-форматі зі статусом `200`

</details>

<details>
<summary>@ GET /api/contacts/:id</summary>

- Не отримує `data`
- Отримує параметр `id`
- Викликає функцію-сервіс `getContactById` для роботи з json-файлом
  _`contacts.json`_
- Якщо такий `id` є, повертає об'єкт контакту в json-форматі зі статусом `200`
- Якщо такого `id` немає, повертає json з ключем `"message": "Not found"` і
  статусом `404`

</details>

<details>
<summary>@ POST /api/contacts</summary>

- Отримує `data` у форматі `{name, email, phone}` (усі поля обов'язкові)
- Якщо в `data` немає якихось обов'язкових полів, повертає json із ключем
  `{"message": "Missing required name field"}` і статусом `400`
- Якщо з `data` все добре, додає унікальний ідентифікатор в об'єкт контакту
- Викликає функцію-сервіс `addContact(data)` для збереження контакту у файлі
  _`contacts.json`_
- За результатом роботи функції повертає об'єкт із доданим контактом
  `{id, name, email, phone}` і статусом `201`

</details>

<details>
<summary>@ PUT /api/contacts/:id</summary>

- Отримує параметр `id`
- Отримує `data` в json-форматі з оновленням будь-яких полів `name`, `email` і
  `phone`
- Якщо `data` немає, повертає json із ключем `{"message": "Missing fields"}` і
  статусом `400`
- Якщо з `data` все добре, викликає функцію-сервіс `updateContactById(id, data)`
  для оновлення контакту у файлі _`contacts.json`_
- За результатом роботи функції повертає оновлений об'єкт контакту зі статусом
  `200`. В іншому випадку, повертає json із ключем `"message": "Not found"` і
  статусом `404`

</details>

<details>
<summary>@ DELETE /api/contacts/:id</summary>

- не отримує `data`
- отримує параметр `id`
- викликає функцію-сервіс `getContactById` для роботи з json-файлом
  _`contacts.json`_
- якщо такий `id` є, повертає об'єкт контакту в json-форматі зі статусом `200`
- якщо такого `id` немає, повертає json з ключем `"message": "Not found"` і
  статусом `404`

</details>

---

### 4. Написання валідації.

Для маршрутів, які приймають дані (`@ POST` і `@ PUT`), пишеться перевірка
(валідація) прийнятих даних. Для валідації прийнятих даних використовується
пакет **_joi_**.

> Валідацію `body` можна як здійснювати в контролері, так і створити для цих
> цілей окрему міддлвару, яка буде викликатися до контролера.

Для створення міддлвари валідації `body` - пишеться функція _`validateBody.js`_
у папці **helpers**, а схема для валідації у файлі _`contactsSchema`_ (у папці
**schemas**).
