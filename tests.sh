#!/usr/bin/env bash


# @todo replace with bats or something


DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/" && pwd)"
cd "$DIR" || exit 1

set -e
shopt -s nocasematch


function test_install() {
    local app_name="$1"
    local command="$2"
    local verify_command="$3"

    
    if command -v "$app_name" &>/dev/null; then
        echo "$app_name should not be installed!" >&2
    fi

    $command

    if ! command -v "$app_name" &>/dev/null; then
        echo "$app_name should be installed!" >&2
    fi
    $verify_command
}

# Test hadolint (plain binary, specific version)
sudo rm -f "$(command -v hadolint)"
test_install 'hadolint' './bin-get install hadolint/hadolint v2.10.0 --yes' 'hadolint -v'

# Test hadolint (plain binary, latest version)
sudo rm -f "$(command -v hadolint)"
test_install 'hadolint' './bin-get install hadolint/hadolint --yes' 'hadolint -v'


# Test helm (binary in tar.gz in description)
sudo rm -f "$(command -v helm)"
test_install 'helm' './bin-get install helm/helm --yes' 'helm version'

# Test helm (binary in tar.gz in description, force iønstall)

test_install 'helm' './bin-get install helm/helm --yes --force' 'helm version'
