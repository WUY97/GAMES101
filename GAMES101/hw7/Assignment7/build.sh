#!/bin/bash

export CC=gcc-13
export CXX=g++-13

mkdir -p build
cd build || exit

cmake ..
make

./RayTracing