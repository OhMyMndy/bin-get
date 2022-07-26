# bin-get

![Tests](https://github.com/OhMyMndy/bin-get/actions/workflows/tests.yml/badge.svg)

Get binaries from Github Releases in a convenient way on Linux, MacOS and Windows!

## Installation

Install package in `/usr/local/bin` (or `~/.bin` on Windows) without explicitly installing `bin-get`

```bash
sudo deno run --allow-all https://raw.githubusercontent.com/OhMyMndy/bin-get/deno-only/bin-get.ts install helm/helm
```

Install package in a user accessible location:

```bash
deno run --allow-all https://raw.githubusercontent.com/OhMyMndy/bin-get/deno-only/bin-get.ts install helm/helm --directory ~/.bin
```

## Usage

`bin-get install <user/repo> <version>`

`GITHUB_USER` and `GITHUB_TOKEN` environment variables can be set to authenticate against the Github API


Examples:

`bin-get install hadolint/hadolint v2.10.0`

`bin-get install hadolint/hadolint`

`bin-get install helm/helm v3.9.1`

`bin-get install r-darwish/topgrade --yes`

## Contributing

Use [Github Codespaces](https://github.com/features/codespaces)/[vscode devcontainers](https://code.visualstudio.com/docs/remote/containers) if you want (development setup is already configured!)

- Add test if necessary
- Makes sure tests pass before creating a pull request
- Have fun! :-)

## Related projects

- [deb-get](https://github.com/wimpysworld/deb-get): *deb-get makes it easy to install and update .debs published in 3rd party apt repositories or made available via direct download on websites or GitHub release pages.*

## Todo

- Add code to verify binaries with checksum
- Clean up code a bit
- Add gifs to show its usage on Mac, Windows and Linux
- Create Github actions workflow to create the necessary lock file for the dependencies

## Why [Deno](https://deno.land)?

- Only dependency for `bin-get.ts` would be `deno` itself (To install `curl -fsSL https://deno.land/install.sh | sudo DENO_INSTALL=/usr/local sh`)
- Better error management
- Use the power of TypeScript!
- By default no filesystem, network or environment access
- Look at that cute Deno logo!
