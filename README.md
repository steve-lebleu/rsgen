[![Coverage Status](https://coveralls.io/repos/github/konfer-be/rsgen/badge.svg?branch=master)](https://coveralls.io/github/konfer-be/rsgen?branch=master)
![Requires.io (branch)](https://img.shields.io/requires/github/konfer-be/rsgen/master)
![Snyk Vulnerabilities for GitHub Repo](https://img.shields.io/snyk/vulnerabilities/github/konfer-be/rsgen)

[![MIT Licence](https://badges.frapsoft.com/os/mit/mit.svg?v=103)](https://opensource.org/licenses/mit-license.php)

Easy modular resource generation for :point_tight: [Typeplate](https://github.com/konfer-be/ts-express-typeorm) project.

## > Why ?

Obviously to improve the time passed on low value-added tasks . :clock1: :muscle:

## > How to ?

### Install

```bash
$ npm install -g rsgen
```

### Generate

Go to the project folder:

```bash
$ cd path-to-the-root-of-your-typeplate-project
```

Generate your resource module or core member:

#### CLI short way

```bash
$ rsgen <name> [<target>] [<permissions>]
```

- **name** : name of your entity|module|member as string
- **target** :  -c (core) or -r (resource). Default: -r
- **permissions** : -p=[a,u,g]|[admin,user,ghost]. Default: admin

#### CLI interactive way

```bash
$ rsgen
```

And prompt will ask you to define your parameters.

## > Licence

[MIT](/LICENSE)