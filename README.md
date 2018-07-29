# system-dev-install

[![NPM pkg](https://img.shields.io/npm/v/system-dev-install.svg)](https://www.npmjs.com/package/system-dev-install)
[![NPM dm](https://img.shields.io/npm/dm/system-dev-install.svg)](https://www.npmjs.com/package/system-dev-install)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)
[![Dependency Status](https://david-dm.org/IvanGaravito/system-dev-install.svg)](https://david-dm.org/IvanGaravito/system-dev-install)
[![devDependency Status](https://david-dm.org/IvanGaravito/system-dev-install/dev-status.svg)](https://david-dm.org/IvanGaravito/system-dev-install#info=devDependencies)

Tool for configure, install apps and utilities after a system reinstall

## Quick Start

Before anything, you need to install:
* [node.js](https://nodejs.org/)
* [npm.js](https://www.npmjs.com/)

Then, just use `npm install` to get it ready:
```sh
$ sudo npm install -g system-dev-install
```

## Usage

Calling `system-dev-install` from command line outputs the general help:
```sh
$ system-dev-install
system-dev-install - Tool for configure, install apps and utilities after a system reinstall

USAGE

	system-dev-install <command> [options]

COMMANDS

Sudo Name             Description
---- ----             -----------
 ✔   asciinema        Installs asciinema
 ✔   atom-ide         Installs Atom IDE
 ✖   bash-git-prompt  Installs git prompt for bash
 ✔   docker-ce        Installs Docker CE
 ✔   java8            Installs Oracle Java 8
 ✔   nodejs-lts       Installs Node.js LTS
 ✔   wireshark        Installs Wireshark

GLOBAL OPTIONS

--help, -h     Show this help and exit
--version, -v  Show version and exit
```

As the previous output example of `system-dev-install`, it has many commands which allows you to configure or install or update apps and tools.

Note that the first column, `Sudo`, has the values `✔` or `✖`, for meaning which commands require to call `sudo system-dev-install <command>` or not. 
