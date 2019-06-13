/**
 * Reborn - The core control of the only truly free and fair discord server.
 * Copyright (C) 2019  John Boyer
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
"use strict";
const {Argument, Command} = require("patron.js");
const catch_discord = require("../../utilities/catch_discord.js");
const client = require("../../services/client.js");
const db = require("../../services/database.js");
const discord = require("../../utilities/discord.js");
const create_channel = catch_discord(client.createChannel);

module.exports = new class Arrest extends Command {
  constructor() {
    super({
      args: [new Argument({
        example: "845",
        key: "warrant",
        name: "warrant",
        type: "warrant"
      }),
      new Argument({
        example: "Nͥatͣeͫ763#0554",
        key: "member",
        name: "member",
        type: "member",
        remainder: true
      })],
      description: "Arrest a citizen.",
      groupName: "enforcement",
      names: ["arrest"]
    });
  }

  async run(msg, args) {
    const {court_category, judge_role, officer_role} = db.fetch("guilds", {guild_id: msg.channel.guild.id});
    const o_role = msg.channel.guild.roles.get(officer_role);
    const category = msg.channel.guild.channels.get(court_category);

    if(officer_role === undefined || o_role === undefined || !discord.usable_role(msg.channel.guild, o_role)
        || court_category === undefined || category === undefined)
      return;

    const verified = await discord.verify_msg(
      msg,
      "**Warning:** Handing out false arrests will result in impeachment. Type `I'm sure` if you are sure you want \
to arrest."
    );

    if(!verified)
      return;

    const detainment = db.fetch("detainments", {
      guild_id: msg.channel.guild.id,
      defendant_id: args.member.id,
      served: false
    });

    if(detainment !== undefined)
      db.serve_detainment(detainment.id);

    let judge = msg.channel.guild.members.filter(mbr => mbr.roles.includes(judge_role));
    let officer = msg.channel.guild.members.filter(mbr => mbr.roles.includes(officer_role));

    if(judge.length > 1)
      judge.splice(judge.findIndex(mbr => mbr.id === args.warrant.judge_id), 1);

    if(officer.length > 1)
      officer.splice(officer.findIndex(mbr => mbr.id === detainment.officer_id), 1);

    judge = judge[Math.floor(Math.random() * judge.length)];
    officer = officer[Math.floor(Math.random() * officer.length)];

    const channel = await create_channel(
      msg.channel.guild.id,
      Math.random().toString(16).slice(-6),
      0,
      undefined,
      court_category
    );

    await Promise.all(
      channel.editPermission(judge.id, 2048, 0, "member"),
      channel.editPermission(officer.id, 2048, 0, "member"),
      channel.editPermission(args.member.id, 2048, 0, "member")
    );
    await discord.create_msg(
      channel,
      "**Judge Commands:**\n`!allow_in_court <member>` - allow a citizen to speak in this hearing\n\
`!kick_from_court <member>` - kick a citizen from this hearing\n\
`!guilty <opinion> [sentence]` - declare a guilty verdict\n\
`!innocent <opinion>` - declare an innocent verdict"
    );
    db.insert("cases", {
      guild_id: msg.channel.guild.id,
      channel_id: channel.id,
      warrant_id: args.warrant.id,
      defendant_id: args.member.id,
      judge_id: judge.id,
      plaintiff_id: officer.id
    });
    await discord.create_msg(msg.channel, `I have arrested ${args.user.mention}.`);
  }
}();
