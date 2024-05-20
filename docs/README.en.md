**Read in other languages: [Русский](../README.md),
[Українська](./README.ua.md), [English](./README.en.md).**

# Working with files in Node.js. Creating a console application.
---
A console application for:
- displaying all contacts in a table;
- searching for a contact by id;
- adding a contact;
- deleting a contact;
- editing a contact;
---
### 1. Creating the Project
Initialize the project using the command `npm init` or `yarn init`. Install the *commander* and *nanoid* packages using the command `yarn add commander nanoid@3.3.4` or `npm install commander nanoid@3.3.4`.
> Important! For CommonJS compatibility, nanoid version 3.3.4 is required.

Install *nodemon* using the command `yarn add nodemon --dev` or `npm install nodemon --save-dev` as a development dependency (devDependencies). Be sure to add a *.gitignore* file and include the **node_modules/** folder in it. Add scripts to the *package.json* file (the dev command can be replaced with any other convenient command).
```json
"scripts": {
    "start": "node index",
    "dev": "nodemon index"
  },
```
> More about packages: [commander](https://www.npmjs.com/package/commander), [nanoid](https://www.npmjs.com/package/nanoid) и [nodemon](https://www.npmjs.com/package/nodemon).

Use the `yarn` or `npm install` command to install all dependencies listed in the *package.json* file into the local **node_modules** folder.
Create a **db** folder in the root of the project and a *contacts.json* file within it. This will simulate a database. Copy and paste the following data into *contacts.json*:
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
Also, create *contacts.js* and *index.js* files in the project root.

---
### 2. Working with the contacts.js File

In the *contacts.js* file, import the `fs` module (in the version that works with promises - `"fs/promises"`) and the `path` module for working with the file system.
Create a variable ***contactsPath*** and assign it the path to the *contacts.json* file. Use the *.join()* method of the `path` module to construct the path.
```js
const contactsPath = path.join(__dirname, "db", "contacts.json");
```
Add asynchronous functions for working with the contacts collection (*contacts.json*). Use the fs module and its *readFile()* and *writeFile()* methods in the functions. The corresponding functions should return the necessary data using the `return` operator. Do not output to the console within the written functions.
```js
// contacts.js
const getListOfContacts = async () => {
  // ...your code. Returns an array of contacts.
}
const getContactById = async (contactId) => {
  // ...your code. Returns the contact object with the given id. Returns null if the contact with the given id is not found.
}
const addContact = async (data) => {
  // ...your code. Returns the added contact object (with id).
}
const removeContact = async (contactId) => {
  // ...your code. Returns the deleted contact object. Returns null if the contact with the given id is not found.
}
const updateContactById = async (contactId, data) => {
  // ...your code. Returns the edited contact object. Returns null if the contact with the given id is not found.
}
```
Export the created functions using `module.exports = {}`.

---
### 3. Working with the *index.js* file

Import functions from the *contacts.js* file into the *index.js* file.
```js
const contacts = require("./contacts");
```
Next, create a `invokeAction()` function that receives the type of action (`action`) and necessary arguments. The function should call the corresponding method from the *contacts.js* file, passing the necessary arguments to it. The result of the called function should be output to the console.
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
### 4. Working with the *commander* module

Import *program* from the `commander` module in the *index.js* file.
```js
const { program } = require("commander");
```
Next, configure the console commands in `program`,
```js
program
  .option("-a, --action <type>", "choose action")
  .option("-i, --id <type>", "user id")
  .option("-n, --name <type>", "user name")
  .option("-e, --email <type>", "user email")
  .option("-p, --phone <type>", "user phone");
```
where:
- `-a` - shortcut for the --action command
- `--action <type>` - command (if `"<type>"` is not specified, action will return a boolean - `true` or `false`)
- `choose action` - command description

Next, call the `parse()` method, which reads `process.argv`.
```js
program.parse();
```
Assign the result of calling `program.opts()`, which creates an object where `action` is the key and `<type>` is the value of the key, to the *options* variable. Pass *options* as an argument to the `invokeAction()` function.
```js
const options = program.opts();
invokeAction(options);
```
---
### 5. Checking the result of console commands

Run the commands in the terminal and check the results of each command.

```js
# Retrieve and display the entire list of contacts in table form (console.table).
node index.js -a list

# Retrieve the contact by id and display the contact object or null if a contact with the given id does not exist.
node index.js -a get -i 05olLMgyVQdWRwgKfg5J6

# Add a contact and display the new contact object in the console.
node index.js -a add -n Mango -e mango@gmail.com -p 322-22-22

# Delete a contact and display the deleted contact object or null if a contact with the given id does not exist.
node index.js -a remove -i qdggE76Jtbfd9eWJHrssH

# Edit a contact and display the edited contact object or null if a contact with the given id does not exist.
node index.js -i rsKkkOQUi80UsgVPCcLZZW -n Aleks -e Donec.elementum@scelerisquescelerisquedui.net -p (748) 206-2677
```