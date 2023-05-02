// Define a function that creates a user in the database
async function createUser(userId, username, clientMongo) {
  // Create a new user in the database
  await clientMongo
    .db("salt-ai")
    .collection("users")
    .insertOne({
      userId: userId,
      username: username,
      balance: 0,
      win: 1,
      loss: 1,
      lastCollected: null,
      company: {
        name: "",
        income: 0,
        employees: [],
        level: 0,
      },
    });
  console.log("Created a new user in the database.");
}

module.exports = createUser;
