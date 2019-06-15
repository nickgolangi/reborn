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
const catch_discord = require('../../utilities/catch_discord.js');
const client = require('../../services/client.js');
const verdict = require('../../enums/verdict.js');
const db = require('../../services/database.js');
const discord = require('../../utilities/discord.js');
const removeRole = catch_discord(client.removeGuildMemberRole.bind(client));
const half_hour = 18e5;

module.exports = new class Innocent extends Command {
  constructor() {
    super({
      args: [
        new Argument({
          example: '"Set this man free!"',
          key: 'opinion',
          name: 'opinion',
          type: 'string'
        })
      ],
      description: 'Declares an innocent verdict in court.',
      groupName: 'courts',
      names: ['innocent']
    });
  }

  async run(msg, args) {
    const {
      channel_id, created_at, defendant_id, id: case_id
    } = db.get_channel_case(msg.channel.id);
    const defendant = msg.channel.guild.members.get(defendant_id);

    if (!channel_id || !defendant) {
      return;
    }

    const timeElapsed = Date.now() - created_at;
    const currrent_verdict = db.get_verdict(case_id);
    const finished = currrent_verdict && (currrent_verdict.verdict === verdict.guilty
      || currrent_verdict.verdict === verdict.innocent);

    if (timeElapsed < half_hour) {
      return CommandResult.fromError('A verdict can only be delivered 30 minutes \
after the case has started.');
    } else if (finished) {
      return CommandResult.fromError('This case has already reached a verdict');
    }

    const verified = await discord.verify_msg(
      msg,
      '**Warning:** Are you sure you want to deliver this verdict? Unjust verdicts will result in \
an impeachment. Type `I\'m sure` if this is your final verdict.'
    );

    if (!verified) {
      return;
    }

    await this.free(msg.channel.guild, defendant);

    const update = {
      guild_id: msg.channel.guild.id,
      case_id,
      defendant_id,
      verdict: verdict.innocent,
      opinion: args.opinion
    };

    db.insert('verdicts', update);
    await discord.create_msg(
      msg.channel, `${defendant.mention} has been found innocent and was set free.`
    );
  }

  async free(guild, defendant) {
    const { trial_role } = db.fetch('guilds', { guild_id: guild.id });

    await removeRole(guild.id, defendant.id, trial_role);
  }
}();
