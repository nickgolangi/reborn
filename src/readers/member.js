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
const discord = require("../utilities/discord.js");
const handle_matches = require("../utilities/handle_matches.js");
const {TypeReader, TypeReaderResult} = require("patron.js");

module.exports = new class Member extends TypeReader {
  constructor() {
    super({type: "Member"});
  }

  async read(cmd, msg, arg, args, val) {
    const {members} = msg.channel.guild;
    let id = val.match(/<@\d{14,20}>/);

    if(id !== null || (id = val.match(/^\d{14,20}$/)) !== null) {
      const member = members.get(id[id.length - 1]);

      if(member !== undefined)
        return TypeReaderResult.fromSuccess(member);

      return TypeReaderResult.fromError("that member does not exist.");
    }

    let mbrs = members.filter(mbr => discord.tag(mbr) === val || mbr.username === val);

    if(mbrs.length !== 0)
      return handle_matches(cmd, mbrs, null, discord.tag);

    id = val.toLowerCase();
    mbrs = msg.channel.guild.members.filter(mbr => mbr.nick !== null && mbr.nick.toLowerCase() === id);

    if(mbrs.length !== 0)
      return handle_matches(cmd, mbrs, null, discord.tag);

    return handle_matches(
      cmd,
      members.filter(mbr => discord.tag(mbr).toLowerCase() === id || mbr.username.toLowerCase() === id),
      "that member does not exist.",
      discord.tag
    );
  }
}();
