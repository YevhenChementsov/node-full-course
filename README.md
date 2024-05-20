**Читать на других языках: [Русский](README.md),
[Українська](./docs/README.ua.md), [English](./docs/README.en.md).**

# Работа с файлами в Node.js. Создание консольного приложения.
---
Консольное приложение для:
- вывода всех контактов в виде таблицы;
- поиска контакта по `id`;
- добавления контакта;
- удаления контакта;
- редактирования контакта;
---
### 1. Создание проекта
Инициализировать проект с помощью команды `npm init` или `yarn init`. Устанавливаются пакеты *commander* и *nanoid* с помощью команды `yarn add commander nanoid@3.3.4` или `npm install commander nanoid@3.3.4`.
> Важно! Для работы с CommonJS, нужен nanoid именно версии 3.3.4.

Устанавливается *nodemon* с помощью команды `yarn add nodemon --dev` или `npm install nodemon --save-dev` как зависимость разработки (devDependencies). Обязательно добавляется *.gitignore* файл в который добавляется папка **node_modules/**. Добавляем скрипты в *package.json* файл (команду dev можно заменить любой другой удобной командой).
```json
"scripts": {
    "start": "node index",
    "dev": "nodemon index"
  },
```
> Подробнее о пакетах: [commander](https://www.npmjs.com/package/commander), [nanoid](https://www.npmjs.com/package/nanoid) и [nodemon](https://www.npmjs.com/package/nodemon).

С помощью команды `yarn` или `npm install` устанавливаются все зависимости, перечисленные в файле *package.json*, в локальную созданную папку **node_modules**.
В корне проекта создается папка **db**, в которой создается файл *contacts.json*. Это будет имитация базы данных. В *contacts.json* копируются и вставляются следующие данные:
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
Также в корне проекта создаются файлы *contacts.js* и *index.js*.

---
### 2. Работа с файлом *contacts.js*

В файл *contacts.js* делается импорт модулей `fs` (в версии, которая работает с промиссами - `"fs/promises"`) и `path` для работы с файловой системой.
Создаётся переменная ***contactsPath*** и в нее записывается путь к файлу *contacts.json*. Для составления пути используется метод *.join()* модуля `path`.
```js
const contactsPath = path.join(__dirname, "db", "contacts.json");
```
Добавляются асинхронные функции для работы с коллекцией контактов (*contacts.json*). В функциях используется модуль `fs` и его методы *readFile()* и *writeFile()*. Соответствующие функции должны возвращать необходимые данные с помощью оператора `return`. Вывод в консоль в написанных функциях осуществляться не должен.
```js
// contacts.js
const getListOfContacts = async () => {
  // ...твой код. Возвращает массив контактов.
}
const getContactById = async (contactId) => {
  // ...твой код. Возвращает объект контакта с таким id. Возвращает null, если контакт с таким id не найден.
}
const addContact = async (data) => {
  // ...твой код. Возвращает объект добавленного контакта (с id).
}
const removeContact = async (contactId) => {
  // ...твой код. Возвращает объект удаленного контакта. Возвращает null, если контакт с таким id не найден.
}
const updateContactById = async (contactId, data) => {
  // ...твой код. Возвращает объект отредактированного контакта. Возвращает null, если контакт с таким id не найден.
}
```
Делается экспорт созданных функций с помощью `module.exports = {}`.

---
### 3. Работа с файлом *index.js*

Делается импорт функций из файла *contacts.js* в файл *index.js*.
```js
const contacts = require("./contacts");
```
Далее создается функция `invokeAction()`, которая получает тип выполняемого действия(`action`) и необходимые аргументы. Функция должна вызвать соответствующий метод из файла *contacts.js*, передавая ему необходимые аргументы. Результат работы вызванной функции выводится в консоль.
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
    case "remove":
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
### 4. Работа с модулем *commander*

Делается импорт *program* из модуля `commander` в файле *index.js*.
```js
const { program } = require("commander");
```
Далее делаются настройки консольных команд в `program`,
```js
program
  .option("-a, --action <type>", "choose action")
  .option("-i, --id <type>", "user id")
  .option("-n, --name <type>", "user name")
  .option("-e, --email <type>", "user email")
  .option("-p, --phone <type>", "user phone");
```
где:
- `-a` - сокращение команды --action
- `--action <type>` - команда (если не указать `"<type>"`, action будет возвращать boolean - `true` или `false`)
- `choose action` - описание команды

Далее вызывается метод `parse()`, который читает `process.argv`.
```js
program.parse();
```
В переменную *options* записывается результат вызова `program.opts()`, который создает объект, где `action` это ключ, а `<type>` - это значение ключа. Передаем *options* аргументом в функцию `invokeAction()`.
```js
const options = program.opts();
invokeAction(options);
```
---
### 5. Проверка результата работы консольных команд

Запускаются команды в терминале и проверяются результаты выполнения каждой команды.

```js
# Получаем и выводим весь список контактов в виде таблицы (console.table).
node index.js -a list

# Получаем контакт по id - выводим в консоль объект контакта или null если контакта с таким id не существует.
node index.js -a get -i 05olLMgyVQdWRwgKfg5J6

# Добавляем контакт и выводим в консоль созданный контакт.
node index.js -a add -n Mango -e mango@gmail.com -p 322-22-22

# Удаляем контакт и выводим в консоль удаленный контакт или null если контакта с таким id не существует.
node index.js -a remove -i qdggE76Jtbfd9eWJHrssH

# Редактируем контакт и выводим в консоль отредактированный контакт или null если контакта с таким id не существует.
node index.js -i rsKkOQUi80UsgVPCcLZZW -n Aleks -e Donec.elementum@scelerisquescelerisquedui.net -p (748) 206-2677
```