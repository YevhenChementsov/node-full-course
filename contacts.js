const fs = require("fs/promises");
const path = require("path");

const contactsPath = path.join(__dirname, "db", "contacts.json");

const getListOfContacts = async () => {
  const data = await fs.readFile(contactsPath);

	return JSON.parse(data);
}

const getContactById = async (contactId) => {
  
}

const addContact = async (name, email, phone) => {
  
}

const removeContact = async (contactId) => {
  
}

const updateContactById = async (contactId, name, email, phone) => {
  
}

module.exports = {
	getListOfContacts,
	getContactById,
	addContact,
	removeContact,
	updateContactById
}