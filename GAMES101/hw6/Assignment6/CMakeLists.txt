cmake_minimum_required(VERSION 3.10)
project(RayTracing)

set(CMAKE_CXX_STANDARD 17)

find_package(OpenCV REQUIRED)

# For Mac OS
if (APPLE)
    include_directories("/opt/homebrew/Cellar/eigen/3.4.0_1/include/")
endif ()
# For Ubuntu
if (UNIX AND NOT APPLE)
    find_package(Eigen3 REQUIRED)
endif ()

add_executable(RayTracing main.cpp Object.hpp Vector.cpp Vector.hpp Sphere.hpp global.hpp Triangle.hpp Scene.cpp
        Scene.hpp Light.hpp AreaLight.hpp BVH.cpp BVH.hpp Bounds3.hpp Ray.hpp Material.hpp Intersection.hpp
        Renderer.cpp Renderer.hpp)
