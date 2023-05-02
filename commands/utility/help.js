const {
  SlashCommandBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("yardım")
    .setDescription("Yardım menüsünü açar"),
  async execute(interaction) {
    await interaction.deferReply();

    // Create a menu and customize it a bit
    const select = new StringSelectMenuBuilder()
      .setCustomId("starter")
      .setPlaceholder("Make a selection!")
      .addOptions(
        new StringSelectMenuOptionBuilder()
          .setLabel("Müzik")
          .setDescription("Müzik komutları için yardım menüsü.")
          .setValue("music"),
        new StringSelectMenuOptionBuilder()
          .setLabel("Ekonimi")
          .setDescription("Ekonomik komutlar için yardım menüsü.")
          .setValue("economic")
      );

    // Send the menu
    const row = new ActionRowBuilder().addComponents(select);

    await interaction.followUp({
      content: "Here's a menu!",
      components: [row],
    });

    try {
      const confirmation = await interaction.channel.awaitMessageComponent({
        filter: (i) => i.user.id === interaction.user.id,
        time: 60000,
      });

      let uptadedEmbed;
      if (confirmation.values[0] === "music") {
        uptadedEmbed = {
          color: 0x0099ff,
          title: "Müzik Komutları",
          description: "Müzik komutları için yardım menüsü.",
          fields: [
            {
              name: "``/oynat``",
              value: "Müzik çalar.",
            },
            {
              name: "``/durdur``",
              value: "Müziği durdurur.",
            },
            {
              name: "``/duraklat``",
              value: "Müziği duraklatır.",
            },
            {
              name: "``/devam``",
              value: "Müziği devam ettirir.",
            },
            {
              name: "``/atla``",
              value: "Müziği atlar.",
            },
            {
              name: "``/sıra``",
              value: "Müzik sırasını gösterir.",
            },
          ],
        };
      } else if (confirmation.values[0] === "economic") {
        uptadedEmbed = {
          color: 0x0099ff,
          title: "Ekonomik Komutlar",
          description: "Ekonomik komutlar için yardım menüsü.",
          fields: [
            {
              name: "``/topla``",
              value: "Günlük paranızı toplarsınız.",
            },
            {
              name: "``/para``",
              value: "Paranızı gösterir.",
            },
            {
              name: "``/şirket kur``",
              value: "Şirketinizi kurarsınız.",
            },
            {
              name: "``/şirket bilgi``",
              value: "Şirketinizin bilgilerini gösterir.",
            },
            {
              name: "``/şirket geliştir``",
              value: "Şirketinizi geliştirir.",
            },
            {
              name: "``/şirket topla``",
              value: "Şirketinizden para toplarsınız.",
            },
            {
              name: "``/şirket işe-al``",
              value: "Şirketinize işçi alırsınız.",
            },
          ],
        };
      }

      await confirmation.update({
        // embed
        embeds: [uptadedEmbed],
        components: [row],
      });
    } catch (err) {
      console.log(err);
      await interaction.followUp({
        content: "Zaman aşımına uğradı!",
        ephemeral: true,
      });
    }
  },
};
