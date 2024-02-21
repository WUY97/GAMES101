import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

function Demo23() {
  const mountRef = useRef(null);
  const controlsRef = useRef();

  useEffect(() => {
    const mount = mountRef.current;
    const uniforms = {};
    uniforms.u_time = { value: 0.0 };
    uniforms.u_resolution = { value: { x: 0, y: 0 } };
    uniforms.u_radius = { value: 20.0 };

    // Initialize scene, camera, renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.z = 100;
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    mount.appendChild(renderer.domElement);

    // Geometry and material
    const geometry = new THREE.BoxGeometry(30, 30, 30, 10, 10, 10);
    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: vertexShader(),
      fragmentShader: fragmentShader(),
      wireframe: true
    });

    // Add mesh to scene
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    // OrbitControls
    controlsRef.current = new OrbitControls(camera, renderer.domElement);

    // Animation loop
    const clock = new THREE.Clock();
    const animate = () => {
      requestAnimationFrame(animate);
      uniforms.u_time.value += clock.getDelta();
      renderer.render(scene, camera);
    };
    animate();

    // Resize observer
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
        uniforms.u_resolution.value.x = width;
        uniforms.u_resolution.value.y = height;
      }
    });
    resizeObserver.observe(mount);

    // Cleanup
    return () => {
      resizeObserver.unobserve(mount);
      mount.removeChild(renderer.domElement);
    };
  }, []);

  // Vertex shader
  const vertexShader = () => /*glsl*/ `
    uniform float u_time;
    uniform float u_radius;
    
    varying vec3 vPosition;
    
    float getDelta(){
      return ((sin(u_time)+1.0)/2.0);
    }
    
    void main() {
      float delta = getDelta();
      vPosition = position;
    
      vec3 v = normalize(position) * u_radius;
      vec3 pos = mix(position, v, delta);
      // pos = position;
    
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `;

  // Fragment shader
  const fragmentShader = () => /*glsl*/ `
    void main() {
      vec3 color = vec3(0.5);
      gl_FragColor = vec4(color, 1.0);
    }
  `;

  return <div ref={mountRef} style={{ width: '100%', height: '100%' }}></div>;
}

export default Demo23;
