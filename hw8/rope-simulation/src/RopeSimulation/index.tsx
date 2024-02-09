import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import Rope from './Rope';

interface Config {
    mass: number;
    ks: number;
    stepsPerFrame: number;
    gravity: THREE.Vector2;
    dampingFactor: number;
}

function RopeSimulation() {
    const mountRef = useRef<HTMLDivElement>(null);
    const sceneRef = useRef<THREE.Scene>(new THREE.Scene());

    useEffect(() => {
        const config: Config = {
            mass: 1,
            ks: 100,
            stepsPerFrame: 64,
            gravity: new THREE.Vector2(0, -1),
            dampingFactor: 0.01

        };

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        camera.position.set(0, 0, 10);
        camera.lookAt(scene.position);

        const renderer = new THREE.WebGLRenderer();
        renderer.setSize(window.innerWidth, window.innerHeight);

        const ropeEuler = new Rope(
            new THREE.Vector2(0, 1),
            new THREE.Vector2(2, -1),
            config.stepsPerFrame,
            config.mass,
            config.ks,
            [0, 19, 63],
            config.dampingFactor
        );

        const ropeVerlet = new Rope(
            new THREE.Vector2(0, 1),
            new THREE.Vector2(-2, -1),
            config.stepsPerFrame,
            config.mass,
            config.ks,
            [0, 19, 63],
            config.dampingFactor
        );

        function renderRope(rope: Rope, lineMaterial: THREE.Material, pointMaterial: THREE.PointsMaterial) {
            const vertices = [];
            for (const mass of rope.masses) {
                vertices.push(mass.position.x, mass.position.y, 0);
            }

            const lineGeometry = new THREE.BufferGeometry();
            const lineVerticesArray = new Float32Array(vertices);
            lineGeometry.setAttribute('position', new THREE.BufferAttribute(lineVerticesArray, 3));
            const line = new THREE.Line(lineGeometry, lineMaterial);
            sceneRef.current.add(line);

            const pointGeometry = new THREE.BufferGeometry();
            pointGeometry.setAttribute('position', new THREE.BufferAttribute(lineVerticesArray, 3));
            const points = new THREE.Points(pointGeometry, pointMaterial);
            sceneRef.current.add(points);

            lineGeometry.attributes.position.needsUpdate = true;
            pointGeometry.attributes.position.needsUpdate = true;
        }


        if (mountRef.current) {
            mountRef.current.appendChild(renderer.domElement);
        }

        function animate() {
            requestAnimationFrame(animate);

            sceneRef.current.children = [];

            for (let i = 0; i < config.stepsPerFrame; i++) {
                ropeEuler.simulateEuler(1 / config.stepsPerFrame, config.gravity);
                ropeVerlet.simulateVerlet(1 / config.stepsPerFrame, config.gravity);
            }

            renderRope(ropeEuler, new THREE.LineBasicMaterial({ color: 0x0000ff }), new THREE.PointsMaterial({ color: 0x0000ff, size: 0.1 }));
            renderRope(ropeVerlet, new THREE.LineBasicMaterial({ color: 0x00ff00 }), new THREE.PointsMaterial({ color: 0x00ff00, size: 0.1 }));

            renderer.render(sceneRef.current, camera);
        }
        animate();

        function handleResize() {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        }

        function handleKeyDown(event: KeyboardEvent) {
            switch (event.key) {
                case 'ArrowDown':
                    if (config.stepsPerFrame > 1) {
                        config.stepsPerFrame /= 2;
                    }
                    break;
                case 'ArrowUp':
                    config.stepsPerFrame *= 2;
                    break;
                default:
                    break;
            }
        }

        window.addEventListener('resize', handleResize);
        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('keydown', handleKeyDown);
            if (mountRef.current) {
                mountRef.current.removeChild(renderer.domElement);
            }
        };
    }, []);

    return <div ref={mountRef}></div>;
}

export default RopeSimulation;
