precision highp float;
uniform vec3 uColor;
uniform sampler2D uImage;
uniform bool uHasImage;
varying float vOpacity;
varying float vIsLine;
varying vec2 vUv;
void main() {
    if (vIsLine < 0.5) {
        gl_FragColor = uHasImage ? texture2D(uImage, vUv) : vec4(0.0);
    } else {
        gl_FragColor = vec4(uColor * vOpacity, vOpacity);
    }
}
