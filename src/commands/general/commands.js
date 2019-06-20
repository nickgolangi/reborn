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
const { Command } = require('patron.js');
const registry = require('../../services/registry.js');
const discord = require('../../utilities/discord.js');

module.exports = new class Commands extends Command {
  constructor() {
    super({
      description: 'View the current commands.',
      groupName: 'general',
      names: ['commands', 'cmds']
    });
  }

  async run(msg) {
    const { groups } = registry;
    const embed = {
      title: 'The current commands',
      fields: []
    };

    for (let i = 0; i < groups.length; i++) {
      embed.fields.push({
        name: groups[i].name, value: '', inline: true
      });

      for (let j = 0; j < groups[i].commands.length; j++) {
        const command = groups[i].commands[j];

        embed.fields[embed.fields.length - 1].value += command.names[0];

        if (j !== groups[i].commands.length - 1 && groups[i].commands.length - 1 !== 1) {
          embed.fields[embed.fields.length - 1].value += ',';
        }

        if (j + 1 === groups[i].commands.length - 1) {
          embed.fields[embed.fields.length - 1].value += ' and ';
        }
      }
    }

    await msg.channel.createMessage(discord.embed(embed));
  }
}();
