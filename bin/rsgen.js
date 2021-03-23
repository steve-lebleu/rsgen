#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require('module-alias/register');
const generate_1 = require("@commands/generate");
const generate = new generate_1.Generate();
generate.run(process.argv);
