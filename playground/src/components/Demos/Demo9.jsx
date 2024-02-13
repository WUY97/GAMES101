import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

function Demo9() {
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
      uniform vec3 u_color;
      
      varying vec3 vPosition;
      
      float rect(vec2 pt, vec2 anchor, vec2 size, vec2 center){
        vec2 halfsize = size * 0.5;
        vec2 p = pt - center;
        float horz = step(-halfsize.x - anchor.x, p.x) - step(halfsize.x - anchor.x, p.x);
        float vert = step(-halfsize.y - anchor.y, p.y) - step(halfsize.y - anchor.y, p.y);
        return horz * vert;
      }

      mat2 getRotationMatrix(float theta){
        float s = sin(theta);
        float c = cos(theta);
        return mat2(c, -s, s, c);
      }
      
      void main (void) {
        vec2 adjustedCoords = vPosition.xy * u_resolution / min(u_resolution.x, u_resolution.y);
        vec2 center = vec2(0.0);
        mat2 mat = getRotationMatrix(u_time);
        vec2 pt = adjustedCoords - center;
        pt = mat * pt;
        pt += center;
        vec3 color = u_color * rect(pt, vec2(0.15), vec2(0.3), center);
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

export default Demo9;
