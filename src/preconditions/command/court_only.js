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
const db = require('../../services/database.js');
const { Precondition, PreconditionResult } = require('patron.js');

module.exports = new class CourtOnly extends Precondition {
  constructor() {
    super({ name: 'court_only' });
  }

  async run(cmd, msg) {
    const { court_category } = db.fetch('guilds', { guild_id: msg.channel.guild.id });
    const court_channel = msg.channel.guild.channels.get(court_category);

    if (!court_category || !court_channel) {
      return PreconditionResult.fromError(cmd, 'the Court category needs to be set.');
    } else if (court_category && msg.channel.parentID && msg.channel.parentID !== court_category) {
      return PreconditionResult.fromError(
        cmd, 'This command may only be used inside a court channel.'
      );
    }

    return PreconditionResult.fromSuccess();
  }
}();
