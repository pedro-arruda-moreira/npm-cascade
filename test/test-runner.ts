import * as fs from "fs";

const args = process.argv.slice(2);

fs.writeFileSync(`./${args[0]}test_file`, args[1]);