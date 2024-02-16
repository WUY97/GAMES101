import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

function Demo13() {
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

      varying vec2 vUv;
      varying vec3 vPosition;

      float line(float x, float y, float line_width, float edge_width){
        return smoothstep(x-line_width/2.0-edge_width, x-line_width/2.0, y) - smoothstep(x+line_width/2.0, x+line_width/2.0+edge_width, y);
      }
        
      void main (void) {
        vec2 uv = gl_FragCoord.xy;
        float aspect = u_resolution.x / u_resolution.y;
        float lineVal = abs(uv.x - uv.y * aspect);
        vec3 color = mix(vec3(0.1), vec3(1.0), line(lineVal, -1.0, 10.0, 1.0));
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

export default Demo13;
