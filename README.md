# bin-get

Get binaries from Github in a safe and secure way!

## Installation

```bash
sudo curl -SsL https://raw.githubusercontent.com/OhMyMndy/bin-get/main/bin-get -o /usr/bin/bin-get
sudo chmod +x /usr/bin/bin-get
```

## Usage

`bin-get install <user/repo> <version>`

Examples: 
`bin-get install hadolint/hadolint v2.10.0`
`bin-get install hadolint/hadolint`
`bin-get install helm/helm v3.9.1`


## Todo

- Add code to verify binaries with checksum
- Add more tests with different packages
- Clean up code a bit
