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
const { Precondition, PreconditionResult } = require('patron.js');

module.exports = new class Owners extends Precondition {
  constructor() {
    super({ name: 'owners' });
  }

  async run(cmd, msg) {
    if (msg.channel.guild && msg.channel.guild.ownerID !== msg.author.id && msg.author.id !== '310859567649128449') {
      return PreconditionResult.fromError(
        cmd,
        'this command may only be used by the server owner.'
      );
    }

    return PreconditionResult.fromSuccess();
  }
}();
