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

module.exports = new class Grant extends Command {
  constructor() {
    super({
      preconditions: ['judges'],
      args: [
        new Argument({
          example: '2',
          key: 'warrant',
          name: 'id',
          type: 'warrant'
        })
      ],
      description: 'Grants an arrest warrant request.',
      groupName: 'courts',
      names: ['grant', 'grant_arrest_warrant']
    });
  }

  async run(msg, args) {
    const { warrant_channel } = db.fetch('guilds', { guild_id: msg.channel.guild.id });

    if (!warrant_channel) {
      return CommandResult.fromError('The warrant channel needs to be set up.');
    }

    const verified = await discord.verify_msg(
      msg, `**${discord.tag(msg.author)}**, **Warning:** Granting false request warrants will \
result in impeachment. Type \`I'm sure\` if you are sure you want to grant this warrant.`
    );

    if (!verified) {
      return CommandResult.fromError('The command has been cancelled.');
    }

    db.approve_warrant(args.warrant.id, msg.author.id);
    await discord.create_msg(
      msg.channel,
      `**${discord.tag(msg.author)}**, You've granted warrant ${args.warrant.id}.`
    );
  }
}();
