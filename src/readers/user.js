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
const discord = require('../utilities/discord.js');
const handle_matches = require('../utilities/handle_matches.js');
const { TypeReader, TypeReaderResult } = require('patron.js');

module.exports = new class User extends TypeReader {
  constructor() {
    super({ type: 'user' });
  }

  async read(cmd, msg, arg, args, val) {
    let id = val.match(/<@\d{14,20}>/);

    if (id !== null || (id = val.match(/^\d{14,20}$/)) !== null) {
      const user = await discord.fetch_user(id[id.length - 1]);

      if (user) {
        return TypeReaderResult.fromSuccess(user);
      }

      return TypeReaderResult.fromError('that user does not exist.');
    }

    let users = client.users.filter(usr => discord.tag(usr) === val || usr.username === val);

    if (users.length !== 0) {
      return handle_matches(cmd, users, null, discord.tag);
    }

    id = val.toLowerCase();
    users = client.users
      .filter(usr => discord.tag(usr).toLowerCase() === id || usr.username.toLowerCase() === id);

    if (users.length !== 0 || !msg.channel.guild) {
      return handle_matches(cmd, users, 'that user does not exist.', discord.tag);
    }

    return handle_matches(
      cmd,
      msg.channel.guild.members
        .filter(mbr => mbr.nick !== null && mbr.nick.toLowerCase() === id)
        .map(mbr => mbr.user),
      'that user does not exist.',
      discord.tag
    );
  }
}();
