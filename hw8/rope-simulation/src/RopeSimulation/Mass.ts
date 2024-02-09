import { Vector2 } from 'three';

class Mass {
    startPosition: Vector2;
    position: Vector2;
    lastPosition: Vector2;
    mass: number;
    pinned: boolean;
    velocity: Vector2;
    forces: Vector2;

    constructor(position: Vector2, mass: number, pinned: boolean) {
        this.startPosition = position.clone();
        this.position = position.clone();
        this.lastPosition = position.clone();
        this.mass = mass;
        this.pinned = pinned;

        this.velocity = new Vector2();
        this.forces = new Vector2();
    }
}

export default Mass;
