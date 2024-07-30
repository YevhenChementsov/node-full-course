**Read in other languages: [Русский](../README.md),
[Українська](./README.ua.md).**

# User Authentication / Authorization via JWT token.

---

Creating a collection of users 'users'. Adding user authentication/authorization
using JWT token. Logout. Retrieving current user data by token. Pagination of
contacts. Filtering contacts by 'favorite' field. Updating user subscription
('starter', 'pro', 'business').

---

### 1. Create schema and user model for users collection.

1.1. The code creates a schema and user model for the [users](../models/user.js)
collection.

```js
// models/user.js
{
  name: {
    type: String,
    minlength: "your number",
    maxlength: "your number",
    required: [true, 'Name is required'],
  },
  password: {
    type: String,
    minlength: [
      "your number",
      'The value is shorter than the minimum allowed length ({MINLENGTH}).',
    ],
    required: [true, 'Password is required'],
  },
  email: {
    type: String,
    match: "any regular expression for email"
    required: [true, 'Email is required'],
    unique: true,
  },
  subscription: {
    type: String,
    enum: ['starter', 'pro', 'business'],
    default: 'starter',
  },
  token: {
    type: String,
    default: null,
  },
},
{ versionKey: false, timestamps: true },
```

1.2. To make each user work and see only their contacts, the `owner` property is
added to the contact schema.

```js
// models/contacts.js
owner: {
  type: Schema.Types.ObjectId,
  ref: 'user',
  required: true,
}
```

> Note: `user` is the name of the collection (in singular) where users are
> stored.

---

### 2. User registration.

