import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

function Demo12() {
  const mountRef = useRef(null);

  useEffect(() => {
    const currMountRef = mountRef.current;

    const vshader = /*glsl*/ `
      varying vec2 vUv;
      varying vec3 vPosition;

      void main() {
        vUv = uv;
        vPosition = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
      }
      `;

    const fshader = /*glsl*/ `
      uniform vec2 u_resolution;
      uniform float u_time;
      uniform vec3 u_color;
      
      varying vec2 vUv;
      varying vec3 vPosition;
      
      float circle(vec2 pt, vec2 center, float radius, float edge_thickness){
        vec2 p = pt - center;
        float len = length(p);
        float result = 1.0-smoothstep(radius-edge_thickness, radius, len);
      
        return result;
      }

      float circle2(vec2 pt, vec2 center, float radius, float line_width, float edge_thickness){
        vec2 p = pt - center;
        float len = length(p);
        float half_line_width = line_width/2.0;
        float result = smoothstep(radius-half_line_width-edge_thickness, radius-half_line_width, len) - smoothstep(radius + half_line_width, radius + half_line_width + edge_thickness, len);
      
        return result;
      }
      
      void main (void) {
        vec2 adjustedCoords = vPosition.xy * u_resolution / min(u_resolution.x, u_resolution.y);
        float circle1 = circle(adjustedCoords, vec2(0.3), 0.2, 0.002);
        float circle2 = circle2(adjustedCoords, vec2(0.0), 0.5, 0.01, 0.002);
        float combinedCircles = max(circle1, circle2);
        vec3 color = u_color * combinedCircles;
        gl_FragColor = vec4(color, 1.0); 
      }
    `;

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    const clock = new THREE.Clock();

    const geometry = new THREE.PlaneGeometry(2, 2);

    const uniforms = {
      u_color: { value: new THREE.Color(0xffff00) },
      u_time: { value: 0.0 },
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

export default Demo12;
