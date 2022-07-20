#!/usr/bin/env bash


# @todo replace with bats or something


DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../" && pwd)"
cd "$DIR" || exit 1

set -e
shopt -s nocasematch


function test_install() {
    local app_name="$1"
    local command="$2"
    local verify_command="$3"

    if [[ ! "$command " =~ --force ]]; then
        if command -v "$app_name" &>/dev/null; then
            if [[ -f "$(command -v "$app_name")" ]]; then
                echo "$app_name should not be installed!" >&2
                exit 1
            fi
        fi
    fi
    $command

    if ! command -v "$app_name" &>/dev/null; then
        echo "$app_name should be installed!" >&2
        exit 1
    fi

    $verify_command
}

# Test whalebrew specific version
sudo rm -f "$(command -v whalebrew)"
test_install 'whalebrew' './bin-get install whalebrew/whalebrew 0.4.0 --yes --verbose' 'whalebrew version'


# Test whalebrew latest
sudo rm -f "$(command -v whalebrew)"
test_install 'whalebrew' './bin-get install whalebrew/whalebrew --yes --verbose' 'whalebrew version'


# Test hadolint (plain binary, specific version)
sudo rm -f "$(command -v hadolint)"
test_install 'hadolint' './bin-get install hadolint/hadolint v2.10.0 --yes --verbose' 'hadolint -v'

# Test hadolint (plain binary, latest version)
sudo rm -f "$(command -v hadolint)"
test_install 'hadolint' './bin-get install hadolint/hadolint --yes' 'hadolint -v'


# Test helm (binary in tar.gz in description)
sudo rm -f "$(command -v helm)"
test_install 'helm' './bin-get install helm/helm --yes --verbose' 'helm version'

# Test helm (binary in tar.gz in description, force install)

test_install 'helm' './bin-get install helm/helm --yes --force' 'helm version'


# Test topgrade (binary in tar.gz)
sudo rm -f "$(command -v topgrade)"
test_install 'topgrade' './bin-get install r-darwish/topgrade --yes --verbose' 'topgrade --version'


