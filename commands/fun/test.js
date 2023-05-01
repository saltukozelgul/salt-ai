const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("test")
    .setDescription("This is just a test"),
  async execute(interaction) {
    await interaction.reply("This is a testtt!");
  },
};
