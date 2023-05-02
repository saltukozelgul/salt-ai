const { SlashCommandBuilder } = require("discord.js");
const { createUser } = require("../../db-utils/create-user");
const { checkUser } = require("../../db-utils/check-user");
module.exports = {
  data: new SlashCommandBuilder()
    .setName("topla")
    .setDescription("Günlük paranızı toplar"),
  async execute(interaction, mongoClient) {
    try {
      await mongoClient.connect();
    } catch (e) {
      console.error(e);
    }
    await checkUser(
      interaction.user.id,
      interaction.user.username,
      mongoClient
    );
    const user = await mongoClient
      .db("salt-ai")
      .collection("users")
      .findOne({ userId: interaction.user.id });
    if (user.lastCollected === null) {
      await interaction.reply(`Günlük paranızı topladınız: 250₺`);
      await mongoClient
        .db("salt-ai")
        .collection("users")
        .updateOne(
          { userId: interaction.user.id },
          {
            $set: {
              lastCollected: new Date(),
              balance: user.balance + 250,
            },
          }
        );
    } else {
      const lastCollected = new Date(user.lastCollected);
      const now = new Date();
      const diffTime = Math.abs(now - lastCollected);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays >= 1) {
        await interaction.reply(`Günlük paranızı topladınız: 250₺`);
        await mongoClient
          .db("salt-ai")
          .collection("users")
          .updateOne(
            { userId: interaction.user.id },
            {
              $set: {
                lastCollected: new Date(),
                balance: user.balance + 250,
              },
            }
          );
      } else {
        await interaction.reply(`Günlük paranızı zaten topladınız`);
      }
    }
    await mongoClient.close();
  },
};
