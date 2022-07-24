#!/usr/bin/env bash


# @todo replace with bats or something


DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../" && pwd)"
cd "$DIR" || exit 1

set -e

sudo rm -f "$(command -v bin-get)"

# This is the same code as in the README.md

sudo curl -SsL https://raw.githubusercontent.com/OhMyMndy/bin-get/main/bin-get -o /usr/bin/bin-get
sudo chmod +x /usr/bin/bin-get


if ! command -v bin-get >/dev/null; then
    echo "bin-get is not installed, but should!" >&2
    exit 1
fi

sudo curl -fsSL https://deno.land/install.sh | sudo DENO_INSTALL=/usr/local sh

sudo deno run --allow-all https://raw.githubusercontent.com/OhMyMndy/bin-get/main/bin-get.ts install helm/helm


sudo cp ./bin-get.ts /usr/bin/bin-get.ts
sudo chmod +x /usr/bin/bin-get.ts

if ! command -v bin-get.ts >/dev/null; then
    echo "bin-get.ts is not installed, but should!" >&2
    exit 1
fi

sudo curl -SsL https://raw.githubusercontent.com/OhMyMndy/bin-get/main/bin-get.ts -o /usr/bin/bin-get.ts
sudo chmod +x /usr/bin/bin-get.ts

if ! command -v bin-get.ts >/dev/null; then
    echo "bin-get.ts is not installed, but should!" >&2
    exit 1
fi

