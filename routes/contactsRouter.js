const express = require("express");

const ctrl = require("../controllers/contactsControllers.js")

const contactsRouter = express.Router();

contactsRouter.get("/", ctrl.getAllContacts);

contactsRouter.get("/:id", ctrl.getOneContact);

contactsRouter.post("/", ctrl.createContact);

contactsRouter.put("/:id", ctrl.updateContact);

contactsRouter.delete("/:id", ctrl.deleteContact);

module.exports = contactsRouter;