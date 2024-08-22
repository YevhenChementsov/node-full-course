**Read in other languages: [Русский](../README.md),
[Українська](./README.ua.md).**

# Send email using SendGrid mediator service.

---

Preparing integration with SendGrid API. Creating endpoint for email
verification. Adding the first and in case of a problem - repeated sending of
email to the user with a link for verification.

---

#### How the verification process should work

- After registration, the user should receive an email on the specified at the
  registration email with a link to verify his email.
- After clicking the link in the received email for the first time, the user
  should get [Response](#successful-verification-response) with a status of
  `200`, which will imply that the email has been successfully verified.
- Clicking the link again, the user should receive
  [Error](#resend-email-for-verified-user) with status `400`.

---

### 1. Preparing integration with SendGrid API.

1.1. Register on [Sendgrid](https://sendgrid.com/en-us).

1.2. Create sender email.

- In the SendGrid administration panel, go to the `Marketing` menu.
- In the `Senders` submenu, in the upper right corner, click `Create New Sender`
  button.
- Fill in the required fields in the proposed form. Save.
- Verify the email specified in the completed form.

<!-- prettier-ignore -->
1.3. API access token is created.

- In the SendGrid administration panel, go to the `Email API` menu.
- In the `Integration Guide` submenu - _method_ select `Web API`, _language_
  select `Node.js`.
- Give a name to the token and generate it. Copy and save the token.

> It is important to save the token, because you will not be able to view it
> again, only recreate it.

1.4. The generated API token is added to the `.env` file of the project.

---

### 2. User mail verification.

2.1. An endpoint for mail verification is created.

- Two fields verificationToken and verify are added to the
  ['User'](../models/user.js) model. The value of the verify field equal to
  false will mean that email has been not verified yet.

```js
// models/user.js
verify: {
  type: Boolean,
  default: false,
},
verificationToken: {
	type: String,
	default: null,
}
```

- Endpoint is created
  [`/api/auth/verify/:verificationToken`](#verification-request), where by the
  parameter verificationToken we will search for the user in the model
  ['User'](../models/user.js).
- If the user with this token is not found, we need to return
  [Not Found](#verification-error).
- If the user is found - set verificationToken to `null`, and set the verify
  field to `true` and return [Ok](#successful-verification-response).

##### Verification Request

```js
@GET /api/auth/verify/:verificationToken
```

##### Verification Error

```js
Status: 404 Not Found
Content-Type: application/json
ResponseBody: {
  "message": "User not found"
}
```

##### Successful verification response

```js
Status: 200 OK
Content-Type: application/json
ResponseBody: {
  "message": "Verification successful"
}
```

---

### 3. Sending an email to the user with a link for verification.

3.1. When registering a user:

- A verificationToken is created for the user and written to the database
  (package [uuid](https://www.npmjs.com/package/uuid) or
  [nanoid](https://www.npmjs.com/package/nanoid) is used to generate the
  verification token).
- An email is sent to the user's mail and the link for verification is specified
  mail (`/api/auth/verify/:verificationToken`) in the message.
- It is forbidden to authorize the user if the mail is not verified.

---

### 4. Resend the email to the user with the verification link.

It is necessary to provide for the possibility that the user may accidentally
delete the email, it may not reach the addressee for some reason, our service of
sending emails during registration gave an error, etc.

4.1. An endpoint [`/api/auth/verify/`](#resending-a-email-request) is created.

<details>
<summary>@ POST /api/auth/verify/</summary>

- Gets `body` in `{ email }` format.
- If `body` does not have a mandatory `email` field, returns json with the key
  `{"message": "missing required field email"}` and status `400`.
  [Bad Request](#resending-a-email-validation-error).
- If `body` is ok, it resends the email with the verificationToken to the
  specified email, but only if the user is not verified, and returns a json with
  the key `{"message": "Verification email sent"}` with status `200`
  [Ok](#resending-a-email-success-response).
- If the user has already been verified, it sends a json with the key
  `{ message: Verification has already been passed}` with status `400`
  [Bad Request](#resend-email-for-verified-user).

</details>

##### Resending a email request

```js
@POST /api/auth/verify/
Content-Type: application/json
RequestBody: {
  "email": "example@example.com"
}
```

##### Resending a email validation error

```js
Status: 400 Bad Request
Content-Type: application/json
ResponseBody: <Error from Joi or other validation library>
```

##### Resending a email success response

```js
Status: 200 Ok
Content-Type: application/json
ResponseBody: {
  "message": "Verification email sent"
}
```

##### Resend email for verified user

```js
Status: 400 Bad Request
Content-Type: application/json
ResponseBody: {
  "message": "Verification has already been passed"
}
```
