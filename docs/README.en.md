**Read in other languages: [Русский](../README.md),
[Українська](./README.ua.md).**

# Upload user files (avatar) via Multer.

---

Adding the ability to upload a user's avatar via 'multer'. Generation of
standard avatar when registering a new user with the library gravatar. Adding
and updating avatar size with 'jimp' or 'sharp' package. Writing unit tests for
login controller (login/signin) with 'jest'.

---

### 1. Configure Express to distribute static files.

1.1. A **public** folder is created for static distribution. In this folder
**avatars** folder is created.

> Important! Since an empty gitkeep folder cannot be launched, you need to
> create a _`.gitkeep`_ file in the **public/avatars** folder.

1.2. Configure `Express` to distribute static files from the **public** folder.
To do this, a middleware is added to [app.js](../app.js)
`app.use(express.static('public'));`.

1.3. To check that the static distribution works, put any image in the
**public/avatars** folder. When you go to this URL, the browser will display the
image.

```js
http://localhost:<port>/avatars/<extension filename>
```

---

### 2. Generate an avatar from gravatar.

2.1. A new property avatarURL is added to the user scheme
'[User](../models/user.js)' to store the image.

```js
avatarURL: {
  type: String,
  required: false,
}
```

2.2. In order to immediately generate an avatar for a new user during his
registration the library [gravatar](https://www.npmjs.com/package/gravatar) is
used .

2.3. When creating a user, the `url` obtained with the help of `gravatar`, is
stored in the _`avatarURL`_ field.

---

### 3. Updating the avatar by the user. Customization of the avatar with the jimp or sharp package.

3.1. A **temp** folder is created in the root of the project for temporary
storage the avatar uploaded by the user.

3.2. The endpoint [`/api/users/avatars`](#avatar-update-request) is created.

3.3. A middleware is created and added to the route
[upload](../middlewares/upload.js), in which the following is configured
`multer.diskStorage({})` to upload the avatar to the **temp** folder.

3.4. A controller is created and added to the route
[updateAvatar](../controllers/users/updateAvatar.js).

3.5. Using [jimp](https://www.npmjs.com/package/jimp) or
[sharp](https://www.npmjs.com/package/sharp) to change and set the size of the
of the avatar 250 by 250.

> You need to change the size of the avatar in the **temp** folder, before
> transferring it to the **public/avatars** folder, so that in case of an error,
> the file is deleted and the user can download it again.

3.6. The user's avatar is transferred to the **public/avatars** folder. It is
set to a unique name for a specific user.

3.7. The received URL `/avatars/<file name with extension>` is saved in the
field [avatarURL](#response-to-successful-avatar-update) field of the user.

3.8. User request to change the avatar

![user_request](./images/avatar_upload.jpg)

##### Avatar update request

```js
@PATCH /api/users/avatars
Content-Type: multipart/form-data
Authorization: "Bearer {{token}}"
RequestBody: uploaded file
```

##### Response to successful avatar update

```js
Status: 200 OK
Content-Type: application/json
ResponseBody: {
  "avatarURL": "here will be the link to the image"
}
```

---

## Additional task

---

### 4. Unit testing of the sign-in controller.

4.1 Write unit tests for the login/signin controller using
[jest](https://www.npmjs.com/package/jest) and
[supertest](https://www.npmjs.com/package/supertest). In _`package.json`_ you
need to insert the key into the `scripts` field: "test", value: "jest".

```json
// package.json
"scripts": {
  "test": "jest"
}
```

4.2 The `yarn test` command is used to run tests.

The test must pass the following items:

- Returns a successful response with status code `200`.
- Verifies that the token exists in the response.
- Verifies that the token actually corresponds to the user.
- Verifies that the token is stored in the user's 'MongoDB'.
- The response returns a user with the 'email' and 'subscription' fields.
- The 'email' field in the response is returned as a string.
- The 'email' field in the response is returned as a string.
