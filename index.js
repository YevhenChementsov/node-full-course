const contacts = require("./contacts");
const { program } = require("commander");

program
  .option("-a, --action <type>", "choose action")
  .option("-i, --id <type>", "user id")
  .option("-n, --name <type>", "user name")
  .option("-e, --email <type>", "user email")
  .option("-p, --phone <type>", "user phone");

program.parse();

const options = program.opts();

const invokeAction = async ({ action, id, name, email, phone }) => {
  switch (action) {
    case "list":
      const listOfContacts = await contacts.getListOfContacts();
      return console.table(listOfContacts);

    case "get":
      const contact = await contacts.getContactById(id);
      return console.log(contact);

    case "add":
      const newContact = await contacts.addContact({name, email, phone});
      return console.log(newContact);

    case "delete":
      const deleteContact = await contacts.deleteContact(id);
      return console.log(deleteContact);

    case "update":
      const updateContact = await contacts.updateContactById(id, {name, email, phone});
      return console.log(updateContact);

    default:
      console.warn("\x1B[31m Unknown action type!");
  }
}

invokeAction(options);