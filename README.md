# rpmExtract

[![npm](https://img.shields.io/npm/v/@mymindstorm/rpm-extract.svg)](https://www.npmjs.com/package/@mymindstorm/rpm-extract)

This module lets you programmatically extract files from an [rpm](https://en.wikipedia.org/wiki/RPM_Package_Manager) package.

**Note**: This module doesn't run `rpm install`, nor it lets you do so programmatically.
This is a simple utility to extract files from an rpm package.

## Why not use `rpm2cpio`?

`rpm2cpio` is CLI tool to extract RPM packages on \*nix distributions.
Its an excellent and powerful tool to work in shell, but creating a script that works cross platform, is not so trivial.
Furthermore, there is no interaction with file system (other than initial reading of the rpm),
which makes this implementation faster than spawning child processes and doing file I/O.

## Install

```console
$ npm install rpm-extract
```

## Usage

TODO: out of date.

```js
const rpmExtract = require("rpm-extract");

rpmExtract("path/to/file.rpm")
  .then(function (files) {
    // do something array of files
  })
  .catch(function (err) {
    // handle errors
  });
```

## API

### `file` object

The `file` object contains the metadata as well as contents of the file. It includes:

| Property | Type                                           | Description                                                                               |
| -------- | ---------------------------------------------- | ----------------------------------------------------------------------------------------- |
| data     | [`Buffer`](https://nodejs.org/api/buffer.html) | File's contents, in a NodeJS buffer instance.                                             |
| mode     | `string`                                       | Unix file permissions or [modes](<https://en.wikipedia.org/wiki/Modes_(Unix)>).           |
| mtime    | `string`                                       | Last [modification time](https://en.wikipedia.org/w/index.php?title=Mtime)                |
| path     | `string`                                       | File path as was specified while creating the package.                                    |
| type     | `string`                                       | Unix file [type](https://en.wikipedia.org/wiki/Unix_file_types).                          |
| linkname | `string`                                       | [Symbolic Link](https://en.wikipedia.org/wiki/Symbolic_link) name, if the file is a link. |

## References

- [how-do-i-extract-the-contents-of-an-rpm](http://stackoverflow.com/questions/18787375/how-do-i-extract-the-contents-of-an-rpm)
- [rpm2cpio](https://github.com/ruda/rpm2cpio)
