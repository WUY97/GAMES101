import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

function Demo20() {
  const mountRef = useRef(null);

  useEffect(() => {
    const currMountRef = mountRef.current;

    const vshader = /*glsl*/ `
      // Varying variables to pass data to the fragment shader
      varying vec2 vUv;        // Texture coordinates

      void main() {
          // Assign texture coordinates and position to varying variables
          vUv = uv;

          // Calculate the final position of the vertex
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;

    const fshader = /*glsl*/ `
      uniform vec2 u_resolution;
      uniform float u_time;
      uniform sampler2D u_tex;
      
      varying vec2 vUv;
      
      void main() {
        vec2 noise = vec2(0.0);
        float time = u_time;
      
        // Generate noisy x value
        vec2 uv = vec2(vUv.x*1.4 + 0.01, fract(vUv.y - time*0.69));
        noise.x = (texture2D(u_tex, uv).w-0.5)*2.0;
        uv = vec2(vUv.x*0.5 - 0.033, fract(vUv.y*2.0 - time*0.12));
        noise.x += (texture2D(u_tex, uv).w-0.5)*2.0;
        uv = vec2(vUv.x*0.94 + 0.02, fract(vUv.y*3.0 - time*0.61));
        noise.x += (texture2D(u_tex, uv).w-0.5)*2.0;
        
        // Generate noisy y value
        uv = vec2(vUv.x*0.7 - 0.01, fract(vUv.y - time*0.27));
        noise.y = (texture2D(u_tex, uv).w-0.5)*2.0;
        uv = vec2(vUv.x*0.45 + 0.033, fract(vUv.y*1.9 - time*0.61));
        noise.y = (texture2D(u_tex, uv).w-0.5)*2.0;
        uv = vec2(vUv.x*0.8 - 0.02, fract(vUv.y*2.5 - time*0.51));
        noise.y += (texture2D(u_tex, uv).w-0.5)*2.0;
        
        noise = clamp(noise, -1.0, 1.0);
      
        float perturb = (1.0 - vUv.y) * 0.35 + 0.02;
        noise = (noise * perturb) + vUv - 0.02;
      
        vec4 color = texture2D(u_tex, noise);
        color = vec4(color.r*2.0, color.g*0.9, (color.g/color.r)*0.2, 1.0);
        noise = clamp(noise, 0.05, 1.0);
        color.a = texture2D(u_tex, noise).b*2.0;
        color.a = color.a*texture2D(u_tex, vUv).b;
      
        gl_FragColor = color;
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
          'https://s3-us-west-2.amazonaws.com/s.cdpn.io/2666677/flame.png'
        )
      },
      u_time: { value: 0.0 },
      u_resolution: { value: { x: 0, y: 0 } }
    };

    const material = new THREE.ShaderMaterial({
      uniforms: uniforms,
      vertexShader: vshader,
      fragmentShader: fshader,
      transparent: true
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

export default Demo20;
