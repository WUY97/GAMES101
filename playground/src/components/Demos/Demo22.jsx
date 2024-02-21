import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

function Demo22() {
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
    uniform float u_duration;
    uniform sampler2D u_tex;
    
    varying vec2 vUv;
    
    void main (void) {
      vec2 p = vUv*2.0 - 1.0;
      float len = length(p);
      vec2 ripple = vUv + p/len*0.03*cos(len*12.0-u_time*4.0);
      float delta = (((sin(u_time)+1.0)/2.0)* u_duration)/u_duration;
      vec2 uv = mix(ripple, vUv, delta);
      vec3 color = texture2D(u_tex, uv).rgb;
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

export default Demo22;
