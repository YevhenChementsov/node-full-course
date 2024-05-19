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
      // ... id
      return;

    case "add":
      // ... name email phone
      return;

    case "remove":
      // ... id
      return;

    case "update":
      // ... id name email phone

    default:
      console.warn("\x1B[31m Unknown action type!");
  }
}

invokeAction(options);