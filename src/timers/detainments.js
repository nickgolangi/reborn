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
const removeRole = catch_discord(client.removeGuildMemberRole);

Timer(() => {
  const pending = db.fetch_pending_detainments();

  for(let i = 0; i < pending.length; i++) {
    const {officer_role, jailed_role} = db.fetch("guilds", {guild_id: pending[i].guild_id});
    const guild = client.guilds.get(pending[i].guild_id);
    const o_role = guild.roles.get(officer_role);
    const j_role = guild.roles.get(jailed_role);

    if(guild === undefined || officer_role === undefined || o_role === undefined || !discord.usable_role(guild, o_role)
        || jailed_role === undefined || j_role === undefined || !discord.usable_role(guild, j_role))
      return db.serve_detainment(pending[i].id);

    const defendant = guild.members.get(pending[i].defendant_id);
    const officer = guild.members.get(pending[i].officer_id);

    if(defendant !== undefined) {
      if(defendant.roles.includes(jailed_role))
        removeRole(guild.id, pending[i].defendant_id, jailed_role);

      if(officer !== undefined && officer.roles.includes(officer_role))
        removeRole(guild.id, pending[i].officer_id, officer_role);
    }

    db.serve_detainment(pending[i].id);
  }
}, config.detain_time / 10);
