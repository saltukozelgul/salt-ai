const { SlashCommandBuilder } = require("discord.js");
const { createUser } = require("../../db-utils/create-user");
const { checkUser } = require("../../db-utils/check-user");
module.exports = {
  data: new SlashCommandBuilder()
    .setName("şirket")
    .setDescription("Ne kadar paraya sahip olduğunuzu gösterir")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("kur")
        .setDescription("Şirket kurar")
        .addStringOption((option) =>
          option
            .setName("şirket-adı")
            .setDescription("Şirketin adını belirler")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand.setName("bilgi").setDescription("Şirket bilgilerini gösterir.")
    )
    .addSubcommand((subcommand) =>
      subcommand.setName("geliştir").setDescription("Şirketi geliştirir.")
    )
    .addSubcommand((subcommand) =>
      subcommand.setName("işe-al").setDescription("Şirketinize çalışan alır.")
    ),
  async execute(interaction, mongoClient) {
    let user;
    try {
      await mongoClient.connect();
      checkUser(interaction.user.id, interaction.user.username, mongoClient);
      user = await mongoClient
        .db("salt-ai")
        .collection("users")
        .findOne({ userId: interaction.user.id });
    } catch (e) {
      console.error(e);
    }

    if (interaction.options.getSubcommand() === "kur") {
      console.log(user);
      if (user.company.name != "") {
        await interaction.reply(`Zaten bir şirketiniz var`);
        await mongoClient.close();
        return;
      }
      if (user.balance < 1000) {
        await interaction.reply(`Yeterli paranız yok gerekli para: 1000₺`);
      } else {
        const companyName = interaction.options.getString("şirket-adı");
        if (companyName == "") {
          await interaction.reply(`Şirket adı boş olamaz`);
          await mongoClient.close();
          return;
        }
        const company = {
          name: companyName,
          income: 0,
          employees: [],
          level: 1,
        };
        // update the user's company and balance
        await mongoClient
          .db("salt-ai")
          .collection("users")
          .updateOne(
            { userId: interaction.user.id },
            { $set: { company: company, balance: user.balance - 1000 } }
          );
        await interaction.reply(`Şirket kuruldu`);
      }
    } else if (interaction.options.getSubcommand() === "bilgi") {
      // Create embed with user's company information
      const companyEmbed = {
        color: 0x0099ff,
        // set first letter of company name to uppercase
        title: `${
          user.company.name.charAt(0).toUpperCase() + user.company.name.slice(1)
        }`,
        thumbnail: {
          url: "https://i.hizliresim.com/ll9by4v.png",
        },
        fields: [
          {
            name: "Gelir",
            value: `${user.company.income}₺`,
            inline: false,
          },
          {
            name: "Çalışan Sayısı",
            value: `${user.company.employees.length}`,
            inline: false,
          },
          {
            name: "Seviye",
            value: `${user.company.level}`,
            inline: false,
          },
        ],
        timestamp: new Date(),
        footer: {
          text: "Salt.AI - Şirket Sistemi",
        },
      };
      await interaction.reply({ embeds: [companyEmbed] });
    } else if (interaction.options.getSubcommand() === "topla") {
      // Check if user has a company
      if (user.company.name == "") {
        await interaction.reply(`Önce bir şirket kurmanız gerekli.`);
        await mongoClient.close();
        return;
      }
      // Check if 24h cooldown has passed
      if (user.company.lastCollected != null) {
        const now = new Date();
        const diff = Math.abs(now - user.company.lastCollected);
        const minutes = Math.floor(diff / 60000);
        if (minutes < 1440) {
          await interaction.reply(
            `Şirketinizin gelirini toplamak için ${
              1440 - minutes
            } dakika beklemeniz gerekli.`
          );
          await mongoClient.close();
          return;
        }
      }
      // Update company's lastCollected
      await mongoClient
        .db("salt-ai")
        .collection("users")
        .updateOne(
          { userId: interaction.user.id },
          {
            $set: {
              "company.lastCollected": new Date(),
            },
          }
        );
      // Update user's balance
      await mongoClient
        .db("salt-ai")
        .collection("users")
        .updateOne(
          { userId: interaction.user.id },
          { $set: { balance: user.balance + user.company.income } }
        );
      await interaction.reply(
        `Şirketinizin geliri toplandı. Gelir: ${user.company.income}₺`
      );
    } else if (interaction.options.getSubcommand() === "geliştir") {
      // Check if user has a company
      if (user.company.name == "") {
        await interaction.reply(`Önce bir şirket kurmanız gerekli.`);
        await mongoClient.close();
        return;
      }
      // Check if user has enough money
      if (user.balance < 1000 * user.company.level) {
        await interaction.reply(
          `Yeterli paranız yok gerekli para: ${1000 * user.company.level}₺`
        );
        await mongoClient.close();
        return;
      }
      // Update company's level and user's balance on single query
      await mongoClient
        .db("salt-ai")
        .collection("users")
        .updateOne(
          { userId: interaction.user.id },
          {
            $set: {
              balance: user.balance - 1000 * user.company.level,
              "company.level": user.company.level + 1,
            },
          }
        );
      await interaction.reply(
        `Şirketiniz geliştirildi. Yeni seviye: ${user.company.level + 1}`
      );
    }

    await mongoClient.close();
  },
};
