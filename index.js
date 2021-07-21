const discord = require("discord.js");
const client = new discord.Client()
const { prefix, ServerID } = require("./config.json")
const config = require('./config.json');

client.on("ready", () => {

    console.log("Bot online")
    client.user.setActivity("Viendo mis MD's")
})



client.on("channelDelete", (channel) => {
    if (channel.parentID == channel.guild.channels.cache.find((x) => x.name == "MODMAIL").id) {
        const person = channel.guild.members.cache.find((x) => x.id == channel.name)

        if (!person) return;

        let yembed = new discord.MessageEmbed()
            .setAuthor("MAIL DELETED", client.user.displayAvatarURL())
            .setColor('RED')
            .setDescription("Your mail was deleted by a staff member!")
        return person.send(yembed)

    }
  

})





client.on("message", async message => {
    if (message.author.bot) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    let command = args.shift().toLowerCase();


    if (message.guild) {

        if (command == "mod-mail") {
            if (!message.content.startsWith(prefix)) return;
            if (!message.member.hasPermission("ADMINISTRATOR")) {
                return message.channel.send(":x: | ¡Necesitas permisos de administrador para configurar el sistema de modmail!")
            }

            if (!message.guild.me.hasPermission("ADMINISTRATOR")) {
                return message.channel.send(":x: ¡Necesito permisos de administrador para configurar el sistema modmail!")
            }


            let role = message.guild.roles.cache.find((x) => x.name == "Staff")
            let everyone = message.guild.roles.cache.find((x) => x.name == "@everyone")

            if (!role) {
                role = await message.guild.roles.create({
                    data: {
                        name: "Staff",
                        color: "YELLOW"
                    },
                    reason: "Rol necesario para el sistema ModMail"
                })
            }

            await message.guild.channels.create("MODMAIL", {
                type: "category",
                topic: "El correo estara aqui.",
                permissionOverwrites: [
                    {
                        id: role.id,
                        allow: ["VIEW_CHANNEL", "SEND_MESSAGES", "READ_MESSAGE_HISTORY"]
                    },
                    {
                        id: everyone.id,
                        deny: ["VIEW_CHANNEL", "SEND_MESSAGES", "READ_MESSAGE_HISTORY"]
                    }
                ]
            })


            return message.channel.send("La configuración está completa ✅")

        } else if (command == "close") {
            if (!message.content.startsWith(prefix)) return;
            if (!message.member.roles.cache.find((x) => x.name == "Staff")) {
                return message.channel.send(":x: | Necesita el rol de Staff para usar este comando")
            }
            if (message.channel.parentID == message.guild.channels.cache.find((x) => x.name == "MODMAIL").id) {

                const person = message.guild.members.cache.get(message.channel.name)

                if (!person) {
                    return message.channel.send(":x: | No puedo cerrar el canal y este error se produce porque probablemente se cambió el nombre del canal.")
                }

                await message.channel.delete()

                let yembed = new discord.MessageEmbed()
                    .setAuthor("Maid Cerrado", client.user.displayAvatarURL())
                    .setColor("RED")
                    .setThumbnail(client.user.displayAvatarURL())
                    .setFooter("El correo está cerrado por " + message.author.username)
                if (args[0]) yembed.setDescription(`Reason: ${args.join(" ")}`)

                return person.send(yembed)

            }
        } else if (command == "open") {
            if (!message.content.startsWith(prefix)) return;
            const category = message.guild.channels.cache.find((x) => x.name == "MODMAIL")

            if (!category) {
                return message.channel.send(":x: | El sistema de moderación no está configurado en este servidor, use " + prefix + "setup")
            }

            if (!message.member.roles.cache.find((x) => x.name == "Staff")) {
                return message.channel.send(":x: | Necesita el rol `Staff` para usar este comando")
            }

            if (isNaN(args[0]) || !args.length) {
                return message.channel.send(":x: | Proporcione el ID de la persona")
            }

            const target = message.guild.members.cache.find((x) => x.id === args[0])

            if (!target) {
                return message.channel.send(":x: | No se pudo encontrar a esta persona.")
            }


            const channel = await message.guild.channels.create(target.id, {
                type: "text",
                parent: category.id,
                topic: "El correo es abierto directamente por **" + message.author.username + "** para hacer contacto con " + message.author.tag
            })

            let nembed = new discord.MessageEmbed()
                .setAuthor("DETAILS", target.user.displayAvatarURL({ dynamic: true }))
                .setColor("BLUE")
                .setThumbnail(target.user.displayAvatarURL({ dynamic: true }))
                .setDescription(message.content)
                .addField("Name", target.user.username)
                .addField("Account Creation Date", target.user.createdAt)
                .addField("Direct Contact", "Sí (significa que este correo lo abre un personal)");

            channel.send(nembed)

            let uembed = new discord.MessageEmbed()
                .setAuthor("DIRECT MAIL OPENED")
                .setColor("GREEN")
                .setThumbnail(client.user.displayAvatarURL())
                .setDescription("Ha sido contactado por personal de **" + message.guild.name + "**,¡Espere hasta que le envíe otro mensaje!");


            target.send(uembed);

            let newEmbed = new discord.MessageEmbed()
                .setDescription("Abrió el correo: <#" + channel + ">")
                .setColor("GREEN");

            return message.channel.send(newEmbed);
        } else if (command == "help") {
            if (!message.content.startsWith(prefix)) return;
            let embed = new discord.MessageEmbed()
                .setAuthor('MODMAIL BOT') 
                .addField("$setup", "Configure el sistema modmail (esto no es para varios servidores).", true)

                .addField("$open", 'Le permite abrir el correo para contactar a cualquier persona con su ID', true)
                .setThumbnail(client.user.displayAvatarURL())
                .addField("$close", "Cierra el correo en el que usas este comando.", true);

            return message.channel.send(embed)

        }
    }







    if (message.channel.parentID) {

        const category = message.guild.channels.cache.find((x) => x.name == "MODMAIL")

        if (message.channel.parentID == category.id) {
            let member = message.guild.members.cache.get(message.channel.name)

            if (!member) return message.channel.send(':x: | No se puede enviar el mensaje')

            let lembed = new discord.MessageEmbed()
                .setColor("GREEN")
                .setAuthor(message.author.username, message.author.displayAvatarURL({ dynamic: true }))
                .setDescription(message.content)

            return member.send(lembed)
        }


    }

    if (!message.guild) {
        const guild = await client.guilds.cache.get(ServerID) || await client.guilds.fetch(ServerID).catch(m => { })
        if (!guild) return;
        const category = guild.channels.cache.find((x) => x.name == "MODMAIL")
        if (!category) return;
        const main = guild.channels.cache.find((x) => x.name == message.author.id)


        if (!main) {
            let mx = await guild.channels.create(message.author.id, {
                type: "text",
                parent: category.id,
                topic: "Este correo está creado para ayudar **" + message.author.tag + " **"
            })

            let sembed = new discord.MessageEmbed()
                .setAuthor("MAIL OPENED")
                .setColor("GREEN")
                .setThumbnail(client.user.displayAvatarURL())
                .setDescription("La conversación ha comenzado, pronto será contactado por el Staff.")

            message.author.send(sembed)


            let eembed = new discord.MessageEmbed()
                .setAuthor("DETAILS", message.author.displayAvatarURL({ dynamic: true }))
                .setColor("BLUE")
                .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
                .setDescription(message.content)
                .addField("Name", message.author.username)
                .addField("Account Creation Date", message.author.createdAt)
                .addField("Direct Contact", "No (significa que este correo lo abre una persona, no un miembro del Staff)")


            return mx.send(eembed)
        }

        let xembed = new discord.MessageEmbed()
            .setColor("RED")
            .setAuthor(message.author.tag, message.author.displayAvatarURL({ dynamic: true }))
            .setDescription(message.content)


        main.send(xembed)

    }




})


client.login(process.env.TOKEN)
