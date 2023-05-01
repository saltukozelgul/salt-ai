const createUser = require("./create-user");

async function checkUser(userId, username, clientMongo) {
  // Check if the user exists in the database
  const user = await clientMongo
    .db("salt-ai")
    .collection("users")
    .findOne({ userId: userId });
  // If the user does not exist, create a new user
  if (!user) {
    console.log("Created new user for " + username);
    await createUser(userId, username, clientMongo);
  }
}

module.exports = { checkUser };
