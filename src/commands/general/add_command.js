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
const { Argument, Command, CommandResult } = require('patron.js');
const db = require('../../services/database.js');
const discord = require('../../utilities/discord.js');

module.exports = new class AddCommand extends Command {
  constructor() {
    super({
      preconditions: ['max_custom_cmds'],
      args: [
        new Argument({
          example: '"johns genitals"',
          key: 'name',
          name: 'name',
          type: 'string',
          preconditions: ['conflicting_cmd']
        }),
        new Argument({
          example: 'are microscopic',
          key: 'response',
          name: 'response',
          type: 'string',
          remainder: true
        })
      ],
      description: 'Adds a custom command.',
      groupName: 'general',
      names: ['add_command', 'create_command', 'add_cmd']
    });
  }

  async run(msg, args) {
    const cmds = db.fetch_commands(msg.channel.guild.id);
    const lower = args.name.toLowerCase();

    if (cmds.some(x => x.name.toLowerCase() === lower && x.active === 1)) {
      return CommandResult.fromError('A custom command by this name already exists.');
    }

    const sanitized = args.response.replace(/@(everyone|here|!?\d{17,19})/g, '@\u200b$1');
    const update = {
      guild_id: msg.channel.guild.id,
      creator_id: msg.author.id,
      name: args.name,
      response: sanitized
    };

    if (msg.attachments.length) {
      update.image = msg.attachments[0].proxy_url;
    }

    db.insert('commands', update);
    await discord.create_msg(
      msg.channel, `I've created a custom command with the name ${args.name}.`
    );
  }
}();
