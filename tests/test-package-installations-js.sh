#!/usr/bin/env bash


# @todo replace with bats or something


DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../" && pwd)"
cd "$DIR" || exit 1

set -e
shopt -s nocasematch


function test_install() {
    local app_name="$1"
    local deno_args="$2"
    local command="$3"
    local verify_command="$4"

    if [[ ! "$command " =~ --force ]]; then
        if command -v "$app_name" &>/dev/null; then
            if [[ -f "$(command -v "$app_name")" ]]; then
                echo "$app_name should not be installed!" >&2
                exit 1
            fi
        fi
    fi
    set -x
    sudo -E deno run --allow-write=/usr/bin/,/tmp --allow-env --allow-read $deno_args ./bin-get.ts install $command
    set +x
    if ! command -v "$app_name" &>/dev/null; then
        echo "$app_name should be installed!" >&2
        exit 1
    fi

    $verify_command
}

# Test whalebrew specific version
sudo rm -f "$(command -v whalebrew)"
test_install 'whalebrew' '--allow-net=api.github.com,github.com,objects.githubusercontent.com' 'whalebrew/whalebrew 0.4.0 --yes --verbose' 'whalebrew version'


# Test whalebrew latest
sudo rm -f "$(command -v whalebrew)"
test_install 'whalebrew' '--allow-net=api.github.com,github.com,objects.githubusercontent.com' 'whalebrew/whalebrew --yes --verbose' 'whalebrew version'


# Test hadolint (plain binary, specific version)
sudo rm -f "$(command -v hadolint)"
test_install 'hadolint' '--allow-net=api.github.com,github.com,objects.githubusercontent.com' 'hadolint/hadolint v2.10.0 --yes --verbose' 'hadolint -v'

# Test hadolint (plain binary, latest version)
sudo rm -f "$(command -v hadolint)"
test_install 'hadolint' '--allow-net=api.github.com,github.com,objects.githubusercontent.com' 'hadolint/hadolint --yes' 'hadolint -v'


# Test helm (binary in tar.gz in description)
sudo rm -f "$(command -v helm)"
test_install 'helm' '--allow-net=api.github.com,github.com,objects.githubusercontent.com,get.helm.sh' 'helm/helm --yes --verbose' 'helm version'

# Test helm (binary in tar.gz in description, force install)

test_install 'helm' '--allow-net=api.github.com,github.com,objects.githubusercontent.com,get.helm.sh' 'helm/helm --yes --force' 'helm version'


# Test topgrade (binary in tar.gz)
sudo rm -f "$(command -v topgrade)"
test_install 'topgrade' '--allow-net=api.github.com,github.com,objects.githubusercontent.com' 'r-darwish/topgrade --yes --verbose' 'topgrade --version'


# Test viddy (binary in tar.gz)
sudo rm -f "$(command -v viddy)"
test_install 'viddy' '--allow-net=api.github.com,github.com,objects.githubusercontent.com' 'sachaos/viddy --yes --verbose' 'viddy --version'

# Test mutagen (binary in tar.gz)
sudo rm -f "$(command -v mutagen)"
test_install 'mutagen' '--allow-net=api.github.com,github.com,objects.githubusercontent.com' 'mutagen-io/mutagen --yes --verbose' 'mutagen --version'


# Test mutagen compose (binary in tar.gz)
sudo rm -f "$(command -v mutagen-compose)"
test_install 'mutagen-compose' '--allow-net=api.github.com,github.com,objects.githubusercontent.com' 'mutagen-io/mutagen-compose --yes --verbose' 'mutagen-compose version'