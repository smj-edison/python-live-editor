#!/bin/bash
rm -R build
mkdir build
cp -R deps/pyodide/* build
cp -R deps build/deps
cp -R src/* build