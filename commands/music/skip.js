const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("atla")
    .setDescription("Çalan şarkıyı atlar"),

  async execute(interaction) {
    await interaction.deferReply();

    // get the queue
    const queue = interaction.client.distube.getQueue(interaction);

    // if no queue, return error
    if (!queue) return interaction.followUp("Çalan şarkı yok!");

    // if only one song in the queue, return error
    if (queue.songs.length === 1)
      return await interaction.client.distube.stop(interaction);

    await interaction.client.distube.skip(interaction);

    await interaction.followUp("Şarkı atlandı!");
  },
};
