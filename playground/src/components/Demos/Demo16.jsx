import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

function Demo16() {
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
    uniform vec3 u_color_a;
    uniform vec3 u_color_b;

    varying vec2 vUv;

    float brick(vec2 point, float mortar_height, float edge_thickness){
      // Adjust the horizontal coordinate for every alternate row to create the brick pattern
      if (point.y > 0.5) {
        point.x = fract(point.x + 0.5);
      }

      // Draw vertical lines of the bricks
      float vertical_lines = 1.0 - smoothstep(mortar_height/2.0, mortar_height/2.0 + edge_thickness, point.x) + smoothstep(1.0 - mortar_height/2.0 - edge_thickness, 1.0 - mortar_height/2.0, point.x);

      // Draw top and bottom lines of the bricks
      float top_bottom_lines = 1.0 - smoothstep(mortar_height/2.0, mortar_height/2.0 + edge_thickness, point.y) + smoothstep(1.0 - mortar_height/2.0 - edge_thickness, 1.0 - mortar_height/2.0, point.y);

      // Draw the middle line of the bricks for the mortar
      float middle_line = smoothstep(0.5 - mortar_height/2.0 - edge_thickness, 0.5 - mortar_height/2.0, point.y) - smoothstep(0.5 + mortar_height/2.0, 0.5 + mortar_height/2.0 + edge_thickness, point.y);

      // Combine the results for vertical, top-bottom, and middle lines
      float result = vertical_lines + top_bottom_lines + middle_line;

      return clamp(result, 0.0, 1.0);
    }

    void main (void) {
      // Adjust coordinates based on the resolution to maintain aspect ratio
      vec2 adjustedCoords = vUv * u_resolution / min(u_resolution.x, u_resolution.y);

      // Calculate the UV coordinates for the brick pattern
      vec2 uv = fract(adjustedCoords * 10.0);

      // Calculate the color based on the brick pattern
      vec3 color = mix(u_color_a, u_color_b, brick(uv, 0.05, 0.001));

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
      u_time: { value: 0.0 },
      u_mouse: { value: { x: 0.0, y: 0.0 } },
      u_resolution: { value: { x: 0, y: 0 } },
      u_color_a: { value: new THREE.Color(0xaa4a44) },
      u_color_b: { value: new THREE.Color(0x808080) }
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

export default Demo16;
