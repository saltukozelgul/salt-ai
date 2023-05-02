const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("devam")
    .setDescription("Duraklatılan şarkıyı devam ettirir"),

  async execute(interaction) {
    await interaction.reply("This is a testtt!");
  },
};
