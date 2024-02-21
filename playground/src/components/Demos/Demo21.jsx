import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

function Demo21() {
  const mountRef = useRef(null);

  useEffect(() => {
    const currMountRef = mountRef.current;

    const vshader = /*glsl*/ `
        varying vec2 vUv;
        void main() {	
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
        }
    `;

    const fshader = /*glsl*/ `
        #define PI 3.141592653589
        #define PI2 6.28318530718
        
        uniform vec2 u_mouse;
        uniform vec2 u_resolution;
        uniform float u_time;
        uniform sampler2D u_tex;
        
        varying vec2 vUv;
        
        vec2 rotate(vec2 pt, float theta){
          float c = cos(theta);
          float s = sin(theta);
          float aspect = 2.0/1.5;
          mat2 mat = mat2(c,s,-s,c);
          pt.y /= aspect;
          pt = mat * pt;
          pt.y *= aspect;
          return pt;
        }
        
        void main (void) {
          vec2 uv = vUv;
          uv -= vec2(0.5);
          uv = rotate(uv, u_time);
          uv += vec2(0.5);
          vec3 color;
          if (uv.x<0.0||uv.x>1.0||uv.y<0.0||uv.y>1.0){
            color = vec3(0.0);
          }else{
            color = texture2D(u_tex, uv).rgb;
          }
          gl_FragColor = vec4(color, 1.0);
        }
    `;

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 5);

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    const geometry = new THREE.PlaneGeometry(2, 2);

    const clock = new THREE.Clock();

    const uniforms = {
      u_tex: {
        value: new THREE.TextureLoader().load(
          'https://s3-us-west-2.amazonaws.com/s.cdpn.io/2666677/sa1.jpg'
        )
      },
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

export default Demo21;
