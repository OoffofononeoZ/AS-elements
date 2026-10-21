precision highp float;

varying vec2 vUv;

uniform sampler2D uImage;
uniform float uAmount;
uniform float uBloom;
uniform float uAberration;
uniform float uVignette;
uniform float uGrain;
uniform float uTemperature;
uniform float uWarp;
uniform float uExposure;
uniform float uPulse;
uniform float uTime;
uniform vec2 uViewport;

float hash21(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += vec2(dot(p, p + 45.32));
    return fract(p.x * p.y);
}

vec4 sampleImage(vec2 point) {
    return texture2D(uImage, clamp(point, vec2(0.0), vec2(1.0)));
}

void main() {
    vec2 uv = vUv;
    float pulse = clamp(uPulse, 0.0, 1.0);
    float warp = uWarp * (0.0007 + 0.0012 * pulse);
    uv += vec2(
        sin(vUv.y * 40.0 + uTime * 1.6),
        cos(vUv.x * 34.0 + uTime * 1.3)
    ) * warp;

    vec2 direction = uv - 0.5;
    float radial = dot(direction, direction);
    vec2 offset = direction * (uAberration / 1000.0) * (0.35 + 1.8 * radial) * (1.0 + pulse * 0.8);

    vec3 color;
    color.r = sampleImage(uv + offset).r;
    color.g = sampleImage(uv).g;
    color.b = sampleImage(uv - offset).b;

    vec3 bloom = vec3(0.0);
    float radius = 2.4 / uViewport.y;
    for (int i = 0; i < 8; i++) {
        float angle = float(i) * 0.7853981634;
        bloom += sampleImage(uv + vec2(cos(angle), sin(angle)) * radius).rgb;
    }
    for (int i = 0; i < 4; i++) {
        float angle = float(i) * 1.5707963268 + 0.3926990817;
        bloom += sampleImage(uv + vec2(cos(angle), sin(angle)) * radius * 2.2).rgb;
    }
    bloom /= 12.0;
    float bloomLuma = dot(bloom, vec3(0.2126, 0.7152, 0.0722));
    bloom *= smoothstep(0.15, 0.65, bloomLuma);
    color += bloom * uBloom * (1.0 + pulse * 0.7);

    float luma = dot(color, vec3(0.2126, 0.7152, 0.0722));
    if (uTemperature > 0.0) {
        color = mix(color, color * vec3(1.08, 1.0, 0.86), uTemperature);
    } else {
        color = mix(color, color * vec3(0.88, 0.98, 1.16), -uTemperature);
    }
    color = mix(color, color * vec3(1.0, 1.0, 1.04), (1.0 - luma) * 0.05);

    color = color / (1.0 + color * 0.16);
    color = pow(max(color, vec3(0.0)), vec3(0.95));

    vec2 vignettePoint = (vUv - 0.5) * vec2(uViewport.x / uViewport.y, 1.0);
    float vignette = smoothstep(0.25, 0.95, length(vignettePoint));
    color *= 1.0 - uVignette * 0.55 * vignette;

    float grain = hash21(vUv * uViewport + uTime * 60.0);
    color += (grain - 0.5) * uGrain * 0.12;
    color *= uExposure * (1.0 + pulse * 0.06);

    vec3 original = sampleImage(vUv).rgb;
    color = mix(original, color, clamp(uAmount, 0.0, 1.0));
    float alpha = sampleImage(vUv).a;
    gl_FragColor = vec4(color * alpha, alpha);
}
