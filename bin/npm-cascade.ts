#!/usr/bin/env node

import { NpmCascade } from "..";

const start = new Date().getTime();

new NpmCascade("./", process.argv.slice(2).join(',').split(','), () => {
    console.log(`INFO: finished in ${new Date().getTime() - start} ms.`);
}).run();