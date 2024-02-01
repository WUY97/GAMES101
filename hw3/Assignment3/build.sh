#!/bin/bash

mkdir -p build
cd build || exit

cmake ..
make

./Rasterizer ../../normal.png normal
./Rasterizer ../../phong.png phong
./Rasterizer ../../bump.png bump
./Rasterizer ../../displacement.png displacement