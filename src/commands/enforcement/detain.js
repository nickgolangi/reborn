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
const { Argument, Command } = require('patron.js');
const catch_discord = require('../../utilities/catch_discord.js');
const client = require('../../services/client.js');
const db = require('../../services/database.js');
const discord = require('../../utilities/discord.js');
const addRole = catch_discord(client.addGuildMemberRole.bind(client));

module.exports = new class Detain extends Command {
  constructor() {
    super({
      preconditions: ['can_jail'],
      args: [
        new Argument({
          example: 'Nͥatͣeͫ763#0554',
          key: 'user',
          name: 'user',
          type: 'user',
          remainder: true
        })
      ],
      description: 'Detain a citizen.',
      groupName: 'enforcement',
      names: ['detain']
    });
  }

  async run(msg, args) {
    const prefix = `**${discord.tag(msg.author)}**, `;
    const verified = await discord.verify_msg(msg, `${prefix}**Warning:** Handing out false \
detainments will result in impeachment. Type \`I'm sure\` if you are sure you want to detain.`);

    if (!verified) {
      return;
    }

    const { jailed_role } = db.fetch('guilds', { guild_id: msg.channel.guild.id });
    const member = msg.channel.guild.members.get(args.user.id);

    if (member) {
      await addRole(msg.channel.guild.id, args.user.id, jailed_role);
    }

    db.insert('detainments', {
      guild_id: msg.channel.guild.id,
      defendant_id: args.user.id,
      officer_id: msg.author.id
    });
    await discord.create_msg(msg.channel, `${prefix}I have detained ${args.user.mention}.`);
  }
}();
