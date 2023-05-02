const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("atla")
    .setDescription("Çalan şarkıyı atlar"),

  async execute(interaction) {
    await interaction.reply("This is a testtt!");
  },
};
