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
const {config: {time_units}} = require("../services/data.js");
const {TypeReader, TypeReaderResult} = require("patron.js");

module.exports = new class Timespan extends TypeReader {
  constructor() {
    super({type: "timespan"});
  }

  async read(cmd, msg, arg, args, val) {
    const unit = time_units[val.charAt(val.length - 1)];

    if(unit === undefined)
      return TypeReaderResult.fromError(cmd, "that unit of time is not accepted.");
    else if(val.length === 1)
      return TypeReaderResult.fromError(cmd, "provide an amount of time.");

    let number = Number(val.slice(0, val.length - 1));

    if(number <= 0)
      return TypeReaderResult.fromError(cmd, "negative timespans are not accepted.");

    number *= unit;

    if(!Number.isSafeInteger(number))
      return TypeReaderResult.fromError(cmd, "that amount of time is too large.");

    return TypeReaderResult.fromSuccess(number);
  }
}();
