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
const { ArgumentPrecondition, PreconditionResult } = require('patron.js');
const db = require('../../services/database.js');

module.exports = new class CommandOwner extends ArgumentPrecondition {
  constructor() {
    super({ name: 'command_owner' });
  }

  async run(cmd, msg, arg, args, val) {
    const custom = db
      .fetch_commands(msg.channel.guild.id)
      .find(x => x.name.toLowerCase() === val.toLowerCase());

    if (custom.creator_id !== msg.author.id && custom.creator_id !== msg.channel.guild.ownerID) {
      return PreconditionResult.fromError(
        cmd,
        'Only the creator of this command or the owner of the server may remove this command.'
      );
    }

    return PreconditionResult.fromSuccess();
  }
}();
