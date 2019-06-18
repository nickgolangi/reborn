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
'use strict';
const client = require('../services/client.js');
const catch_discord = require('../utilities/catch_discord.js');
const db = require('../services/database.js');
const remove_role = catch_discord(client.removeGuildMemberRole.bind(client));

client.on('guildMemberUpdate', async (guild, new_member, old_member) => {
  if (new_member.roles.length === old_member.roles.length) {
    return;
  }

  const { officer_role: officer, judge_role: judge } = db.fetch('guilds', { guild_id: guild.id });
  const g_officer = guild.roles.get(officer);
  const g_judge = guild.roles.get(judge);

  if (!officer || !officer || !g_judge || !g_officer) {
    return;
  }

  const { roles: o_roles } = old_member;
  const { roles: n_roles } = new_member;

  if (o_roles.includes(officer) && n_roles.includes(officer) && n_roles.includes(judge)) {
    await remove_role(guild.id, new_member.id, judge, 'Holding 2 job positions at once');
  } else if (o_roles.includes(judge) && n_roles.includes(judge) && n_roles.includes(officer)) {
    await remove_role(guild.id, new_member.id, officer, 'Holding 2 job positions at once');
  }
});
