const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("duraklat")
    .setDescription("Çalan şarkıyı duraklatır"),

  async execute(interaction) {
    await interaction.reply("This is a testtt!");
  },
};
