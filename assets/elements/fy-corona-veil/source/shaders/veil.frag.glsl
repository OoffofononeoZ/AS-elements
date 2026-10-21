precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform float uAspect;
uniform vec3 uHot;
uniform vec3 uCool;
uniform vec3 uVoid;
uniform float uOpacity;
uniform float uGlow;
uniform float uDensity;
uniform float uRays;
uniform vec2 uCenter;
uniform float uBass;
uniform float uMid;
uniform float uTreble;
uniform float uPeak;
uniform float uIdle;
uniform float uExposure;
uniform float uEnvelope;

float hash21(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += vec2(dot(p, p + 45.32));
    return fract(p.x * p.y);
}

float valueNoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = hash21(i);
    float b = hash21(i + vec2(1.0, 0.0));
    float c = hash21(i + vec2(0.0, 1.0));
    float d = hash21(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    for (int i = 0; i < 5; i++) {
        value += amplitude * valueNoise(p);
        p = p * 2.03 + vec2(1.7, 9.2);
        amplitude *= 0.5;
    }
    return value;
}

void main() {
    vec2 uv = vUv;
    vec2 p = (uv - uCenter) * vec2(uAspect, 1.0);
    float radius = length(p);
    float angle = atan(p.y, p.x + 1e-6);
    vec2 q = p * uDensity;
    float time = uTime;

    float turbulence = fbm(q * 2.4 + vec2(time * 0.06, -time * 0.045));
    float rayShape = pow(max(0.0, sin(angle * uRays + turbulence * 4.6 + time * 0.32)), 9.0);
    float rayFalloff = exp(-radius * 2.2);
    float corona = (0.26 + rayShape * 0.74) * rayFalloff * (0.5 + uMid * 1.35 + uPeak * 0.45);
    float core = exp(-radius * radius * 24.0) * (0.72 + uBass * 1.6);
    float rim = exp(-abs(radius - 0.23) * 52.0) * (0.32 + uBass * 0.9);
    float halo = exp(-radius * 2.8) * (0.16 + uTreble * 0.6);

    vec3 color = uVoid;
    color += uHot * core * (0.8 + uGlow * 0.5);
    color += mix(uHot, vec3(1.0, 0.82, 0.55), 0.35) * rim * (0.8 + uGlow * 0.4);
    color += uHot * corona * (0.55 + uGlow * 0.45);
    color += uCool * halo * (0.5 + uGlow * 0.5);

    vec2 starCell = floor(uv * vec2(uAspect, 1.0) * 180.0);
    vec2 starLocal = fract(uv * vec2(uAspect, 1.0) * 180.0) - 0.5;
    float starHash = hash21(starCell);
    float star = (1.0 - smoothstep(0.0, 0.12, length(starLocal))) * step(0.988, starHash);
    star *= 0.35 + 0.65 * (0.5 + 0.5 * sin(time * 3.0 + starHash * 40.0));
    color += vec3(0.75, 0.85, 1.0) * star * 0.5 * (0.4 + uTreble * 0.8);

    float idle = uIdle * (0.55 + 0.45 * sin(time * 0.7));
    color += uHot * idle * 0.12 * exp(-radius * 2.0);

    color *= 1.0 - 0.55 * smoothstep(0.35, 1.15, radius);
    color = color / (1.0 + color * 0.28);
    color = pow(max(color, vec3(0.0)), vec3(0.92));
    color *= uExposure * (0.35 + 0.65 * uEnvelope);

    float alpha = clamp(uOpacity * uEnvelope, 0.0, 1.0);
    gl_FragColor = vec4(color * alpha, alpha);
}
