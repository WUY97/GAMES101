cmake_minimum_required(VERSION 3.10)
project(Rasterizer)

set(CMAKE_CXX_STANDARD 17)
# For Mac OS
if (APPLE)
    include_directories("/opt/homebrew/Cellar/eigen/3.4.0_1/include/")
endif ()
# For Ubuntu
if (UNIX AND NOT APPLE)
    find_package(Eigen3 REQUIRED)
endif ()

add_executable(Math main.cpp)
