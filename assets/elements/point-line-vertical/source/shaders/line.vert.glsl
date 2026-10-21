attribute vec4 ink;
attribute vec2 edge;
uniform float uAspect;
varying float vOpacity;
varying float vIsLine;
varying vec2 vUv;
void main() {
    vOpacity = ink.a;
    vIsLine = edge.x;
    vUv = vec2(position.x / uAspect + 0.5, position.y + 0.5);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
