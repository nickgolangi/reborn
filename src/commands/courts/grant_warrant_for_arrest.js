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
const db = require("../../services/database.js");
const discord = require("../../utilities/discord.js");

module.exports = new class GrantWarrantForArrest extends Command {
  constructor() {
    super({
      args: [new Argument({
        example: "Murder",
        key: "law",
        name: "law",
        type: "law"
      }),
      new Argument({
        example: "John",
        key: "member",
        name: "member",
        type: "member",
        remainder: true
      })],
      description: "Grants a warrant to arrest a citizen.",
      groupName: "courts",
      names: ["grant_warrant_for_arrest"]
    });
  }

  async run(msg, args) {
    const {warrant_channel} = db.fetch("guilds", {guild_id: msg.channel.guild.id});

    if(warrant_channel === undefined)
      return;

    const verified = await discord.verify_msg(
      msg,
      "**Warning:** Handing out false warrants will result in impeachment. Type `I'm sure` if you are sure you want \
to grant this warrant."
    );

    if(!verified)
      return;

    db.insert("warrants", {
      guild_id: msg.channel.guild.id,
      law_id: args.law.id,
      defendant_id: args.member.id,
      judge_id: msg.author.id
    });
    await discord.create_msg(msg.channel, `I have set the Court category to ${args.channel.mention}.`);
  }
}();
