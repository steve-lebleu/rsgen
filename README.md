![Github action workflow status](https://github.com/steve-lebleu/rsgen/actions/workflows/build.yml/badge.svg?branch=master)
[![Coverage Status](https://coveralls.io/repos/github/konfer-be/rsgen/badge.svg?branch=master)](https://coveralls.io/github/konfer-be/rsgen?branch=master)
![Known Vulnerabilities](https://snyk.io/test/github/steve-lebleu/rsgen/badge.svg)
![GitHub Release](https://img.shields.io/github/v/release/steve-lebleu/rsgenlogo=Github)
[![MIT Licence](https://badges.frapsoft.com/os/mit/mit.svg?v=103)](https://opensource.org/licenses/mit-license.php)

Naive modular resource generation for :point_right: [Typeplate](https://github.com/steve-lebleu/ts-express-typeorm) project.

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