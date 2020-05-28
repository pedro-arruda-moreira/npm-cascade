import { NpmCascade } from "..";
import * as mocha from "mocha";
import * as chai from "chai";
import * as fs from "fs";
import * as os from "os";

let sep = '/';
if(os.platform() == 'win32') {
    sep = '\\';
}

const test_file = `${__dirname}${sep}test_file`;
const dummyProjPath = `${__dirname}${sep}dummy1${sep}`;

function run(targets: string[], path: string, callback: () => void) {
    new NpmCascade(path, targets, callback).run();
}

mocha.describe("npm-cascade", () => {
    mocha.beforeEach(() => {
        if(fs.existsSync(test_file)) {
            fs.unlinkSync(test_file);
        }
    });
    mocha.afterEach(() => {
        if(fs.existsSync(test_file)) {
            fs.unlinkSync(test_file);
        }
    });
    mocha.it("respects 'before' ordering", (done) => {
        run(["test1"], dummyProjPath, () => {
            chai.assert.equal('' + fs.readFileSync(test_file), "dummy1");
            done();
        });
    });
    mocha.it("run child if parent has no such script", (done) => {
        run(["test2"], dummyProjPath, () => {
            chai.assert.equal('' + fs.readFileSync(test_file), "dummy2");
            done();
        });
    });
    mocha.it("respects 'after' ordering", (done) => {
        run(["test3"], dummyProjPath, () => {
            chai.assert.equal('' + fs.readFileSync(test_file), "dummy2");
            done();
        });
    });
    mocha.it("must stop on error", (done) => {
        run(["test-error"], dummyProjPath, () => {
            chai.assert.isFalse(fs.existsSync(test_file));
            done();
        });
    });
});
