import { Vector2 } from 'three';
import Mass from './Mass';

class Spring {
    m1: Mass;
    m2: Mass;
    k: number;
    restLength: number;

    constructor(m1: Mass, m2: Mass, k: number) {
        this.m1 = m1;
        this.m2 = m2;
        this.k = k;
        this.restLength = m1.position.distanceTo(m2.position);
    }
}

export default Spring;
