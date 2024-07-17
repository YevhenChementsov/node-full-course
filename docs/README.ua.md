**Читати іншими мовами: [Русский](../README.md), [English](./README.en.md).**

# Аутентифікація / Авторизація користувача через JWT токен.

---

Створення колекції користувачів users. Додавання логіки
аутентифікації/авторизації користувача за допомогою JWT токена. Отримання даних
юзера за токеном. Фільтрація та пагінація контактів. Оновлення підписки
користувача.

---

### 1. Створення схеми та моделі користувача для колекції users.

У коді створюється схема і модель користувача для колекції users.

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

Щоб кожен користувач працював і бачив тільки свої контакти, у схемі контактів
додається властивість `owner`.

```js
owner: {
  type: Schema.Types.ObjectId,
  ref: 'user',
}
```

> Примітка: 'user' - назва колекції (в однині), в якій зберігаються користувачі.

---
