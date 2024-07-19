**Read in other languages: [Русский](../README.md),
[Українська](./README.ua.md).**

# User Authentication / Authorization via JWT token.

---

Creating a collection of users users. Add logic authentication/authorization of
user via JWT token. Retrieving user data by token. Filtering and pagination of
contacts. Updating user subscription.

---

### 1. Create schema and user model for users collection.

The code creates a schema and user model for the users collection.

```js
// models/user.js
{
  password: {
    type: String,
    required: [true, 'Password is required'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
  },
  subscription: {
    type: String,
    enum: ["starter", "pro", "business"],
    default: "starter"
  },
  token: {
    type: String,
    default: null,
  },
}
```

To make each user work and see only his contacts in the contact scheme the
`owner` property is added.

```js
// models/contacts.js
owner: {
  type: Schema.Types.ObjectId,
  ref: 'user',
}
```

> Note: 'user' is the name of the collection (singular) where users are stored.

---

### 2. User registration.

The `/api/auth/signup` endpoint is created.

For this purpose, a _`auth.js`_ file is created in the **routes** folder, which
will be responsible for all routes related to registration, authorization and
logout. A router is created and exported. A user registration endpoint is added,
without validation or controller yet.

```js
// routes/auth.js
const { Router } = require('express');

const router = Router();

router.post('/signup');

module.exports = router;
```

The router is imported into the _`app.js`_ file.

```js
// app.js
...
const contactsRouter = require('./routes/contacts');
const authRouter = require('./routes/auth');
...
app.use('/api/contacts', contactsRouter);
app.use('/api/auth', authRouter);
```

In the file _`user.js`_ in the **models** folder is added and exported
Joi-validation of necessary fields at registration (`name`, `email` and
`password`).

```js
// models/user.js
...
const signUpSchema = Joi.object({
  name: Joi.string()
    .pattern(regexp.nameRegExp)
    .min(3)
    .max(30)
    .required()
    .messages({
      'string.base': 'Name should be a string',
      'string.pattern.base': 'Name should be a string',
      'string.empty': 'Name cannot be an empty field',
      'string.min': 'Name should have a minimum of {#limit} letters',
      'string.max': 'Name should have a maximum of {#limit} letters',
      'any.required': 'Name is a required field',
    }),
  email: Joi.string().pattern(regexp.emailRegExp).required().messages({
    'string.email': 'Please enter a valid email address',
    'string.empty': 'Email cannot be an empty field',
    'any.required': 'Email is a required field',
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Password should have a minimum of {#limit} symbols',
    'string.empty': 'Password cannot be an empty field',
    'any.required': 'Password is a required field',
  }),
});

const schemas = {
  signUpSchema,
};

module.exports = {
  User,
  schemas,
};
```

In the project we install library [bcrypt](https://www.npmjs.com/package/bcrypt)
for salting user's password before writing it to the database. In the
**controllers** folder we create the **auth** folder with the _`signup.js`_
file. In the file, a controller-function `signUp()` is created to create a user
using data that has been validated.

- If a user with this `email` is already registered, an http error
  `409 Conflict` with the text `User with this email already exists`.
- If successful - status `201 Created` and user
  `{ name: newUser.name, email: newUser.email, }`

Validation and controller are added to the _`auth.js`_ file in the **routes**
folder.

```js
// routes/auth.js
...
const { auth: ctrl } = require('../controllers');
const { ctrlWrapper } = require('../helpers');
const { validateBody } = require('../middlewares');
const { schemas } = require('../models/user');
...
router.post('/signup', validateBody(schemas.signUpSchema), ctrlWrapper(ctrl.signUp));
```

---

### 3. Authorization (Login).
