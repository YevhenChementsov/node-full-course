const fs = require('fs/promises');
const { nanoid } = require('nanoid');

const contactsPath = require('../db');

const getListOfContacts = async () => {
  const data = await fs.readFile(contactsPath);

  return JSON.parse(data);
};

const getContactById = async id => {
  const data = await getListOfContacts();
  const contact = data.find(item => item.id === id);

  return contact || null;
};

const addContact = async data => {
  const contacts = await getListOfContacts();
  const newContact = {
    id: nanoid(),
    ...data,
  };
  contacts.push(newContact);
  await fs.writeFile(contactsPath, JSON.stringify(contacts, null, 2));

  return newContact;
};

const deleteContact = async id => {
  const contacts = await getListOfContacts();
  const index = contacts.findIndex(item => item.id === id);
  if (index === -1) {
    return null;
  }
  const [contact] = contacts.splice(index, 1);
  await fs.writeFile(contactsPath, JSON.stringify(contacts, null, 2));

  return contact;
};

const updateContactById = async (id, data) => {
  const contacts = await getListOfContacts();
  const index = contacts.findIndex(item => item.id === id);
  if (index === -1) {
    return null;
  }
  contacts[index] = { id, ...data };
  await fs.writeFile(contactsPath, JSON.stringify(contacts, null, 2));

  return contacts[index];
};

module.exports = {
  getListOfContacts,
  getContactById,
  addContact,
  deleteContact,
  updateContactById,
};
