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
const empty_argument = Symbol('Empty Argument');
const max_msg_len = 1900;

module.exports = new class Laws extends Command {
  constructor() {
    super({
      args: [
        new Argument({
          example: '2',
          key: 'name',
          name: 'name',
          type: 'string',
          defaultValue: empty_argument,
          remainder: true
        })
      ],
      description: 'View the current laws.',
      groupName: 'general',
      names: ['laws']
    });
  }

  async run(msg, args) {
    let laws = db.fetch_laws(msg.channel.guild.id);

    if (!laws.length) {
      return CommandResult.fromError('There are no active laws.');
    }

    if (args.name !== empty_argument) {
      laws = laws.find(x => x.name.toLowerCase() === args.name.toLowerCase());

      if (!laws) {
        return CommandResult.fromError('This law does not exist.');
      } else if (laws.active === 0) {
        return CommandResult.fromError('This law is no longer active.');
      }

      laws = [laws];
    }

    await this.send_laws(msg, laws.filter(x => x.active === 1));
  }

  async send_laws(msg, laws) {
    let reply = '';

    for (let i = 0; i < laws.length; i++) {
      const { name, content, mandatory_felony } = laws[i];
      const message = `**${name}**: ${content}${mandatory_felony ? ' (felony)' : ''}\n`;

      if ((content + message).length >= max_msg_len) {
        await discord.create_msg(msg.channel, {
          title: 'Laws of the land',
          description: content
        });
        reply = '';
      } else {
        reply += message;
      }
    }

    if (reply) {
      await discord.create_msg(msg.channel, {
        title: 'Laws of the land',
        description: reply
      });
    }
  }
}();
