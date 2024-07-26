**Read in other languages: [Русский](../README.md),
[Українська](./README.ua.md).**

# User Authentication / Authorization via JWT token.

---

Creating a collection of users users. Add logic authentication/authorization of
user via JWT token. Retrieving user data by token. Filtering and pagination of
contacts. Updating user subscription. Logout.

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

An endpoint `/api/auth/signin` is created.

In the file _`user.js`_ in the **models** folder is added and exported.
Joi-validation of necessary fields at authorization (`email` and `password`).

```js
// models/user.js
...
const signInSchema = Joi.object({
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
  signInSchema,
};

module.exports = {
  User,
  schemas,
};
```

The _`signin.js`_ file is created in the **controllers/auth** folder. In the
file a controller-function `signIn()` is created to check and authorize an
existing user by the data that passed validation (`email` and `password`).

- If `email` does not exist in the database, an error is thrown with status
  `401` and the message `Invalid email or password`.
- If `email` exists in the database, but `password` does not match, an error
  with status `401` and message `Invalid email or password` is thrown.
- If successful - generate and return token `{ token: generated token }` with
  status `200`.
- The [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken) library is used
  to generate the token.

To generate a token, a secret key is added to the _`.env`_ file (SECRET_KEY). It
can be random or generated using a website (e.g.
[randomkeygen](https://randomkeygen.com/)).

Next, the authorization controller - `signIn()` function imports the jwt
library, SECRET_KEY from `process.env`. The `payload` necessary for the jwt
token generation.

A token is created from `payload`, `SECRET_KEY` and a settings object, which
token lifetime is specified.

```js
// signin.js
...
const jwt = require('jsonwebtoken');

const { SECRET_KEY } = process.env;
...
const payload = {
  id: user._id,
}
const token = jwt.sign(payload, SECRET_KEY, { expiresIn: '1h' });
```

### 4. Token Verification / Authentication.

A middleware _`authenticate.js`_ in the **middlewares** folder is created to
validate the token and added to all contact routes that need to be protected.

- Middleware takes the token from the `Authorization` headers, checks the token
  for validity

```js
// authenticate.js
const { authorization = '' } = req.headers;
const [bearer, token] = authorization.split(' ');
```

- If the token is not valid, it throws an error with status `401` and message
  `'Unauthorized'`

```js
// authenticate.js
if (bearer !== 'Bearer') {
  next(HttpError(401));
}
```

- If validation is successful, get the `id` of the user from the token. Find the
  user in the database by this `id`

```js
// authenticate.js
const { id } = jwt.verify(token, SECRET_KEY);
const user = await User.findById(id);
```

- If the user with such `id` does not exist or tokens do not match, return an
  error with status `401` and message `'Unauthorized'`

```js
// authenticate.js
if (!user) {
  next(HttpError(401, 'User not found.'));
}
```

- If the user exists and the token matches the one in the database, write his
  data to `req.user` and call the `next()` method

```js
// authenticate.js
req.user = user;
next();
```

Once the user data is recorded, when adding a contact, the `id` of the user is
taken from `req.user` and added to the query. After that all added contacts will
be assigned in the database only to the logged in user `_id: owner`.

```js
// controllers/contacts/add.js
const { _id: owner } = req.user;
const result = await Contact.create({ ...req.body, owner });
```

The same is done for requesting all contacts.

```js
// controllers/contacts/getAll.js
const { _id: owner } = req.user;
const result = await Contact.find({ owner });
```

Now the user will receive only his contacts. So that when requesting in the
`owner` field will be written not `id`, but for example the name and email of
the user who makes the request, `populate()` is added after the request.

```js
// controllers/contacts/getAll.js
const result = await Contact.find({ owner }).populate('owner', 'name email');
```

The middleware _`authenticate`_ is added to all CRUD requests root
_`contacts.js`_.

### 5. Pagination.

To retrieve search parameters from a query string, `req.query` is used. In the
_`getAll.js`_ controller function in the **controllers/contacts/** folder,
`page` and `limit` are taken from the `req.query` object. By default, the `page`
parameter is set to `1` and the `limit` parameter is set to `10`.

```js
// controllers/contacts/getAll.js
const { page = 1, limit = 10 } = req.query;
```

In the `find()` method the third argument of the query is used to specify the
additional settings built into the mongoose additional settings (`skip` and
`limit`). `skip` is calculated by formula `(page - 1) * limit`. The result is
returned:

```js
// controllers/contacts/getAll.js
const result = await Contact.find({ owner }, '', {
  skip,
  limit,
}).populate('owner', 'name email');

res.json(result);
```
