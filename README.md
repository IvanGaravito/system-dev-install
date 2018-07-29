# systeminstall

[![NPM pkg](https://img.shields.io/npm/v/systeminstall.svg)](https://www.npmjs.com/package/systeminstall)
[![NPM dm](https://img.shields.io/npm/dm/systeminstall.svg)](https://www.npmjs.com/package/systeminstall)
[![Gratipay](https://img.shields.io/gratipay/IvanGaravito.svg)](https://gratipay.com/IvanGaravito)

Tool for configure, install apps and utilities after a system reinstall

## Quick Start

Before anything, you need to install:
* [node.js](https://nodejs.org/)
* [npm.js](https://www.npmjs.com/)

Then, just use `npm install` to get it ready:
```sh
$ sudo npm install -g systeminstall
```

## Usage

Calling `systeminstall` from command line outputs the general help:
```sh
$ systeminstall
systeminstall - Tool for configure, install apps and utilities after a system reinstall

USAGE

	systeminstall <command> [options]

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

As the previous output example of `systeminstall`, it has many commands which allows you to configure or install or update apps and tools.

Note that the first column, `Sudo`, has the values `✔` or `✖`, for meaning which commands require to call `sudo systeminstall <command>` or not. 
