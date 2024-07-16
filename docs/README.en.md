**Read in other languages: [Русский](../README.md),
[Українська](./README.ua.md).**

# MongoDB и Mongoose.

---

Creating MongoDB base, installing MongoDB Compass to work with the base,
connecting to the base using Mongoose. Creating mongoose schema and model.

---

### 1. Create an account on MongoDB Atlas.

Create an account on **_[MongoDB Atlas](https://www.mongodb.com/)_**. After a
new project is created and a **free cluster** is configured. During when setting
up a cluster, you select the region and provider closest to your to your
location. If you choose a region that is too far away from you, the speed of
server response time will be much longer. Next, you create a a user with
administrator rights.

---

### 2. Install and connect the MongoDB Compass graphical editor.

The graphical editor is installed
**_[MongoDB Compass](https://www.mongodb.com/products/tools/compass)_**
graphical editor for convenient work with the database for MongoDB. The
connection of the cloud database to Compass.

![first step](./images/1_step.jpg)

![second step](./images/2_step.jpg)

![third step](./images/3_step.jpg)

The copied string is pasted into the MongoDB Compass url. In the string, the
word ‘<password>’ is replaced with the MongoDB password.

Through Compass, the _`db-contacts`_ database is created and the collection
_`contacts`_ collection.

---

### 3. Connecting to MongoDB using Mongoose.

All files and folders from the branch are copied
[rest-api-express](https://github.com/YevhenChementsov/node-full-course/tree/rest-api-express)
branch and replaces the storage of contacts from the json file with the created
database. С the `yarn remove nanoid` command removes the **nanoid** package. The
command `yarn add cross-env dotenv mongoose` command installs the necessary
packages for work.

> More about the packages: [cross-env](https://www.npmjs.com/package/cross-env),
> [dotenv](https://www.npmjs.com/package/dotenv),
> [mongoose](https://www.npmjs.com/package/mongoose).

The scripts in the _`package.json`_ file are changed.

```json
"scripts": {
    "start": "cross-env NODE_ENV=production node ./server.js",
    "dev": "cross-env NODE_ENV=development nodemon ./server.js"
  },
```

The **db** and **services** folders with all their contents are deleted.

In the file _`server.js`_ a connection to MongoDB is created using Mongoose.

- If the connection is successful, a message `‘Database connection successful’`
  is displayed in the console
- If the connection fails, an error message is printed to the console and the
  process is terminated with process.exit(1).

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

In the _`DB_HOST`_ environment variable in the _`.env`_ file, the copied string
from MongoDB:

![fourth step](./images/4_step.jpg) ![fifth step](./images/5_step.jpg)

The name of the database _`db-contacts`_ is written before the question mark in
the copied line.

```js
DB_HOST =
  'mongodb+srv://*********:<your password from mongodb>@cluster0.*******.mongodb.net/db-contacts?retryWrites=true&w=majority&appName=Cluster0';
```

> Important! Check carefully the exact name of the database, because mongoose
> will not show an error when connecting if the database name is entered
> incorrectly.

In the _`.env.example`_ file, the name of the _`DB_HOST`_ variable is added to
know what environment variable is used - `DB_HOST=`. An import is added to
_`app.js`_ `require(‘dotenv’).config();` to work with the .env file and
environment variables.

---

### 4. Creating the contact model schema.

The _`contact.js`_ file is created in the **models** folder where the schema and
model of the contacts collection will be stored. For this purpose, the scheme
and model are imported from mongoose:

```js
// contact.js
const { Schema, model } = require('mongoose');
```

A model schematic is created for the contacts collection:

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

The mongoose methods throw an error with no status and so it defaults to `500`
(when it gets to _`app.js`_). The status display is fixed by using the helper
function _`handleMongooseError`_, which is created in the **helpers** folder.

```js
// helpers/handleMongooseError.js
const handleMongooseError = (error, data, next) => {
  error.status = 400;
  next();
};

module.exports = handleMongooseError;
```

Next, the _`handleMongooseError`_ function is imported, a model is created and
exported of the contacts collection:

```js
// contact.js
const { handleMongooseError } = require('../helpers');

...

contactSchema.post('save', handleMongooseError);

const Contact = model('contact', contactSchema);

module.exports = Contact;
```

> Important! The first argument of the model must be a singular noun.

---

### 5. Rewriting of request processing functions - controllers.

The code of CRUD-operations on contacts from the file is replaced with
Mongoose-methods for working with contacts collection in the database. file, to
Mongoose-methods for working with contacts collection in the database. For this
purpose the **_Contact_** model is imported.
`const { Contact } = require('../../models/contact');` and replaces it with the
methods of the models:

- `find()` - finds all contacts
- `findById()` - finds a contact by `id`
- create() - creates a new contact
- findByIdAndUpdate() - completely overwrites a contact by `id`
- findByIdAndDelete() - deletes a contact by `id`

---

### 6. Adding a new route @ PATCH /api/contacts/:id/favorite

An additional status field _favorite_ appears in contacts, which takes the
logical value true or false. It is responsible for whether the specified contact
is in favorites or not. It is implemented to update the contact's status with a
new root:

<details>.
<summary>@ PATCH /api/contacts/:id/favorite</summary>

- Gets the `id` parameter
- Gets `body` in json format with the `favorite` field updated.
- If `body` is missing, returns json with {'message': 'missing field favorite'}
  and status `400`.
- If `body` is OK, calls the _`updateFavorite(id, body, { new: true })`_
  function (added to /controllers/contacts) to update the contact in the
  database. The third argument is passed to the `{ new: true }` object to return
  the updated contact.
- The function returns an updated contact object with a status of `200`.
  Otherwise, it returns a json with a `'message': 'Not found'` key and a status
  of `404`

</details>

---

### 7. Validation for @ PATCH

Since patch updates a single field, validation is written separately for it. For
convenience, it is better to store mongoose validation and joi validation in one
file. Therefore, the contents of the _`contactsSchema.js`_ file from the
**schemas** folder are transferred to the _`contacts.js`_ file, which is located
in the **models** folder, _`contactsSchema.js`_ and the **schemas** folder are
deleted.

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
