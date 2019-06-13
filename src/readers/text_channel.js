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
"use strict";
const handle_matches = require("../utilities/handle_matches.js");
const {TypeReader, TypeReaderResult} = require("patron.js");

module.exports = new class TextChannel extends TypeReader {
  constructor() {
    super({type: "text_channel"});
  }

  async read(cmd, msg, arg, args, val) {
    let id = val.match(/<#\d{14,20}>/);

    if(id !== null || (id = val.match(/^\d{14,20}$/)) !== null) {
      const channel = msg.channel.guild.channels.get(id[id.length - 1]);

      if(channel !== undefined && channel.type === 0)
        return TypeReaderResult.fromSuccess(channel);
    }

    let channels = msg.channel.guild.channels.filter(chl => chl.name === val && chl.type === 0);

    if(channels.length !== 0)
      return handle_matches(cmd, channels, "that text channel does not exist.");

    id = val.toLowerCase();
    channels = msg.channel.guild.channels.filter(chl => chl.name.toLowerCase().includes(id) && chl.type === 0);

    return handle_matches(cmd, channels, "that text channel does not exist.");
  }
}();
