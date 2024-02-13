import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

function Demo8() {
  const mountRef = useRef(null);

  useEffect(() => {
    const currMountRef = mountRef.current;

    const vshader = /*glsl*/ `
      varying vec3 vPosition;

      void main() {	
        vPosition = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
      }
      `;

    const fshader = /*glsl*/ `
      #define PI2 6.28318530718

      uniform vec2 u_resolution;
      uniform float u_time;
      
      varying vec3 vPosition;
      
      float rect(vec2 pt, vec2 size, vec2 center){
        //return 0 if not in box and 1 if it is
        //step(edge, x) 0.0 is returned if x < edge, and 1.0 is returned otherwise.
        vec2 halfsize = size * 0.5;
        vec2 p = pt - center;
        float horz = step(-halfsize.x, p.x) - step(halfsize.x, p.x);
        float vert = step(-halfsize.y, p.y) - step(halfsize.y, p.y);
        return horz * vert;
      }
      
      void main (void) {
        vec2 adjustedCoords = vPosition.xy * u_resolution / min(u_resolution.x, u_resolution.y);
        float radius = 0.5;
        float angle = u_time;
        float square = rect(adjustedCoords, vec2(0.5), vec2(cos(angle)*radius, sin(angle)*radius));
        vec3 color = vec3(1.0, 1.0, 0.0) * square;
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

export default Demo8;
