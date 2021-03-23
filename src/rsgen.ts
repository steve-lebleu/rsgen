#!/usr/bin/env node
require('module-alias/register');

import { Generate } from "@commands/generate";

const generate = new Generate();

generate.run(process.argv);
