#!/bin/bash

mkdir -p build
cd build || exit

cmake ..
make

./Rasterizer ../../output.png