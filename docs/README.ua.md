**Читати іншими мовами: [Русский](../README.md), [English](./README.en.md).**

# Робота з файлами в Node.js. Створення консольного додатка.
---
Консольний додаток для:
- виведення всіх контактів у вигляді таблиці;
- пошуку контакту за `id`;
- додавання контакту;
- видалення контакту;
- редагування контакту;
---
### 1. Створення проєкту
Ініціалізувати проєкт за допомогою команди `npm init` або `yarn init`. Встановлюються пакети *commander* і *nanoid* за допомогою команди `yarn add commander nanoid@3.3.4` або `npm install commander nanoid@3.3.4`.
> Важливо! Для роботи з CommonJS потрібен nanoid саме версії 3.3.4.

Встановлюється *nodemon* за допомогою команди `yarn add nodemon --dev` або `npm install nodemon --save-dev` як залежність розробки (devDependencies). Обов'язково додається *.gitignore* файл, до якого додається папка **node_modules/**. Додаємо скрипти в *package.json* файл (команду dev можна замінити будь-якою іншою зручною командою).
```json
"scripts": {
    "start": "node index",
    "dev": "nodemon index"
  },
```
> Детальніше про пакети: [commander](https://www.npmjs.com/package/commander), [nanoid](https://www.npmjs.com/package/nanoid) и [nodemon](https://www.npmjs.com/package/nodemon).

За допомогою команди `yarn` або `npm install` встановлюються всі залежності, перелічені у файлі *package.json*, у локальну створену папку **node_modules**.
У корені проєкту створюється папка **db**, у якій створюється файл *contacts.json*. Це буде імітація бази даних. У *contacts.json* копіюються і вставляються такі дані:
```json
[
  {
    "id": "AeHIrLTr6JkxGE6SN-0Rw",
    "name": "Allen Raymond",
    "email": "nulla.ante@vestibul.co.uk",
    "phone": "(992) 914-3792"
  },
  {
    "id": "qdggE76Jtbfd9eWJHrssH",
    "name": "Chaim Lewis",
    "email": "dui.in@egetlacus.ca",
    "phone": "(294) 840-6685"
  },
  {
    "id": "drsAJ4SHPYqZeG-83QTVW",
    "name": "Kennedy Lane",
    "email": "mattis.Cras@nonenimMauris.net",
    "phone": "(542) 451-7038"
  },
  {
    "id": "vza2RIzNGIwutCVCs4mCL",
    "name": "Wylie Pope",
    "email": "est@utquamvel.net",
    "phone": "(692) 802-2949"
  },
  {
    "id": "05olLMgyVQdWRwgKfg5J6",
    "name": "Cyrus Jackson",
    "email": "nibh@semsempererat.com",
    "phone": "(501) 472-5218"
  },
  {
    "id": "1DEXoP8AuCGYc1YgoQ6hw",
    "name": "Abbot Franks",
    "email": "scelerisque@magnis.org",
    "phone": "(186) 568-3720"
  },
  {
    "id": "Z5sbDlS7pCzNsnAHLtDJd",
    "name": "Reuben Henry",
    "email": "pharetra.ut@dictum.co.uk",
    "phone": "(715) 598-5792"
  },
  {
    "id": "C9sjBfCo4UJCWjzBnOtxl",
    "name": "Simon Morton",
    "email": "dui.Fusce.diam@Donec.com",
    "phone": "(233) 738-2360"
  },
  {
    "id": "e6ywwRe4jcqxXfCZOj_1e",
    "name": "Thomas Lucas",
    "email": "nec@Nulla.com",
    "phone": "(704) 398-7993"
  },
  {
    "id": "rsKkOQUi80UsgVPCcLZZW",
    "name": "Alec Howard",
    "email": "Donec.elementum@scelerisquescelerisquedui.net",
    "phone": "(748) 206-2688"
  }
]
```
Також у корені проекту створюються файли *contacts.js* та *index.js*.

---
### 2. Робота з файлом *contacts.js*

У файл *contacts.js* робиться імпорт модулів `fs` (у версії, що працює з проміссами, - `«fs/promises»`) і `path` для роботи з файловою системою.
Створюється змінна ***contactsPath*** і в неї записується шлях до файлу *contacts.json*. Для складання шляху використовується метод *.join()* модуля `path`.
```js
const contactsPath = path.join(__dirname, "db", "contacts.json");
```
Додаються асинхронні функції для роботи з колекцією контактів (*contacts.json*). У функціях використовується модуль `fs` та його методи *readFile()* і *writeFile()*. Відповідні функції повинні повертати необхідні дані за допомогою оператора `return`. Виведення в консоль у написаних функціях здійснюватися не повинно.
```js
// contacts.js
const getListOfContacts = async () => {
  // ...твій код. Повертає масив контактів.
}
const getContactById = async (id) => {
  // ...твій код. Повертає об'єкт контакту з таким id. Повертає null, якщо контакт з таким id не знайдений.
}
const addContact = async (data) => {
  // ...твій код. Повертає об'єкт доданого контакту (з id).
}
const deleteContact = async (id) => {
  // ...твій код. Повертає об'єкт видаленого контакту. Повертає null, якщо контакт з таким id не знайдений.
}
const updateContactById = async (id, data) => {
  // ...твій код. Повертає об'єкт відредагованого контакту. Повертає null, якщо контакт з таким id не знайдений.
}
```
Робиться експорт створених функцій за допомогою `module.exports = {}`.

---
### 3. Робота з файлом *index.js*

Робиться імпорт функцій із файлу *contacts.js* у файл *index.js*.
```js
const contacts = require("./contacts");
```
Далі створюється функція `invokeAction()`, яка отримує тип виконуваної дії (`action`) і необхідні аргументи. Функція має викликати відповідний метод із файлу *contacts.js*, передаючи йому необхідні аргументи. Результат роботи викликаної функції виводиться в консоль.
```js
const invokeAction = async ({ action, id, name, email, phone }) => {
  switch (action) {
    case "list":
      // ...
    case "get":
      // ... id
      return;
    case "add":
      // ... name email phone
      return;
    case "delete":
      // ... id
      return;
    case "update":
      // ... id name email phone
    default:
      console.warn("\x1B[31m Unknown action type!");
  }
}
```
---
### 4. Робота з модулем *commander*

Робиться імпорт *program* з модуля `commander` у файлі *index.js*.
```js
const { program } = require("commander");
```
Далі робляться налаштування консольних команд у `program`,
```js
program
  .option("-a, --action <type>", "choose action")
  .option("-i, --id <type>", "user id")
  .option("-n, --name <type>", "user name")
  .option("-e, --email <type>", "user email")
  .option("-p, --phone <type>", "user phone");
```
де:
- `-a` - скорочення команди --action
- `--action <type>` - команда (якщо не вказати `"<type>"`, action повертатиме boolean - `true` або `false`)
- `choose action` - опис команди

Далі викликається метод `parse()`, який читає `process.argv`.
```js
program.parse();
```
У змінну *options* записується результат виклику `program.opts()`, який створює об'єкт, де `action` це ключ, а `<type>` - це значення ключа. Передаємо *options* аргументом у функцію `invokeAction()`.
```js
const options = program.opts();
invokeAction(options);
```
---
### 5. Перевірка результату роботи консольних команд

Запускаются команды в терминале и проверяются результаты выполнения каждой команды.
```js
# Отримуємо і виводимо весь список контактів у вигляді таблиці (console.table).
node index.js -a list

# Отримуємо контакт по id і виводимо у консоль об&apos;єкт контакту або null, якщо контакту з таким id не існує.
node index.js -a get -i 05olLMgyVQdWRwgKfg5J6

# Додаємо контакт та виводимо в консоль об&apos;єкт новоствореного контакту.
node index.js -a add -n 'Mango Smith' -e 'mango@gmail.com' -p '(485) 322-22-22'

# Видаляємо контакт та виводимо в консоль об&apos;єкт видаленого контакту або null, якщо контакту з таким id не існує.
node index.js -a delete -i qdggE76Jtbfd9eWJHrssH

# Редагуємо контакт і виводимо в консоль відредагований контакт або null якщо контакту з таким id не існує.
node index.js -i rsKkOQUi80UsgVPCcLZZW -n 'Aleks Johnson' -e 'Donec.elementum@scelerisquescelerisquedui.net' -p '(748) 206-2677'
```