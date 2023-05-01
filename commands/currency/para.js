const { SlashCommandBuilder } = require("discord.js");
const { createUser } = require("../../db-utils/create-user");
const { checkUser } = require("../../db-utils/check-user");
module.exports = {
  data: new SlashCommandBuilder()
    .setName("para")
    .setDescription("Ne kadar paraya sahip olduğunuzu gösterir"),
  async execute(interaction, mongoClient) {
    try {
      await mongoClient.connect();
    } catch (e) {
      console.error(e);
    }
    // interaction.guild is the object representing the Guild in which the command was run
    await checkUser(
      interaction.user.id,
      interaction.user.username,
      mongoClient
    );
    const user = await mongoClient
      .db("salt-ai")
      .collection("users")
      .findOne({ userId: interaction.user.id });
    await interaction.reply(
      `Merhaba ${interaction.user.username}, şu anda ${user.balance} paraya sahipsin.`
    );
    await mongoClient.close();
  },
};
