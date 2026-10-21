const REFERENCE = 128;
const TAU = Math.PI * 2;
const MAX_VERTICES = 65536;

const clamp01 = value => Math.max(0, Math.min(1, value));

function smoothstep(edge0, edge1, value) {
    const t = clamp01((value - edge0) / Math.max(1e-9, edge1 - edge0));
    return t * t * (3 - 2 * t);
}

function rangeEnvelope(frame, edge) {
    const range = frame.range;
    if (!range) return 1;
    const span = Math.max(1e-6, range.endSeconds - range.startSeconds);
    const progress = (frame.time - range.startSeconds) / span;
    return smoothstep(0, edge, progress) * smoothstep(0, edge, 1 - progress);
}

function fillBands(input, sensitivity, output, unit) {
    output.fill(0);
    const gain = Number.isFinite(sensitivity) ? sensitivity : 1;
    if (!Array.isArray(input) || input.length === 0) return output;

    if (unit === 'we-strength') {
        for (let i = 0; i < output.length; i++) {
            const value = input[i];
            output[i] = (typeof value === 'number' && Number.isFinite(value) ? value : 0) * gain;
        }
        return output;
    }

    if (unit === 'byte-frequency') {
        const sourceBands = Math.floor(input.length / 2);
        for (let band = 0; band < output.length; band++) {
            const start = Math.floor((band * sourceBands) / output.length);
            const end = Math.max(start + 1, Math.floor(((band + 1) * sourceBands) / output.length));
            let peak = 0;
            for (let channel = 0; channel < 2; channel++) {
                for (let i = start; i < end; i++) {
                    const value = input[channel * sourceBands + i];
                    if (typeof value === 'number' && Number.isFinite(value)) peak = Math.max(peak, value);
                }
            }
            output[band] = (peak / 255) * gain;
        }
        return output;
    }

    for (let band = 0; band < output.length; band++) {
        const start = Math.floor((band * input.length) / output.length);
        const end = Math.max(start + 1, Math.floor(((band + 1) * input.length) / output.length));
        let peak = 0;
        for (let i = start; i < end; i++) {
            const value = input[i];
            if (typeof value !== 'number' || !Number.isFinite(value)) continue;
            const magnitude = unit === 'signed-waveform' ? Math.abs(value) : value;
            if (magnitude > peak) peak = magnitude;
        }
        output[band] =
            (unit === 'signed-waveform' ? peak : Math.min(1, Math.log1p(peak) / Math.log1p(REFERENCE))) * gain;
    }
    return output;
}

