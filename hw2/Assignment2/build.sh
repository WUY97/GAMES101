#!/bin/bash

cd build || exit

cmake ..
make

./Rasterizer ../../output.png