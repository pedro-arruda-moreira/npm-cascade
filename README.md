
# npm-cascade

Cascade your NPM scripts on multi module projects!
## What is it?
Now it is possible to easily coordenate NPM on multi-module projects on node.js!
## How can I use it?
First, install it globally:
```
$ npm install -g npm-cascade
```
Then, your **root** package.json must contain the **cascade** declaration:
```json
{
  ...
  "cascade": {
    "before": {
      "install, test": [
        "./sub-module1"
      ]
    },
    "after": {
      "my-custom-script": [
        "./sub-module2"
      ]
    }
  },
  ...
}
```
In this example, if **npm-cascade install** or **npm-cascade test** is executed on the **root** module, these commands will also get executed on ./sub-module1 **before** they are executed on the root project.
If **npm-cascade my-custom-script** is executed on the **root** module, this command will also be executed on ./sub-module2 **after** executing on the root module.
If **npm-cascade install test my-custom-script** or **npm-cascade install,test,my-custom-script** are executed on the **root** module, they will be executed on the following order:
+ install on ./sub-module1
+ install on root module
+ test on ./sub-module1
+ test on root module
+ my-custom-script on root module
+ my-custom-script on ./sub-module2

Note that if any of this script doesn't exists (for example: root module has no script my-custom-script), it will be warned and skipped, but it will not fail.