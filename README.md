# bin-get

![Tests](https://github.com/OhMyMndy/bin-get/actions/workflows/tests.yml/badge.svg)

Get binaries from Github Releases in a convenient way!

_At the moment it is only tested on Ubuntu 22.04_, feel free to test on different distro's and report back!

## Installation

Please make sure you have the required dependencies installed:

- curl
- tar
- jq
- sudo

Two line installer:

```bash
sudo curl -SsL https://raw.githubusercontent.com/OhMyMndy/bin-get/main/bin-get -o /usr/bin/bin-get;
sudo chmod +x /usr/bin/bin-get
```

## Usage

`bin-get install <user/repo> <version>`

Examples:

`bin-get install hadolint/hadolint v2.10.0`

`bin-get install hadolint/hadolint`

`bin-get install helm/helm v3.9.1`

## Contributing

Use [Github Codespaces](https://github.com/features/codespaces)/[vscode devcontainers](https://code.visualstudio.com/docs/remote/containers) if you want (development setup is already configured!)

- Add test if necessary
- Makes sure tests pass before creating a pull request (You will need to enable workflows on your fork)
- Have fun! :-)

## Related projects

- [deb-get](https://github.com/wimpysworld/deb-get): *deb-get makes it easy to install and update .debs published in 3rd party apt repositories or made available via direct download on websites or GitHub release pages.*

## Todo

- Add code to verify binaries with checksum
- Add more tests with different packages
- Clean up code a bit
