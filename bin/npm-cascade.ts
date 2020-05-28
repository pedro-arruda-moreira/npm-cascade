#!/usr/bin/env node

import { NpmCascade } from "..";

const start = new Date().getTime();

const cascade = new NpmCascade("./", process.argv.slice(2).join(',').split(','), () => {
    console.log(`INFO: executed ${cascade.commandCount} tasks in ${new Date().getTime() - start} ms.`);
});
cascade.run();