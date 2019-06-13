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
const catch_discord = require("../utilities/catch_discord.js");
const client = require("../services/client.js");
const {config} = require("../services/data.js");
const db = require("../services/database.js");
const discord = require("../utilities/discord.js");
const Timer = require("../utilities/timer.js");
const delete_channel = catch_discord(client.deleteChannel);
const remove_role = catch_discord(client.removeGuildMemberRole);

Timer(() => {
  const pending = db.fetch_pending_cases();

  for(let i = 0; i < pending.length; i++) {
    const {judge_role, jailed_role} = db.fetch("guilds", {guild_id: pending[i].guild_id});
    const guild = client.guilds.get(pending[i].guild_id);
    const o_role = guild.roles.get(judge_role);
    const j_role = guild.roles.get(jailed_role);

    if(guild === undefined || judge_role === undefined || o_role === undefined || !discord.usable_role(guild, o_role)
        || jailed_role === undefined || j_role === undefined || !discord.usable_role(guild, j_role))
      return;

    const defendant = guild.members.get(pending[i].defendant_id);
    const judge = guild.members.get(pending[i].judge_id);
    const channel = guild.channels.get(pending[i].channel_id);

    if(channel !== undefined)
      delete_channel(channel);

    if(defendant !== undefined) {
      if(defendant.roles.includes(jailed_role))
        remove_role(guild.id, pending[i].defendant_id, jailed_role);

      if(judge !== undefined && judge.roles.includes(judge_role))
        remove_role(guild.id, pending[i].judge_id, judge_role);
    }

    db.close_case(pending[i].id);
  }
}, config.max_case_time / 10);
