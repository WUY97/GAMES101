cmake_minimum_required(VERSION 3.10)
project(BezierCurve)

# For Mac OS
include_directories("/opt/homebrew/Cellar/eigen/3.4.0_1/include/")
include_directories("/opt/homebrew/Cellar/opencv/4.9.0_2/include/opencv4")

find_package(OpenCV REQUIRED)

set(CMAKE_CXX_STANDARD 14)

add_executable(BezierCurve main.cpp)

target_link_libraries(BezierCurve ${OpenCV_LIBRARIES})