2.1. An endpoint [`/api/auth/signup`](#registration-request) is created.

2.2. All mandatory fields (`name`, `email`, `password`) are validated. In case
of validation error it returns [Bad Request](#registration-validation-error).

2.3. In case of successful validation, a user is created in the `User` model
according to the data that passed validation. To salt the user's password before
writing it to the database, [bcrypt](https://www.npmjs.com/package/bcrypt) or
[bcrypt.js](https://www.npmjs.com/package/bcryptjs) is used.

- If a user with that `email` is already registered, it returns
  [Conflict](#registration-conflict-error).
- If all is well - [Created](#registration-success-response).

##### Registration request

```js
@POST /api/auth/signup
Content-Type: application/json
RequestBody: {
  "name":"example name",
  "email": "example@example.com",
  "password": "example password"
}
```

##### Registration validation error

```js
Status: 400 Bad Request
Content-Type: application/json
ResponseBody: <Ошибка от Joi или другой библиотеки валидации>
```

##### Registration conflict error

```js
Status: 409 Conflict
Content-Type: application/json
ResponseBody: {
  "message": "User with this email already exists"
}
```

##### Registration success response

```js
Status: 201 Created
Content-Type: application/json
ResponseBody: {
  "user": {
    "name":"example name",
    "email": "example@example.com",
    "subscription": "starter"
  }
}
```

---

### 3. Authorization (Login).

3.1. An endpoint [`/api/auth/signin`](#login-request) is created.

3.2. Validation of all mandatory fields (`email` and `password`) is done. In
case of validation error return [Bad Request](#login-validation-error).

3.3. In the `User` model find the registered user by `email`.

- If the user with such `email` does not exist in the database, it returns
  [Unauthorized](#login-auth-error).
- If there is a user with such `email`, the hashed password from the database is
  compared with the entered password. from the database is compared with the
  entered one.
- If the passwords do not match, it returns [Unauthorized](#login-auth-error).
- If the passwords match, a `token` is created using the library
  [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken), stored in the
  current user and returns [Ok](#login-success-response).

##### Login request

```js
@POST /api/auth/signin
Content-Type: application/json
RequestBody: {
  "email": "example@example.com",
  "password": "example password"
}
```

##### Login validation error

```js
Status: 400 Bad Request
Content-Type: application/json
ResponseBody: <Ошибка от Joi или другой библиотеки  валидации>
```

##### Login auth error

```js
Status: 401 Unauthorized
ResponseBody: {
  "message": "Email or password is wrong"
}
```

##### Login success response

```js
Status: 200 OK
Content-Type: application/json
ResponseBody: {
  "token": "example token"
  "user": {
    "name":"example name",
    "subscription": "starter"
  },
}
```

---

### 4. Token Verification / Authentication.

4.1. A [authenticate](../middlewares/authenticate.js) middleware is created to
validate the token and added to all contact routes that need to be secured.

- Middleware takes the token from the `Authorization` headers and checks the
  token for validity.
- If the token is not valid, it returns
  [Unauthorized](#middleware-unauthorized-error).
- If validation is successful, get the `id` of the user from the token. Find the
  user in the database by that `id`.
- If the user with that `id` does not exist or the tokens do not match, return
  [Unauthorized](#middleware-unauthorized-error).
- If the user exists and the token matches the one in the database, write its
  data to `req.user` and call the `next()` method.

##### Middleware unauthorized error

```js
Status: 401 Unauthorized
Content-Type: application/json
ResponseBody: {
  "message": "Unauthorized"
}
```

---

### 5. Logout.

5.1. Endpoint [`/api/auth/signout`](#logout-request) is created.

5.2. Adds [authenticate](../middlewares/authenticate.js) to the route to verify
token/authentication.

5.3. In the `User` model, find the user by `_id`.

- If the user does not exist, return [Unauthorized](#logout-unauthorized-error).
- If the user is found, the `token` field of the current user is made `null` and
  return [No Content](#logout-success-response).

##### Logout request

```js
@GET /api/auth/signout
Authorization: 'Bearer {{token}}';
```

##### Logout unauthorized error

```js
Status: 401 Unauthorized
Content-Type: application/json
ResponseBody: {
  "message": "Unauthorized"
}
```

##### Logout success response

```js
Status: 204 No Content
```

---

### 6. Current user - get user data by token.

6.1. An endpoint [`/api/users/current`](#current-user-request) is created.

6.2. Adds [authenticate](../middlewares/authenticate.js) to the route to check
the token / authentication.

- If the user is not found, the token is not correct or its time has expired -
  returns [Unauthorized](#current-user-unauthorized-error).
- If the user is found, it returns [Ok](#current-user-success-response).

##### Current user request

```js
@GET /api/users/current
Authorization: "Bearer {{token}}"
```

##### Current user unauthorized error

```js
Status: 401 Unauthorized
Content-Type: application/json
ResponseBody: {
  "message": "Unauthorized"
}
```

##### Current user success response

```js
Status: 200 OK
Content-Type: application/json
ResponseBody: {
  "name": "example name",
  "subscription": "starter"
}
```

---

## Additional task

---

### 7. Pagination for the contacts collection @GET /api/contacts?page=1&limit=10.

7.1. In order to make pagination when requesting the output of all user contacts
you need to edit the function-controller
[getAll](../controllers/contacts/getAll.js). To get the search parameters from
the query string, `req.query` is used.

```js
//controllers/contacts/getAll.js
const { page = 1, limit = 10 } = req.query;
```

7.2. In the `find()` method, when querying, the third argument is used to
specify the additional settings built into the mongoose additional settings
(`skip` and `limit`). `skip` is calculated by formula `(page - 1) * limit`.

---

### 8. Filter contacts by favorite field @GET /api/contacts?favorite=true.

8.1. In order to filter contacts, leaving those where `favorite=true` in the
function-controller [getAll](../controllers/contacts/getAll.js) from
`req.query`, besides `page` and `limit`, `favorite` is also taken from
`req.query`.

8.2. Check if the contact has `favorite` field with `true` value.

---

### 9. Update user subscription via endpoint @PATCH /api/users/:id/subscription.

9.1. An endpoint [`/api/users/:id/subscription`](#subscription-request) is
created.

9.2. The `subscription` field is validated to make sure that the value of
`subscription` is one of the valid values: 9.2. `subscription` is one of the
valid values: ['starter', 'pro', 'business']. If the validation fails, return
[Bad Request](#subscription-validation-error).

9.3. In the `User` model, find the registered user by `_id`.

- If the user with such `_id` is not in the database, it returns
  [Not Found](#subscription-id-not-found).
- If all is well, it returns
  [updated contact object](#subscription-success-response).

##### Subscription request

```js
@PATCH /api/users/:id/subscription
Content-Type: application/json
RequestBody: {
  "subscription": "one of: starter, pro or business"
}
```

##### Subscription validation error

```js
Status: 400 Bad Request
Content-Type: application/json
ResponseBody: <Ошибка от Joi или другой библиотеки  валидации>
```

##### Subscription id not found

```js
Status: 404 Not Found
Content-Type: application/json
ResponseBody: {
  "message": "User not found"
}
```

##### Subscription success response

```js
Status: 200 OK
Content-Type: application/json
ResponseBody: {
  user
}
```
