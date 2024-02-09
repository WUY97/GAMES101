import Mass from './Mass';
import Spring from './Spring';
import { Vector2 } from 'three';

class Rope {
    masses: Mass[];
    springs: Spring[];
    dampingFactor: number;

    constructor(
        start: Vector2,
        end: Vector2,
        numNodes: number,
        nodeMass: number,
        k: number,
        pinnedNodes: number[],
        dampingFactor: number
    ) {
        this.masses = [];
        this.springs = [];
        this.dampingFactor = dampingFactor;

        // TODO (Part 1): Create a rope starting at `start`, ending at `end`, and
        // containing `num_nodes` nodes.
        if (numNodes <= 1) {
            throw new Error('numNodes must be greater than 1');
        }

        const delta = end
            .clone()
            .sub(start)
            .divideScalar(numNodes - 1);

        for (let i = 0; i < numNodes; i++) {
            const position = start.clone().add(delta.clone().multiplyScalar(i));
            const mass = new Mass(position, nodeMass, false);
            this.masses.push(mass);

            if (i > 0) {
                const spring = new Spring(
                    this.masses[i - 1],
                    this.masses[i],
                    k
                );
                this.springs.push(spring);
            }
        }

        pinnedNodes.forEach((i) => {
            if (i < this.masses.length) {
                this.masses[i].pinned = true;
            }
        });
    }

    simulateEuler(deltaT: number, gravity: Vector2) {
        for (const s of this.springs) {
            // TODO (Part 2): Use Hooke's law to calculate the force on a node
            const diff = s.m2.position.clone().sub(s.m1.position);
            const distance = diff.length() - s.restLength;
            const force = diff.normalize().multiplyScalar(s.k * distance);

            s.m1.forces.add(force);
            s.m2.forces.sub(force);
        }

        for (const m of this.masses) {
            if (!m.pinned) {
                // TODO (Part 2): Add the force due to gravity, then compute the new
                // velocity and position
                // Add gravity force
                m.forces.add(gravity.clone().multiplyScalar(m.mass));

                // Compute acceleration
                const acceleration = m.forces.clone().divideScalar(m.mass);

                // Update velocity and position using Euler's method
                m.velocity.add(acceleration.multiplyScalar(deltaT));
                m.position.add(m.velocity.clone().multiplyScalar(deltaT));

                // TODO (Part 2): Add global damping
                m.velocity.multiplyScalar(this.dampingFactor);
            }

            // Reset all forces on each mass
            m.forces.set(0, 0);
        }
    }

    simulateVerlet(deltaT: number, gravity: Vector2) {
        for (const s of this.springs) {
            // TODO (Part 3): Simulate one timestep of the rope using explicit Verlet
            // （solving constraints)
            const diff = s.m2.position.clone().sub(s.m1.position);
            const distance = diff.length() - s.restLength;
            const force = diff.normalize().multiplyScalar(s.k * distance);

            s.m1.forces.add(force);
            s.m2.forces.sub(force);
        }

        for (const m of this.masses) {
            if (!m.pinned) {
                // TODO (Part 3.1): Set the new position of the rope mass
                // Apply gravity
                m.forces = m.forces.add(gravity.multiplyScalar(m.mass));

                const acceleration = m.forces.divideScalar(m.mass);
                const velocity = m.position
                    .clone()
                    .sub(m.lastPosition)
                    .multiplyScalar(1 - this.dampingFactor);
                const newPos = m.position
                    .clone()
                    .add(velocity)
                    .add(acceleration.multiplyScalar(deltaT * deltaT));

                m.lastPosition = m.position.clone();
                m.position = newPos;
            }

            // Reset all forces on each mass
            m.forces.set(0, 0);
        }
    }
}

export default Rope;
