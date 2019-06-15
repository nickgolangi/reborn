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
const db = require('../../services/database.js');
const discord = require('../../utilities/discord.js');
const create_channel = catch_discord(client.createChannel.bind(client));
const addRole = catch_discord(client.addGuildMemberRole.bind(client));

module.exports = new class Arrest extends Command {
  constructor() {
    super({
      preconditions: ['can_trial'],
      args: [
        new Argument({
          example: '845',
          key: 'warrant',
          name: 'warrant',
          type: 'warrant'
        }),
        new Argument({
          example: 'Nͥatͣeͫ763#0554',
          key: 'member',
          name: 'member',
          type: 'member',
          remainder: true
        })
      ],
      description: 'Arrest a citizen.',
      groupName: 'enforcement',
      names: ['arrest']
    });
    this.bitfield = 2048;
  }

  async run(msg, args) {
    if (args.warrant.defendant_id !== args.member.id) {
      return CommandResult.fromError(`This warrant isn't issued for ${args.member.mention}`);
    }

    const {
      court_category, judge_role, officer_role, trial_role
    } = db.fetch('guilds', { guild_id: msg.channel.guild.id });
    const o_role = msg.channel.guild.roles.get(officer_role);
    const category = msg.channel.guild.channels.get(court_category);

    if (!officer_role || !o_role || !discord.usable_role(msg.channel.guild, o_role)
      || !court_category || !category || !trial_role) {
      return;
    }

    const verified = await discord.verify_msg(msg, '**Warning:** Handing out false arrests will \
result in impeachment. Type `I\'m sure` if you are sure you want to arrest.');

    if (!verified) {
      return;
    }

    const detainment = db.fetch('detainments', {
      guild_id: msg.channel.guild.id,
      officer_id: msg.author.id,
      defendant_id:
      args.member.id,
      served: 0
    });

    if (detainment) {
      db.serve_detainment(detainment.id);
    }

    const judge = this.getJudge(msg.channel.guild, args.warrant, judge_role);
    const officer = msg.author;

    await this.setUp({
      guild: msg.channel.guild, defendant: args.member,
      judge, officer,
      warrant: args.warrant, jailed: trial_role, category: court_category
    });
    await discord.create_msg(msg.channel, `I have arrested ${args.member.mention}.`);
  }

  async setUp({ guild, defendant, judge, officer, warrant, jailed, category }) {
    const channel = await create_channel(
      guild.id,
      `${discord.formatUsername(officer.username)}-VS-\
${discord.formatUsername(defendant.user.username)}`,
      0,
      null,
      category
    );
    const edits = [judge.id, officer.id, defendant.id];

    await Promise.all(edits.map(x => channel.editPermission(x, this.bitfield, 0, 'member')));
    await discord.create_msg(
      channel,
      '**Judge Commands:**\n`!allow_in_court <member>` - allow a citizen to speak in this hearing\n\
`!kick_from_court <member>` - kick a citizen from this hearing\n\
`!guilty <opinion> [sentence]` - declare a guilty verdict\n\
`!innocent <opinion>` - declare an innocent verdict'
    );
    db.insert('cases', {
      guild_id: guild.id,
      channel_id: channel.id,
      warrant_id: warrant.id,
      law_id: warrant.law_id,
      defendant_id: defendant.id,
      judge_id: judge.id,
      plaintiff_id: officer.id
    });
    await addRole(guild.id, defendant.id, jailed);
  }

  getJudge(guild, warrant, judgeRole) {
    let judge = guild.members.filter(mbr => mbr.roles.includes(judgeRole));

    if (judge.length > 1) {
      judge.splice(judge.findIndex(mbr => mbr.id === warrant.judge_id), 1);
    }

    judge = judge[Math.floor(Math.random() * judge.length)];

    return judge;
  }
}();
