#!/usr/bin/env bash


# @todo replace with bats or something


DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/" && pwd)"
cd "$DIR" || exit 1

set -e
shopt -s nocasematch


function test_install() {
    local app_name="$1"
    local command="$2"

    
    if command -v "$app_name" &>/dev/null; then
        echo "$app_name should not be installed!" >&2
    fi
    $command

    if ! command -v "$app_name" &>/dev/null; then
        echo "$app_name should be installed!" >&2
    fi
}

# Test hadolint (plain binary, specific version)
sudo rm -f "$(command -v hadolint)"
test_install 'hadolint' './bin-get install hadolint/hadolint v2.10.0 --yes'

# Test hadolint (plain binary, latest version)
sudo rm -f "$(command -v hadolint)"
test_install 'hadolint' './bin-get install hadolint/hadolint --yes'


# Test helm (binary in tar.gz in description)
sudo rm -f "$(command -v helm)"
test_install 'helm' './bin-get install helm/helm --yes'

# Test helm (binary in tar.gz in description, force install)

test_install 'helm' './bin-get install helm/helm --yes --force'
