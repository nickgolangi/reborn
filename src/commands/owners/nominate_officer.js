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
const number = require('../../utilities/number.js');
const to_hours = 24;

module.exports = new class NominateOfficer extends Command {
  constructor() {
    super({
      preconditions: ['usable_officer'],
      args: [
        new Argument({
          example: 'Ashley',
          key: 'member',
          name: 'member',
          type: 'member',
          remainder: true
        })
      ],
      description: 'Nominates an officer.',
      groupName: 'owners',
      names: ['nominate_officer']
    });
  }

  async run(msg, args) {
    const {
      judge_role, officer_role, impeachment_time, congress_role
    } = db.fetch('guilds', { guild_id: msg.channel.guild.id });
    const { roles } = args.member;
    const was_impeached = db.get_impeachment(msg.channel.guild.id, args.member.id);

    if (roles.includes(officer_role)) {
      return CommandResult.fromError('This user already has the Officer role.');
    } else if (roles.includes(judge_role)) {
      return CommandResult.fromError(
        'This user cannot receive the Officer role since they have the Judge role.'
      );
    } else if (roles.includes(congress_role)) {
      return CommandResult.fromError(
        'This user cannot recieve the Officer role since they have the Congress role.'
      );
    } else if (was_impeached) {
      const time_left = was_impeached.created_at + impeachment_time - Date.now();

      if (time_left > 0) {
        const { days, hours } = number.msToTime(time_left);
        const hours_left = (days * to_hours) + hours;

        return CommandResult.fromError(`This user cannot be nominated because they were impeached. \
${args.member.mention} can be nominated again ${hours_left ? `in ${hours_left} hours` : 'soon'}.`);
      }
    }

    await args.member.addRole(officer_role);
    await discord.create_msg(
      msg.channel, `**${discord.tag(msg.author)}**, You have nominated \
${args.member.mention} to the Officer role.`
    );
  }
}();
