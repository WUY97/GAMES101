import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

function Demo15() {
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
    #define PI2 6.28318530718

    uniform vec2 u_mouse;
    uniform vec2 u_resolution;
    uniform float u_time;

    varying vec2 vUv;
    varying vec3 vPosition;


    float circle(vec2 pt, vec2 center, float radius, float line_width, float edge_thickness){
      float len = distance(pt, center);
      //Change true to false to soften the edge
      float result = smoothstep(radius-line_width/2.0-edge_thickness, radius-line_width/2.0, len) - smoothstep(radius + line_width/2.0, radius + line_width/2.0 + edge_thickness, len);

      return result;
    }

    float line(float x, float y, float line_width, float edge_thickness){
      return smoothstep(x-line_width/2.0-edge_thickness, x-line_width/2.0, y) - smoothstep(x+line_width/2.0, x+line_width/2.0+edge_thickness, y);
    }

    void main (void)
    {
      vec3 axis_color = vec3(0.8);
      vec2 adjustedCoords = vPosition.xy * u_resolution / min(u_resolution.x, u_resolution.y);
      vec3 color = line(vUv.y, 0.5, 0.002, 0.001) * axis_color;//xAxis
      color += line(vUv.x, 0.5, 0.002, 0.001) * axis_color;//yAxis
      color += circle(adjustedCoords, vec2(0.0), 0.8, 0.005, 0.002) * axis_color;
      color += circle(adjustedCoords, vec2(0.0), 0.4, 0.005, 0.002) * axis_color;
      color += circle(adjustedCoords, vec2(0.0), 0.2, 0.005, 0.002) * axis_color;
      gl_FragColor = vec4(color, 1.0); 
    }
    `;

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    const geometry = new THREE.PlaneGeometry(2, 2);

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
