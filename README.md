**Читать на других языках: [Українська](./docs/README.ua.md),
[English](./docs/README.en.md).**

# Аутентификация / Авторизация пользователя через JWT токен.

---

Создание коллекции пользователей users. Добавление логики
аутентификации/авторизации пользователя с помощью JWT токена. Получение данных
юзера по токену. Фильтрация и пагинация контактов. Обновление подписки
пользователя.

---

### 1. Создание схемы и модели пользователя для коллекции users.

В коде создается схема и модель пользователя для коллекции users.

```js
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

Чтобы каждый пользователь работал и видел только свои контакты в схеме контактов
добавляется свойство `owner`.

```js
owner: {
  type: Schema.Types.ObjectId,
  ref: 'user',
}
```

> Примечание: 'user' - название коллекции (в единственном числе), в которой
> хранятся пользователи.

---
