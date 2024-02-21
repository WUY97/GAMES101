import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

function Demo18() {
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
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;
      uniform float u_time;
      uniform vec3 u_color_a;
      uniform vec3 u_color_b;
      
      varying vec2 vUv;
      
      // 2D Random
      float random (vec2 coord) {
          return fract(sin(dot(coord, vec2(12.9898,78.233))) * 43758.5453123);
      }
      
      // 2D Noise based on Morgan McGuire @morgan3d
      // https://www.shadertoy.com/view/4dS3Wd
      float noise (vec2 coord) {
          vec2 gridPoint = floor(coord);
          vec2 fractionalPart = fract(coord);
      
          // Calculate random values at the corners of the grid cell
          float valueBottomLeft = random(gridPoint);
          float valueBottomRight = random(gridPoint + vec2(1.0, 0.0));
          float valueTopLeft = random(gridPoint + vec2(0.0, 1.0));
          float valueTopRight = random(gridPoint + vec2(1.0, 1.0));
      
          // Perform smooth interpolation between grid corners
          vec2 smoothStepValue = fractionalPart * fractionalPart * (3.0 - 2.0 * fractionalPart);
          float mixFirstRow = mix(valueBottomLeft, valueBottomRight, smoothStepValue.x);
          float mixSecondRow = mix(valueTopLeft, valueTopRight, smoothStepValue.x);
          float mixedValues = mix(mixFirstRow, mixSecondRow, smoothStepValue.y);
      
          return mixedValues;
      }
      
      void main() {
          vec2 noiseValue = vec2(0.0);
          vec2 position;

          // Generate the noise x value
          // Each block modifies the position and accumulates noise contributions
          position = vec2(vUv.x * 1.4 + 0.01, vUv.y - u_time * 0.69);
          noiseValue.x = noise(position * 12.0);
          
          position = vec2(vUv.x * 0.5 - 0.033, vUv.y * 2.0 - u_time * 0.12);
          noiseValue.x += noise(position * 8.0);
          
          position = vec2(vUv.x * 0.94 + 0.02, vUv.y * 3.0 - u_time * 0.61);
          noiseValue.x += noise(position * 4.0);

          // Generate the noise y value
          position = vec2(vUv.x * 0.7 - 0.01, vUv.y - u_time * 0.27);
          noiseValue.y = noise(position * 12.0);
          
          position = vec2(vUv.x * 0.45 + 0.033, vUv.y * 1.9 - u_time * 0.61);
          noiseValue.y += noise(position * 8.0);
          
          position = vec2(vUv.x * 0.8 - 0.02, vUv.y * 2.5 - u_time * 0.51);
          noiseValue.y += noise(position * 4.0);
          
          // Average the accumulated noise values
          noiseValue /= 2.3;

          // Mix two colors based on the noise values
          vec3 color = mix(u_color_a, u_color_b, noiseValue.y * noiseValue.x);

          // Set the final color of the pixel
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
      u_resolution: { value: { x: 0, y: 0 } },
      u_color_a: { value: new THREE.Color(0xff0000) },
      u_color_b: { value: new THREE.Color(0xffff00) }
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

export default Demo18;
