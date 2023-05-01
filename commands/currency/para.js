const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("para")
    .setDescription("Ne kadar paraya sahip olduğunuzu gösterir"),
  async execute(interaction) {
    await interaction.reply("Pong!");
  },
};
