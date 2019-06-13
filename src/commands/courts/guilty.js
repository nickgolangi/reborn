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
const {Argument, Command} = require("patron.js");
const db = require("../../services/database.js");
const discord = require("../../utilities/discord.js");

module.exports = new class Guilty extends Command {
  constructor() {
    super({
      args: [new Argument({
        example: "\"Criminal scum!\"",
        key: "opinion",
        name: "opinion",
        type: "string"
      }),
      new Argument({
        example: "5h",
        key: "sentence",
        name: "sentence",
        type: "timespan"
      })],
      description: "Declares a guilty verdict in court.",
      groupName: "courts",
      names: ["guilty"]
    });
  }

  async run(msg, args) {
    const court = db.get_channel_case(msg.channel.id);

    if(court === undefined)
      return;

    // TODO
  }
}();
