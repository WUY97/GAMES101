cmake_minimum_required(VERSION 3.10)
project(RayTracing)

# For Mac OS
include_directories("/opt/homebrew/Cellar/eigen/3.4.0_1/include/")
include_directories("/opt/homebrew/Cellar/opencv/4.9.0_2/include/opencv4")

set(CMAKE_CXX_STANDARD 17)

add_executable(RayTracing main.cpp Object.hpp Vector.cpp Vector.hpp Sphere.hpp global.hpp Triangle.hpp Scene.cpp
        Scene.hpp Light.hpp AreaLight.hpp BVH.cpp BVH.hpp Bounds3.hpp Ray.hpp Material.hpp Intersection.hpp
        Renderer.cpp Renderer.hpp)
