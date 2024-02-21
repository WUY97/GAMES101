import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

function Demo19() {
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
      uniform sampler2D u_tex;
      
      varying vec2 vUv;
      
      void main() {
        vec4 col;
        vec3 color;
        vec2 offset = vec2(u_time/4.0);
        if (vUv.x<0.5){
          if (vUv.y<0.5){
            col = texture2D(u_tex, vUv*2.0);
            color = vec3(col.b);
          }else{
            col = texture2D(u_tex, fract(vUv*2.0-vec2(0.0, 1.0)+offset)) ;
            color = vec3(col.r);
          }
        }else{
          if (vUv.y<0.5){
            col = texture2D(u_tex, fract(vUv*2.0-vec2(1.0, 0.0)-offset));
            color = vec3(col.a);
          }else{
            col = texture2D(u_tex, fract(vUv*2.0-vec2(1.0, 1.0)+offset));
            color = vec3(col.g);
          }
        }
      
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
      u_tex: {
        value: new THREE.TextureLoader().load(
          'https://s3-us-west-2.amazonaws.com/s.cdpn.io/2666677/flame.png'
        )
      },
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

export default Demo19;
