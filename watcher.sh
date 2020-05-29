#!/bin/bash

function build {
    ./build.sh
}

build

while true; do
    inotifywait --recursive --event modify,move,create,delete .
    build
done &

python -m SimpleHTTPServer 8080
