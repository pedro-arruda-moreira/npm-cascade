import * as cp from "child_process";
import * as fs from "fs";
import * as os from "os";
import npm from "npm";

type Tuple<T> = {
    [name: string]: T;
};


interface BeforeAfter<T> {
    before?: T;
    after?: T;
};

interface PackageJson {
    scripts: Tuple<string>;
    cascade: BeforeAfter<Tuple<string[]>>;
}

interface Command {
    path: string;
    target: string;
    isBuiltIn: boolean;
}
export class NpmCascade {

    constructor(
        private path: string,
        private targets: string[],
        private callback: () => void) {
    }

    private commands = [] as Command[];

    get commandCount() {
        return this.commands.length;
    }

    private parsePackageJson(path: string): PackageJson {
        return JSON.parse('' + fs.readFileSync(path.split('//').join('/'))) as PackageJson;
    }

    private scanAll(cascade: BeforeAfter<Tuple<string[]>> | undefined, type: string, path: string, target: string) {
        if(cascade) {
            const tuple = eval('cascade.' + type) as Tuple<string[]>;
            if(tuple) {
                for(const currKey in tuple) {
                    const splKey = currKey.split(',');
                    for(let i = 0; i < splKey.length; i++) {
                        splKey[i] = splKey[i].trim();
                    }
                    for(const currScript of splKey) {
                        if(currScript == target) {
                            for(const currPackage of tuple[currKey]) {
                                this.scanInPath(path + currPackage, target);
                            }
                            return;
                        }
                    }
                }
            }
        }
    }

    private scanInPath(path: string, target: string) {
        const packageJson = this.parsePackageJson((path + "/package.json"));
        let cascade = packageJson.cascade;
        this.scanAll(cascade, 'before', path, target);
        const npmCommand = this.isNpmCommand(target);
        if(packageJson.scripts[target] || npmCommand) {
            this.commands.push({
                path,
                target,
                isBuiltIn: npmCommand
            });
        } else {
            console.log(`INFO: npm script '${target}' not found in '${path}' ... Continuing...`);
        }
        this.scanAll(cascade, 'after', path, target);
    }

    private isNpmCommand(target: string): boolean {
        return (npm.commands as any)[target] != null;
    }

    private doExecute(index = 0) {
        if(index >= this.commands.length) {
            this.callback();
            return;
        }
        const comm = this.commands[index];
        console.log(`INFO: running NPM "${comm.target}" on "${comm.path}"`);
        console.log(`      (${index + 1} of ${this.commands.length})`);
        let execName = 'npm';
        if(os.platform() == 'win32') {
            execName = 'npm.cmd';
        }
        let args = ["--prefix", comm.path, "run", comm.target];
        if(comm.isBuiltIn) {
            args = ["--prefix", comm.path, comm.target];
        }
        const child = cp.spawn(execName, args);
        child.stdout.on('data', function(chunk) {
            console.log('' + chunk);
        });
        child.stderr.on('data', function(chunk) {
            console.error('' + chunk);
        });
        child.on("exit", () => {
            if(child.exitCode == 0) {
                this.doExecute(index + 1);
            } else {
                console.log("INFO: aborted by error(s)!");
                this.callback();
            }
        });
    }

    run() {
        npm.load({}, () => {
            console.log('INFO: scanning projects...');
            for(const curr of this.targets) {
                this.scanInPath(this.path, curr);
            }
            console.log(`INFO: found ${this.commands.length} task(s).`);
            console.log('INFO: starting NPM ...');
            this.doExecute();
        });
    }

}