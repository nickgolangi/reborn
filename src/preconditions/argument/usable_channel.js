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
const client = require('../../services/client.js');

module.exports = new class UsableChannel extends ArgumentPrecondition {
  constructor() {
    super({ name: 'usable_channel' });
  }

  async run(cmd, msg, arg, args, val) {
    if (val.permissionsOf(client.user.id).has('manageChannels')) {
      return PreconditionResult.fromSuccess();
    }

    return PreconditionResult.fromError(cmd, 'I can\'t use that channel.');
  }
}();
