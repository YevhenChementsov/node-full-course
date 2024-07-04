**Read in other languages: [Русский](../README.md),
[Українська](./README.ua.md).**

# Express.js.

---

Writing a REST API to work with a collection of contacts, mimicking a database.
Working with Express.js. Creating function-decoder and function-helpers. Working
with validation package - `Joi`. To work with REST API is used
[Postman](https://www.getpostman.com/).

---

### 1. Creating a project. Installing dependencies.

The project is initialized using the `yarn init` command. The following packages
are installed **_cors_**, **_express_**, **_joi_**, **_morgan_**, **_nanoid_**
using the `yarn add cors express joi morgan nanoid@3.3.4` command as a
dependency. (dependencies), **_nodemon_** using the `yarn add nodemon --dev`
command as a development dependency (devDependencies). It is mandatory to add a
_.gitignore_ file to which the **node_modules/** folder is added. Add scripts to
_package.json_ file (the dev command can be replaced by any other convenient
command).

```json
"scripts": {
    "start": "node ./app.js",
    "dev": "nodemon ./app.js"
  },
```

> Read more about packages here: [cors](https://www.npmjs.com/package/cors),
> [express](https://www.npmjs.com/package/express),
> [joi](https://www.npmjs.com/package/joi),
> [morgan](https://www.npmjs.com/package/morgan),
> [nanoid](https://www.npmjs.com/package/nanoid) и
> [nodemon](https://www.npmjs.com/package/nodemon).

Use the `yarn` command to install all dependencies listed in the file
_package.json_, into the locally created **node_modules** folder.

---

### 2. Adding contacts.json(database) and functions to work with contacts collection.

The folder is copied
[db](https://github.com/YevhenChementsov/node-full-course/tree/cli/db) from the
branch `cli` branch with the file _`contacts.json`_ to the root of the project.
The file _`contactsServices.js`_ is created in the **services** folder in the
project root and all functions from the file
[contacts.js](https://github.com/YevhenChementsov/node-full-course/blob/cli/contacts.js)
of the `cli` branch are copied.

---

### 3. Creating a web server on Express.js with rooting.

The main file _`app.js`_ is created - the web server on express. The
**_morgan_** and **_cors_** layers are added. A **controllers** folder is
created with the _`contactsControllers.js`_ file where controllers are written.
Also, in the root of the project a **routes** folder with the
_`contactsRouter.js`_ file with rooting settings for working with the contacts
collection is created.

The REST API must support the following routines:

<details>
<summary>@ GET /api/contacts</summary>

- Receives nothing
- Calls the `getListOfContacts` service function to work with the
  _`contacts.json`_ json file
- Returns an array of all contacts in json format with status `200`

</details>

<details>
<summary>@ GET /api/contacts/:id</summary>

- Does not receive `data`
- Gets `id` parameter
- Calls the `getContactById` service function to work with the _`contacts.json`_
  json file
- If such `id` exists, returns a contact object in json format with status `200`
- If there is no such `id`, returns json with the key `"message": "Not found"`
  and the status `404`

</details>

<details>
<summary>@ POST /api/contacts</summary>

- Gets `data` in `{name, email, phone}` format (all fields are mandatory)
- If `data` does not contain any required fields, it returns json with
  `{"message": "Missing required name field"}` and status `400`
- If `data` is OK, adds a unique identifier to the contact object
- Calls the `addContact(data)` service function to save the contact in the
  _`contacts.json`_ file
- On the result of the function returns an object with added
  `{id, name, email, phone}` and status `201`

</details>

<details>
<summary>@ PUT /api/contacts/:id</summary>

- Gets the `id` parameter
- Gets `data` in json format with updates to any fields `name`, `email` and
  `phone`
- If `data` is missing, returns json with `{"message": "Missing fields"}` key
  and status `400`
- If `data` is OK, calls the service function `updateContactById(id, data)` to
  update the contact in the file _`contacts.json`_
- On the result of the function returns the updated contact object with the
  status `200`. Otherwise, returns a json with the key `"message": "Not found"`
  and status `404`

</details>

<details>
<summary>@ DELETE /api/contacts/:id</summary>

- does not receive `data`
- receives `id` parameter
- calls the `getContactById` function service to work with the json file
  _`contacts.json`_
- if such `id` exists, returns a contact object in json format with status `200`
- if there is no such `id`, returns json with the key `"message": "Not found"`
  and the status `404`

</details>

---

### 4. Writing validation.

For routes that accept data (`@ POST` and `@ PUT`), a check (validation) of the
received data is written. The **_joi_** package is used to validate the received
data.

> Validation of `body` can either be done in the controller, or you can create a
> separate middleware for this purpose, which will be called to the controller.

To create a `body` validation middleware - you write the _`validateBody.js`_
function in the **helpers** folder, and the schema for validation in the
_`contactsSchema`_ file(in the **schemas** folder).