function numberParameter(frame, id, fallback) {
    const value = frame.parameters?.[id]?.value;
    return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function stringParameter(frame, id, fallback) {
    const value = frame.parameters?.[id]?.value;
    return typeof value === 'string' && value ? value : fallback;
}

function rgb(hex, alpha = 1) {
    if (typeof hex !== 'string' || !/^#[0-9a-f]{6}$/i.test(hex)) return [1, 1, 1, alpha];
    return [
        parseInt(hex.slice(1, 3), 16) / 255,
        parseInt(hex.slice(3, 5), 16) / 255,
        parseInt(hex.slice(5, 7), 16) / 255,
        alpha,
    ];
}

function mixColor(a, b, t) {
    return [
        a[0] * (1 - t) + b[0] * t,
        a[1] * (1 - t) + b[1] * t,
        a[2] * (1 - t) + b[2] * t,
    ];
}

const fract = value => value - Math.floor(value);

function randomUnit(seed, index) {
    let n = Math.imul(seed ^ Math.imul(index + 1, 0x9e3779b9), 0x85ebca6b);
    n = Math.imul(n ^ (n >>> 13), 0xc2b2ae35);
    return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
}

class MeshBatch {
    constructor() {
        this.positions = new Float32Array(MAX_VERTICES * 3);
        this.colors = new Float32Array(MAX_VERTICES * 4);
        this.edges = new Float32Array(MAX_VERTICES * 2);
        this.pixelSize = 1 / 1080;
        this.count = 0;
    }

    reset() {
        this.count = 0;
    }

    vertex(x, y, color, distance = 0, halfWidth = 1) {
        if (this.count >= MAX_VERTICES) return;
        const index = this.count;
        this.positions[index * 3] = x;
        this.positions[index * 3 + 1] = y;
        this.positions[index * 3 + 2] = 0;
        this.colors[index * 4] = color[0];
        this.colors[index * 4 + 1] = color[1];
        this.colors[index * 4 + 2] = color[2];
        this.colors[index * 4 + 3] = color[3];
        this.edges[index * 2] = distance;
        this.edges[index * 2 + 1] = halfWidth;
        this.count++;
    }

    line(a, b, width, color) {
        const dx = b[0] - a[0];
        const dy = b[1] - a[1];
        const length = Math.hypot(dx, dy);
        if (length < 1e-9 || this.count + 6 > MAX_VERTICES) return;
        const half = Math.max(0.00002, width / 2);
        const outer = half + this.pixelSize;
        const nx = (-dy / length) * outer;
        const ny = (dx / length) * outer;
        const p = [a[0] + nx, a[1] + ny];
        const q = [b[0] + nx, b[1] + ny];
        const r = [b[0] - nx, b[1] - ny];
        const s = [a[0] - nx, a[1] - ny];
        this.vertex(p[0], p[1], color, outer, half);
        this.vertex(q[0], q[1], color, outer, half);
        this.vertex(r[0], r[1], color, -outer, half);
        this.vertex(p[0], p[1], color, outer, half);
        this.vertex(r[0], r[1], color, -outer, half);
        this.vertex(s[0], s[1], color, -outer, half);
    }
}

function createEmberChoir() {
    const batch = new MeshBatch();
    const levels = new Float32Array(64);
    return {
        prepareFrame(frame) {
            const spectrum = frame.parameters?.spectrum;
            fillBands(
                Array.isArray(spectrum?.value) ? spectrum.value : [],
                numberParameter(frame, 'sensitivity', 1),
                levels,
                spectrum?.unit,
            );
            let peak = 0;
            for (let i = 0; i < levels.length; i++) peak = Math.max(peak, levels[i]);
            const envelope = rangeEnvelope(frame, 0.08);
            if (envelope <= 0) return { passes: [], state: [peak, 0, 0] };

            const width = Math.max(1, frame.width);
            const height = Math.max(1, frame.height);
            const aspect = width / height;
            const time = frame.time;
            const count = Math.max(40, Math.min(900, Math.round(numberParameter(frame, 'count', 420))));
            const baseSize = Math.max(0.0002, numberParameter(frame, 'size', 0.004));
            const speed = numberParameter(frame, 'speed', 0.22);
            const spread = Math.max(0.05, numberParameter(frame, 'spread', 0.95));
            const x = clamp01(numberParameter(frame, 'x', 0.5));
            const y = clamp01(numberParameter(frame, 'y', 0.64));
            const rise = Math.max(0.05, numberParameter(frame, 'rise', 1));
            const swirl = numberParameter(frame, 'swirl', 0.45);
            const burst = Math.max(0, numberParameter(frame, 'burst', 1));
            const thickness = Math.max(0.05, numberParameter(frame, 'thickness', 1));
            const glow = Math.max(0, numberParameter(frame, 'glow', 1.2));
            const opacity = clamp01(numberParameter(frame, 'opacity', 1));
            const exposure = Math.max(0.01, numberParameter(frame, 'exposure', 1.1));
            const main = rgb(stringParameter(frame, 'color', '#ffb15a'));
            const accent = rgb(stringParameter(frame, 'accent', '#ff4f8b'));
            const seed = frame.seed | 0;
            const centerX = (x - 0.5) * aspect;
            const centerY = 0.5 - y;

            batch.reset();
            batch.pixelSize = 1 / height;

            for (let i = 0; i < count; i++) {
                const u1 = randomUnit(seed, i * 9 + 1);
                const u2 = randomUnit(seed, i * 9 + 2);
                const u3 = randomUnit(seed, i * 9 + 3);
                const u4 = randomUnit(seed, i * 9 + 4);
                const u5 = randomUnit(seed, i * 9 + 5);
                const u6 = randomUnit(seed, i * 9 + 6);
                const u7 = randomUnit(seed, i * 9 + 7);
                const u8 = randomUnit(seed, i * 9 + 8);

                const life = fract(u1 + time * speed * (0.035 + u2 * 0.055) * rise);
                const fadeIn = smoothstep(0, 0.12, life);
                const fadeOut = 1 - smoothstep(0.68, 1, life);
                const fade = fadeIn * fadeOut;
                if (fade <= 0) continue;

                const band = levels[Math.min(63, Math.floor(u3 * 64))] ?? 0;
                const angle = u4 * TAU + time * (0.15 + u5 * 0.35) * swirl + life * 1.4 * swirl;
                const px =
                    centerX +
                    (u6 - 0.5) * spread * aspect * 0.85 +
                    Math.sin(angle) * 0.045 * spread +
                    (life - 0.5) * 0.08 * swirl;
                const py = centerY - 0.36 + life * 0.94 + Math.cos(angle * 0.7) * 0.015;
                const alpha = clamp01(
                    opacity * envelope * fade * (0.22 + band * 0.95) * (0.55 + 0.45 * peak) * exposure,
                );
                if (alpha <= 0.0005) continue;

                const size =
                    baseSize *
                    (0.35 + u7 * 1.05) *
                    (1 + band * burst * 2.4) *
                    (0.55 + fade * 0.45);
                const trail = size * (3.0 + band * 7.0) * (0.8 + 0.2 * Math.sin(time * 2.0 + u4 * TAU));
                const dx = Math.sin(angle) * trail * 0.22 * swirl + Math.sin(time * 0.7 + u5 * TAU) * trail * 0.08;
                const dy = trail * (0.85 + 0.15 * Math.cos(angle));
                const ink = mixColor(main, accent, clamp01(u5 * 0.85 + band * 0.2));
                const coreWidth = Math.max(0.00018, thickness * 0.0008 * (0.7 + band * 1.2));
                const color = [ink[0], ink[1], ink[2], alpha];

                if (glow > 0.01) {
                    batch.line([px, py], [px - dx, py - dy], coreWidth * (4.5 + glow * 2.0), [
                        ink[0],
                        ink[1],
                        ink[2],
                        alpha * 0.05 * glow,
                    ]);
                    batch.line([px, py], [px - dx, py - dy], coreWidth * 2.2, [
                        ink[0],
                        ink[1],
                        ink[2],
                        alpha * 0.18 * glow,
                    ]);
                }
                batch.line([px, py], [px - dx, py - dy], coreWidth, color);

                if (band > 0.5 && u8 > 0.55) {
                    const flare = size * (5.0 + band * 8.0);
                    batch.line([px - flare, py], [px + flare, py], coreWidth * 0.8, [
                        ink[0],
                        ink[1],
                        ink[2],
                        alpha * 0.35,
                    ]);
                    batch.line([px, py - flare], [px, py + flare], coreWidth * 0.8, [
                        ink[0],
                        ink[1],
                        ink[2],
                        alpha * 0.35,
                    ]);
                }
            }

            return {
                passes: [
                    {
                        program: 'draw',
                        uniforms: {},
                        mesh: {
                            positions: batch.positions.slice(0, batch.count * 3),
                            colors: batch.colors.slice(0, batch.count * 4),
                            edges: batch.edges.slice(0, batch.count * 2),
                        },
                    },
                ],
                state: [peak, envelope, batch.count],
            };
        },
        reset() {},
        dispose() {},
    };
}
