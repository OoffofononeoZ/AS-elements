const REFERENCE = 128;
const TAU = Math.PI * 2;
const FLOOR = -0.18;
const COLUMN_TOP = 0.12;
const ARCH_APEX = 0.5;
const RIDGE = 0.56;
const ROSE_Y = 0.3;
const HALF_WIDTH = 0.45;
const NAVE_BACK = 0.9;
const NAVE_FRONT = -0.9;
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

function averageRange(values, start, end) {
    let total = 0;
    for (let i = start; i < end; i++) total += values[i] ?? 0;
    return total / Math.max(1, end - start);
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
        a[3] * (1 - t) + b[3] * t,
    ];
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

    triangle(a, b, c, color) {
        if (this.count + 3 > MAX_VERTICES) return;
        this.vertex(a[0], a[1], color);
        this.vertex(b[0], b[1], color);
        this.vertex(c[0], c[1], color);
    }
}

function createCoronaCathedral() {
    const batch = new MeshBatch();
    const levels = new Float32Array(64);
    const segments = Array.from({ length: 4096 }, () => ({
        ax: 0,
        ay: 0,
        bx: 0,
        by: 0,
        z: 0,
        r: 1,
        g: 1,
        b: 1,
        a: 0,
        width: 0.001,
        overlay: false,
    }));
    const fills = Array.from({ length: 1024 }, () => ({
        ax: 0,
        ay: 0,
        bx: 0,
        by: 0,
        cx: 0,
        cy: 0,
        z: 0,
        r: 1,
        g: 1,
        b: 1,
        a: 0,
    }));
    let segmentCount = 0;
    let fillCount = 0;
    let overlayMode = false;
    let angle = 0;
    let pitch = 0;
    let centerX = 0;
    let centerY = 0;
    let perspective = 0.34;
    let heightScale = 1;

    const project = (x, y, z) => {
        const ca = Math.cos(angle);
        const sa = Math.sin(angle);
        const x1 = x * ca + z * sa;
        const z1 = -x * sa + z * ca;
        const cb = Math.cos(pitch);
        const sb = Math.sin(pitch);
        const y1 = y * cb - z1 * sb;
        const z2 = y * sb + z1 * cb;
        const scale = 1 / (1 + z2 * perspective);
        return [centerX + x1 * scale, centerY + y1 * scale, z2];
    };

    const stretchedY = value => FLOOR + (value - FLOOR) * heightScale;

    const pushSegment = (a, b, zHint, color, width) => {
        if (segmentCount >= segments.length) return;
        const pointA = project(a[0], a[1], a[2]);
        const pointB = project(b[0], b[1], b[2]);
        const dx = pointB[0] - pointA[0];
        const dy = pointB[1] - pointA[1];
        if (dx * dx + dy * dy < 1e-12) return;
        const segment = segments[segmentCount++];
        segment.ax = pointA[0];
        segment.ay = pointA[1];
        segment.bx = pointB[0];
        segment.by = pointB[1];
        segment.z = zHint ?? (pointA[2] + pointB[2]) * 0.5;
        segment.r = color[0];
        segment.g = color[1];
        segment.b = color[2];
        const low = Math.min(a[1], b[1]);
        const fade = 0.22 + 0.78 * smoothstep(FLOOR, FLOOR + 0.24, low);
        segment.a = color[3] * fade;
        segment.width = width;
        segment.overlay = overlayMode;
    };

    const pushFill = (a, b, c, color) => {
        if (fillCount >= fills.length) return;
        const pointA = project(a[0], a[1], a[2]);
        const pointB = project(b[0], b[1], b[2]);
        const pointC = project(c[0], c[1], c[2]);
        const fill = fills[fillCount++];
        fill.ax = pointA[0];
        fill.ay = pointA[1];
        fill.bx = pointB[0];
        fill.by = pointB[1];
        fill.cx = pointC[0];
        fill.cy = pointC[1];
        fill.z = (pointA[2] + pointB[2] + pointC[2]) / 3;
        fill.r = color[0];
        fill.g = color[1];
        fill.b = color[2];
        fill.a = color[3];
    };

    const line = (a, b, width, color) => pushSegment(a, b, undefined, color, width);

    const bezier = (a, b, c, width, color, steps = 12) => {
        let previous = a;
        for (let i = 1; i <= steps; i++) {
            const t = i / steps;
            const u = 1 - t;
            const point = [
                u * u * a[0] + 2 * u * t * b[0] + t * t * c[0],
                u * u * a[1] + 2 * u * t * b[1] + t * t * c[1],
                u * u * a[2] + 2 * u * t * b[2] + t * t * c[2],
            ];
            line(previous, point, width, color);
            previous = point;
        }
    };

    const arc = (cx, cy, cz, radiusX, radiusY, start, sweep, width, color, steps = 48) => {
        let previous = [
            cx + Math.cos(start) * radiusX,
            cy + Math.sin(start) * radiusY,
            cz,
        ];
        for (let i = 1; i <= steps; i++) {
            const a = start + (sweep * i) / steps;
            const point = [cx + Math.cos(a) * radiusX, cy + Math.sin(a) * radiusY, cz];
            line(previous, point, width, color);
            previous = point;
        }
    };

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
            const envelope = rangeEnvelope(frame, 0.1);
            if (envelope <= 0) return { passes: [], state: [peak, 0, 0] };

            const width = Math.max(1, frame.width);
            const height = Math.max(1, frame.height);
            const aspect = width / height;
            const time = frame.time;
            const speed = numberParameter(frame, 'speed', 0.12);
            const x = clamp01(numberParameter(frame, 'x', 0.5));
            const y = clamp01(numberParameter(frame, 'y', 0.54));
            const depth = Math.max(0.05, numberParameter(frame, 'depth', 0.62));
            const radius = Math.max(0.05, numberParameter(frame, 'radius', 0.33));
            const count = Math.max(3, Math.min(9, Math.round(numberParameter(frame, 'count', 6))));
            const fill = clamp01(numberParameter(frame, 'fill', 0.16));
            const twist = numberParameter(frame, 'twist', 0.12);
            const thickness = Math.max(0.05, numberParameter(frame, 'thickness', 1));
            const glow = Math.max(0, numberParameter(frame, 'glow', 1.3));
            const opacity = clamp01(numberParameter(frame, 'opacity', 1));
            const sensitivity = numberParameter(frame, 'sensitivity', 1);
            const gold = rgb(stringParameter(frame, 'color', '#ffd36b'), 1);
            const cyan = rgb(stringParameter(frame, 'accent', '#6fe6ff'), 1);
            const glass = rgb(stringParameter(frame, 'glass', '#ff9a3c'), 1);
            const alphaBase = clamp01(opacity * envelope * (0.4 + 0.85 * peak));
            const baseWidth = Math.max(0.00025, thickness * 0.00115 * (0.85 + peak * 0.4));

            centerX = (x - 0.5) * aspect;
            centerY = 0.5 - y;
            perspective = depth * 0.55;
            heightScale = Math.max(0.2, numberParameter(frame, 'height', 0.82));
            angle = Math.sin(time * speed * 0.9) * 0.35 + twist * 0.2;
            pitch = 0.03 * Math.sin(time * 0.13);

            batch.reset();
            batch.pixelSize = 1 / height;
            segmentCount = 0;
            fillCount = 0;

            const tint = (z, offset = 0) =>
                mixColor(gold, cyan, clamp01(0.1 + 0.42 * (0.5 + 0.5 * Math.sin(z * 5.2 - time * 1.9 + offset))));
            const colored = (base, alpha, z, offset = 0) => {
                const mix = tint(z, offset);
                return [mix[0], mix[1], mix[2], alpha];
            };
            const widthAt = factor => baseWidth * factor;

            const zCount = count;
            const dz = (NAVE_BACK - NAVE_FRONT) / zCount;

            for (let i = 0; i <= zCount; i++) {
                const z = NAVE_FRONT + i * dz;
                const alpha = alphaBase * 0.82;
                const accent = i % 3 === 0 ? cyan : gold;
                for (const side of [-1, 1]) {
                    const xSide = side * HALF_WIDTH;
                    line(
                        [xSide, stretchedY(FLOOR), z],
                        [xSide, stretchedY(COLUMN_TOP), z],
                        widthAt(1.1),
                        colored(accent, alpha, z, side * 0.6),
                    );
                    line(
                        [xSide, stretchedY(FLOOR), z],
                        [xSide * 1.06, stretchedY(FLOOR), z],
                        widthAt(0.7),
                        colored(accent, alpha * 0.65, z, 1.2),
                    );
                    line(
                        [xSide, stretchedY(COLUMN_TOP), z],
                        [xSide * 1.08, stretchedY(COLUMN_TOP), z],
                        widthAt(0.75),
                        colored(accent, alpha * 0.7, z, 2.1),
                    );
                }

                line(
                    [-HALF_WIDTH, stretchedY(COLUMN_TOP), z],
                    [HALF_WIDTH, stretchedY(COLUMN_TOP), z],
                    widthAt(0.8),
                    colored(gold, alpha * 0.7, z, 0.4),
                );
                line(
                    [-HALF_WIDTH, stretchedY(FLOOR), z],
                    [HALF_WIDTH, stretchedY(FLOOR), z],
                    widthAt(0.55),
                    colored(gold, alpha * 0.45, z, 1.4),
                );
                line(
                    [-HALF_WIDTH, stretchedY(0.29), z],
                    [HALF_WIDTH, stretchedY(0.29), z],
                    widthAt(0.4),
                    colored(gold, alpha * 0.28, z, 2.6),
                );

                bezier(
                    [-HALF_WIDTH, stretchedY(COLUMN_TOP), z],
                    [-HALF_WIDTH * 0.92, stretchedY(0.4), z],
                    [0, stretchedY(ARCH_APEX), z],
                    widthAt(1.35),
                    colored(gold, alpha, z, 0.2),
                    14,
                );
                bezier(
                    [0, stretchedY(ARCH_APEX), z],
                    [HALF_WIDTH * 0.92, stretchedY(0.4), z],
                    [HALF_WIDTH, stretchedY(COLUMN_TOP), z],
                    widthAt(1.35),
                    colored(gold, alpha, z, 0.2),
                    14,
                );

                if (i < zCount) {
                    for (const side of [-1, 1]) {
                        bezier(
                            [side * HALF_WIDTH, stretchedY(COLUMN_TOP), z],
                            [side * HALF_WIDTH * 0.55, stretchedY(0.46), z + dz * 0.55],
                            [0, stretchedY(RIDGE), z + dz],
                            widthAt(0.9),
                            colored(cyan, alpha * 0.75, z + dz * 0.5, 1.8),
                            12,
                        );
                    }
                    line(
                        [0, stretchedY(RIDGE), z],
                        [0, stretchedY(RIDGE), z + dz],
                        widthAt(0.65),
                        colored(cyan, alpha * 0.55, z + dz * 0.5, 2.7),
                    );
                }

                for (const side of [-1, 1]) {
                    const pinnacleX = side * HALF_WIDTH;
                    line(
                        [pinnacleX, stretchedY(COLUMN_TOP), z],
                        [pinnacleX, stretchedY(COLUMN_TOP + 0.08), z],
                        widthAt(0.45),
                        colored(cyan, alpha * 0.6, z, side * 1.5),
                    );
                    line(
                        [pinnacleX - 0.032, stretchedY(COLUMN_TOP), z],
                        [pinnacleX, stretchedY(COLUMN_TOP + 0.08), z],
                        widthAt(0.35),
                        colored(gold, alpha * 0.5, z, side * 2.4),
                    );
                    line(
                        [pinnacleX + 0.032, stretchedY(COLUMN_TOP), z],
                        [pinnacleX, stretchedY(COLUMN_TOP + 0.08), z],
                        widthAt(0.35),
                        colored(gold, alpha * 0.5, z, side * 2.4),
                    );
                }

                if (i % 2 === 0) {
                    for (const side of [-1, 1]) {
                        bezier(
                            [side * HALF_WIDTH * 1.42, stretchedY(FLOOR), z],
                            [side * HALF_WIDTH * 1.75, stretchedY(0.3), z],
                            [side * HALF_WIDTH, stretchedY(COLUMN_TOP), z],
                            widthAt(0.75),
                            colored(gold, alpha * 0.52, z, side * 2.2),
                            10,
                        );
                    }
                }
            }

            for (const side of [-1, 1]) {
                line(
                    [side * HALF_WIDTH, stretchedY(COLUMN_TOP), NAVE_FRONT],
                    [side * HALF_WIDTH, stretchedY(COLUMN_TOP), NAVE_BACK],
                    widthAt(0.75),
                    colored(gold, alphaBase * 0.65, 0, 0.8),
                );
                line(
                    [side * HALF_WIDTH, stretchedY(FLOOR), NAVE_FRONT],
                    [side * HALF_WIDTH, stretchedY(FLOOR), NAVE_BACK],
                    widthAt(0.55),
                    colored(gold, alphaBase * 0.45, 0, 1.7),
                );
            }
            line(
                [0, stretchedY(RIDGE), NAVE_FRONT],
                [0, stretchedY(RIDGE), NAVE_BACK],
                widthAt(0.9),
                colored(cyan, alphaBase * 0.7, 0, 2.3),
            );
            line(
                [0, stretchedY(FLOOR), NAVE_FRONT],
                [0, stretchedY(FLOOR), NAVE_BACK],
                widthAt(0.45),
                colored(gold, alphaBase * 0.32, 0, 3.1),
            );

            overlayMode = true;
            const roseZ = NAVE_BACK - 0.03;
            const roseX = 0;
            const roseY = stretchedY(ROSE_Y);
            arc(
                roseX,
                roseY,
                roseZ,
                radius * 1.16,
                radius * 1.16 * Math.max(0.55, heightScale),
                0,
                TAU,
                widthAt(0.55),
                colored(gold, alphaBase * 0.35, roseZ, 0.7),
                64,
            );
            for (const ring of [0.28, 0.52, 0.76, 1]) {
                arc(
                    roseX,
                    roseY,
                    roseZ,
                    radius * ring,
                    radius * ring * Math.max(0.55, heightScale),
                    0,
                    TAU,
                    widthAt(ring === 1 ? 1.25 : 0.8),
                    colored(ring === 1 ? gold : cyan, alphaBase * (ring === 1 ? 0.9 : 0.55), roseZ, ring),
                    64,
                );
            }
            for (let i = 0; i < 16; i++) {
                const a = (i / 16) * TAU;
                line(
                    [roseX + Math.cos(a) * radius * 0.18, roseY + Math.sin(a) * radius * 0.18 * Math.max(0.55, heightScale), roseZ],
                    [roseX + Math.cos(a) * radius, roseY + Math.sin(a) * radius * Math.max(0.55, heightScale), roseZ],
                    widthAt(0.55),
                    colored(i % 4 === 0 ? cyan : gold, alphaBase * 0.62, roseZ, i * 0.4),
                );
            }
            for (let i = 0; i < 12; i++) {
                const a = (i / 12) * TAU;
                arc(
                    roseX,
                    roseY,
                    roseZ,
                    radius * 0.66,
                    radius * 0.66 * Math.max(0.55, heightScale),
                    a,
                    0.55,
                    widthAt(0.7),
                    colored(i % 3 === 0 ? cyan : gold, alphaBase * 0.75, roseZ, i),
                    10,
                );
            }
            for (let i = 0; i < 4; i++) {
                const a = (i / 4) * TAU;
                arc(
                    roseX,
                    roseY,
                    roseZ,
                    radius * 0.34,
                    radius * 0.34 * Math.max(0.55, heightScale),
                    a,
                    Math.PI * 0.5,
                    widthAt(0.55),
                    colored(cyan, alphaBase * 0.55, roseZ, i * 1.3),
                    10,
                );
            }
            if (fill > 0) {
                for (let i = 0; i < 16; i++) {
                    const a0 = (i / 16) * TAU;
                    const a1 = ((i + 1) / 16) * TAU;
                    pushFill(
                        [roseX, roseY, roseZ],
                        [roseX + Math.cos(a0) * radius, roseY + Math.sin(a0) * radius * Math.max(0.55, heightScale), roseZ],
                        [roseX + Math.cos(a1) * radius, roseY + Math.sin(a1) * radius * Math.max(0.55, heightScale), roseZ],
                        [glass[0], glass[1], glass[2], alphaBase * fill * (i % 2 === 0 ? 0.09 : 0.05)],
                    );
                }
            }

            overlayMode = false;
            const altarZ = 0.45;
            line(
                [-0.12, stretchedY(FLOOR), altarZ],
                [-0.12, stretchedY(0.32), altarZ],
                widthAt(0.8),
                colored(gold, alphaBase * 0.8, altarZ, 0.2),
            );
            line(
                [0.12, stretchedY(FLOOR), altarZ],
                [0.12, stretchedY(0.32), altarZ],
                widthAt(0.8),
                colored(gold, alphaBase * 0.8, altarZ, 0.2),
            );
            line(
                [-0.12, stretchedY(0.32), altarZ],
                [0, stretchedY(0.42), altarZ],
                widthAt(0.8),
                colored(cyan, alphaBase * 0.85, altarZ, 1.1),
            );
            line(
                [0, stretchedY(0.42), altarZ],
                [0.12, stretchedY(0.32), altarZ],
                widthAt(0.8),
                colored(cyan, alphaBase * 0.85, altarZ, 1.1),
            );

            const order = new Int32Array(segmentCount);
            for (let i = 0; i < segmentCount; i++) order[i] = i;
            order.subarray(0, segmentCount).sort((a, b) => {
                const overlayA = segments[a].overlay ? 1 : 0;
                const overlayB = segments[b].overlay ? 1 : 0;
                if (overlayA !== overlayB) return overlayA - overlayB;
                return segments[b].z - segments[a].z;
            });

            for (let i = 0; i < fillCount; i++) {
                const fill = fills[i];
                batch.triangle(
                    [fill.ax, fill.ay],
                    [fill.bx, fill.by],
                    [fill.cx, fill.cy],
                    [fill.r, fill.g, fill.b, fill.a],
                );
            }
            for (let i = 0; i < segmentCount; i++) {
                const segment = segments[order[i]];
                const coreWidth = Math.max(0.00022, segment.width * (0.8 + peak * 0.35));
                if (glow > 0.01) {
                    batch.line(
                        [segment.ax, segment.ay],
                        [segment.bx, segment.by],
                        coreWidth * (4.8 + glow * 2.2),
                        [segment.r, segment.g, segment.b, segment.a * 0.04 * glow],
                    );
                    batch.line(
                        [segment.ax, segment.ay],
                        [segment.bx, segment.by],
                        coreWidth * 2.35,
                        [segment.r, segment.g, segment.b, segment.a * 0.16 * glow],
                    );
                }
                batch.line(
                    [segment.ax, segment.ay],
                    [segment.bx, segment.by],
                    coreWidth,
                    [segment.r, segment.g, segment.b, segment.a],
                );
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
                state: [peak, averageRange(levels, 0, 8), segmentCount, batch.count],
            };
        },
        reset() {},
        dispose() {},
    };
}
