import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

function Demo15() {
  const mountRef = useRef(null);

  useEffect(() => {
    const currMountRef = mountRef.current;

    const vshader = /*glsl*/ `
      // Varying variables to pass data to the fragment shader
      varying vec2 vUv;        // Texture coordinates
      varying vec3 vPosition;  // Vertex position

      void main() {
          // Assign texture coordinates and position to varying variables
          vUv = uv;
          vPosition = position;

          // Calculate the final position of the vertex
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;

    const fshader = /*glsl*/ `
    #define PI 3.141592653589
    #define PI2 6.28318530718

    uniform vec2 u_mouse;
    uniform vec2 u_resolution;
    uniform float u_time;

    varying vec2 vUv;
    varying vec3 vPosition;


    float circle(vec2 point, vec2 center, float radius, float line_width, float edge_thickness){
      // Calculate the distance from the point to the center of the circle
      float distance_to_center = distance(point, center);

      // Calculate the smooth transition for the inner edge of the ring
      float inner_edge = smoothstep(radius - line_width / 2.0 - edge_thickness, radius - line_width / 2.0, distance_to_center);
      
      // Calculate the smooth transition for the outer edge of the ring
      float outer_edge = smoothstep(radius + line_width / 2.0, radius + line_width / 2.0 + edge_thickness, distance_to_center);

      // Combine the gradients of the inner and outer edges to get the final result
      float result = inner_edge - outer_edge;

      return result;
    }

    float sweep(vec2 point, vec2 center, float radius, float line_width, float edge_thickness){
        // Calculate the vector from the point to the center
        vec2 direction = point - center;

        // Calculate the angle of the sweeping line based on time
        float theta = fract(u_time / 4.0) * PI2;
        vec2 line_direction = vec2(cos(theta), -sin(theta)) * radius;

        // Calculate the projection length of the point on the line direction, clamped between 0.0 and 1.0
        float projection = clamp(dot(direction, line_direction) / dot(line_direction, line_direction), 0.0, 1.0);

        // Calculate the distance from the point to the sweeping line
        float distance = length(direction - line_direction * projection);

        // Initialize the gradient value
        float gradient = 0.0;
        const float gradient_angle = 1.0;

        // If the point is inside the circle, calculate the gradient based on the angle difference
        if (length(direction) < radius) {
            float angle_difference = mod(theta + atan(direction.y, direction.x), PI2);
            gradient = clamp(gradient_angle - angle_difference, 0.0, gradient_angle) * 0.5;
        }

        // Compute the final color value, combining line width and edge thickness for a smooth transition
        return gradient + 1.0 - smoothstep(line_width, line_width + edge_thickness, distance);
    }

    float line(float position_x, float position_y, float line_width, float edge_thickness) {
      // Calculate the smooth transition for the left edge of the line
      float left_edge = smoothstep(position_x - line_width / 2.0 - edge_thickness, position_x - line_width / 2.0, position_y);
      
      // Calculate the smooth transition for the right edge of the line
      float right_edge = smoothstep(position_x + line_width / 2.0, position_x + line_width / 2.0 + edge_thickness, position_y);
  
      // Combine the gradients of the left and right edges to get the final result
      float result = left_edge - right_edge;
  
      return result;
    }

    float polygon(vec2 point, vec2 center, float radius, int sides, float rotation, float edge_thickness) {
      // Translate the point relative to the polygon center
      point -= center;
  
      // Calculate the angle from the current pixel to the center and adjust with rotation
      float angle = atan(point.y, point.x) + rotation;
      // Calculate the angle for each polygon side
      float side_angle = PI2 / float(sides);
  
      // Shaping function to modulate the distance based on the polygon sides
      float distance_modulation = cos(floor(0.5 + angle / side_angle) * side_angle - angle) * length(point);
  
      // Return the smoothstep value for creating the polygon edge
      return 1.0 - smoothstep(radius, radius + edge_thickness, distance_modulation);
    }

    void main (void) {
      // Define the color for the axes and circles
      vec3 axis_color = vec3(0.8);
  
      // Adjust coordinates based on the resolution to maintain aspect ratio
      vec2 adjustedCoords = vPosition.xy * u_resolution / min(u_resolution.x, u_resolution.y);
  
      // Initialize color with the horizontal line (x-axis) drawing
      vec3 color = line(vUv.y, 0.5, 0.002, 0.001) * axis_color;
  
      // Add vertical line (y-axis) to the color
      color += line(vUv.x, 0.5, 0.002, 0.001) * axis_color;
  
      // Add three circles with different radii to the color
      color += circle(adjustedCoords, vec2(0.0), 0.8, 0.005, 0.002) * axis_color;
      color += circle(adjustedCoords, vec2(0.0), 0.4, 0.005, 0.002) * axis_color;
      color += circle(adjustedCoords, vec2(0.0), 0.2, 0.005, 0.002) * axis_color;
  
      // Add a sweeping effect with a different color
      color += sweep(adjustedCoords, vec2(0), 0.8, 0.003, 0.001) * vec3(0.1, 0.3, 1.0);

      // Add polygons
      color += polygon(adjustedCoords, vec2(1.0 - sin(u_time*3.0)*0.05, 0), 0.05, 3, 0.0, 0.001) * vec3(1.0);
      color += polygon(adjustedCoords, vec2(-1.0 - sin(u_time*3.0+PI)*0.05, 0), 0.05, 3, PI, 0.001) * vec3(1.0);
  
      // Set the final fragment color
      gl_FragColor = vec4(color, 1.0); 
    }
    `;

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    const geometry = new THREE.PlaneGeometry(2, 2);

    const clock = new THREE.Clock();

    const uniforms = {
      u_color: { value: new THREE.Color(0xff0000) },
      u_time: { value: 0.0 },
      u_mouse: { value: { x: 0.0, y: 0.0 } },
      u_resolution: { value: { x: 0, y: 0 } }
    };

    const material = new THREE.ShaderMaterial({
      uniforms: uniforms,
      vertexShader: vshader,
      fragmentShader: fshader
    });

    const plane = new THREE.Mesh(geometry, material);
    scene.add(plane);

    camera.position.z = 1;

    function animate() {
      requestAnimationFrame(animate);
      uniforms.u_time.value += clock.getDelta();
      renderer.render(scene, camera);
    }
    animate();

    let resizeObserver;
    if (ResizeObserver) {
      resizeObserver = new ResizeObserver((entries) => {
        for (let entry of entries) {
          const { width, height } = entry.contentRect;
          camera.aspect = width / height;
          camera.updateProjectionMatrix();
          renderer.setSize(width, height);
          uniforms.u_resolution.value.x = width;
          uniforms.u_resolution.value.y = height;
        }
      });
      resizeObserver.observe(mountRef.current);
    }

    return () => {
      if (resizeObserver && currMountRef) {
        resizeObserver.unobserve(currMountRef);
      }
      if (currMountRef) {
        currMountRef.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={mountRef} style={{ width: '100%', height: '100%' }}></div>;
}

export default Demo15;
