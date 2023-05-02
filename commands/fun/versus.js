const { SlashCommandBuilder, AttachmentBuilder } = require("discord.js");
const { createUser } = require("../../db-utils/create-user");
const { checkUser } = require("../../db-utils/check-user");
const { createCanvas, loadImage } = require("canvas");
let background = null;
module.exports = {
  data: new SlashCommandBuilder()
    .setName("savaş")
    .setDescription("Etiketlediğiniz kişiyle savaşırsınız")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("Savaşmak istediğiniz kişiyi etiketleyin")
        .setRequired(true)
    ),

  async execute(interaction, mongoClient) {
    // Database connection
    try {
      await mongoClient.connect();
    } catch (e) {
      console.error(e);
    }
    // Check if the user exists in the database and create if not
    await checkUser(
      interaction.user.id,
      interaction.user.username,
      mongoClient
    );
    await checkUser(
      interaction.options.getUser("user").id,
      interaction.options.getUser("user").username,
      mongoClient
    );
    // Get the user from the database
    const user = await mongoClient
      .db("salt-ai")
      .collection("users")
      .findOne({ userId: interaction.user.id });
    const oppenent = await mongoClient
      .db("salt-ai")
      .collection("users")
      .findOne({ userId: interaction.options.getUser("user").id });

    // Create a canvas that has black background and have 2 avatar images
    // on the left and right side of the canvas
    const canvas = createCanvas(700, 250);
    let ctx = canvas.getContext("2d");
    // dynamic background
    background = await loadImage(
      "https://media.istockphoto.com/id/1331309597/vector/realistic-arena-for-warrior-battles-background-for-games-digital-graphics.jpg?s=612x612&w=0&k=20&c=erwpPJx00sUqpLkhLFNv_q1g_DRUUvDIc32kKC8dhm8="
    );

    const avatar1 = await loadImage(
      interaction.user
        .displayAvatarURL({ size: 512, dynamic: true })
        .replace("webp", "png")
    );
    const avatar2 = await loadImage(
      interaction.options
        .getUser("user")
        .displayAvatarURL({ size: 512, dynamic: true })
        .replace("webp", "png")
    );
    let wl1 = Number(user.win / user.loss).toFixed(2);
    let wl2 = Number(oppenent.win / oppenent.loss).toFixed(2);
    ctx = updateCanvas(
      ctx,
      canvas,
      avatar1,
      avatar2,
      150,
      150,
      0,
      "",
      wl1,
      wl2
    );

    // Create a buffer from the canvas and send it as an attachment
    // MessageAttachment is not a class dont use it
    const attachment = new AttachmentBuilder(canvas.toBuffer(), {
      name: "savaş.png",
    });
    await interaction.deferReply();
    await interaction.followUp({ files: [attachment] });

    // Every 1 second, update the canvas with new health values
    let health1 = 150;
    let health2 = 150;

    let turn = 0;
    let winner = null;
    let damage = 0;
    const interval = setInterval(async () => {
      if (turn === 0) {
        damage = getRandomInt(50);
        health2 -= damage;
        ctx = updateCanvas(
          ctx,
          canvas,
          avatar1,
          avatar2,
          health1,
          health2,
          damage,
          interaction.user.username,
          wl1,
          wl2
        );
        const attachment = new AttachmentBuilder(canvas.toBuffer(), {
          name: "savaş.png",
        });
        await interaction.editReply({ files: [attachment] });
        turn = 1;
      } else {
        damage = getRandomInt(50);
        health1 -= damage;
        ctx = updateCanvas(
          ctx,
          canvas,
          avatar1,
          avatar2,
          health1,
          health2,
          damage,
          interaction.options.getUser("user").username,
          wl1,
          wl2
        );
        const attachment = new AttachmentBuilder(canvas.toBuffer(), {
          name: "savaş.png",
        });
        await interaction.editReply({ files: [attachment] });
        turn = 0;
      }
      if (health1 <= 0) {
        winner = interaction.options.getUser("user").username;
        clearInterval(interval);
        await mongoClient
          .db("salt-ai")
          .collection("users")
          .updateOne({ userId: interaction.user.id }, { $inc: { loss: 1 } });
        await mongoClient
          .db("salt-ai")
          .collection("users")
          .updateOne(
            { userId: interaction.options.getUser("user").id },
            { $inc: { win: 1 } }
          );
        // Close the database connection
        await mongoClient.close();
      } else if (health2 <= 0) {
        winner = interaction.user.username;
        clearInterval(interval);
        await mongoClient
          .db("salt-ai")
          .collection("users")
          .updateOne({ userId: interaction.user.id }, { $inc: { win: 1 } });
        await mongoClient
          .db("salt-ai")
          .collection("users")
          .updateOne(
            { userId: interaction.options.getUser("user").id },
            { $inc: { loss: 1 } }
          );
        // Close the database connection
        await mongoClient.close();
      }
    }, 2000);
  },
};

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

function updateCanvas(
  ctx,
  canvas,
  avatar1,
  avatar2,
  health1,
  health2,
  damage,
  attackersName,
  wl1,
  wl2
) {
  ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
  ctx.drawImage(avatar1, 25, 25, 150, 150);
  ctx.drawImage(avatar2, 525, 25, 150, 150);
  // Draw damage text with red color
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "25px sans-serif";
  if (attackersName === "") {
    ctx.fillText(`    Savaş başlıyor!`, 235, 50);
  } else {
    ctx.fillText(`${attackersName.slice(0, 6)} ${damage} hasar verdi`, 235, 50);
  }
  if (health1 < 0) {
    health1 = 0;
    // Draw red border around the avatar
    ctx.strokeStyle = "#FF0000";
    ctx.lineWidth = 5;
    ctx.strokeRect(25, 25, 150, 150);
    // Draw green border around the avatar
    ctx.strokeStyle = "#00FF00";
    ctx.lineWidth = 5;
    ctx.strokeRect(525, 25, 150, 150);
    // Draw winner text
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "40px sans-serif";
    ctx.fillText("Kazanan: " + attackersName.slice(0, 6), 205, 150);
  }
  if (health2 < 0) {
    health2 = 0;
    // Draw red border around the avatar
    ctx.strokeStyle = "#FF0000";
    ctx.lineWidth = 5;
    ctx.strokeRect(525, 25, 150, 150);
    // Draw green border around the avatar
    ctx.strokeStyle = "#00FF00";
    ctx.lineWidth = 5;
    ctx.strokeRect(25, 25, 150, 150);
    // Draw winner text
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "40px sans-serif";
    ctx.fillText("Kazanan: " + attackersName.slice(0, 6), 205, 150);
  }
  // Draw health texts above bars
  ctx.fillStyle = "#FF0000";
  ctx.fillRect(25, 205, health1, 25);
  ctx.fillRect(525, 205, health2, 25);
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "20px sans-serif";
  ctx.fillText(`❤️ ${health1} W/L: ${wl1}`, 25, 197);
  ctx.fillText(`❤️ ${health2} W/L: ${wl2}`, 525, 197);

  return ctx;
}
