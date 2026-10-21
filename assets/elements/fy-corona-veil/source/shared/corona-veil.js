const REFERENCE = 128;
const TAU = Math.PI * 2;

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

function colorParameter(frame, id, fallback) {
    const value = frame.parameters?.[id]?.value;
    return typeof value === 'string' && value ? value : fallback;
}

function createCoronaVeil() {
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
            const bass = averageRange(levels, 0, 8);
            const mid = averageRange(levels, 8, 32);
            const treble = averageRange(levels, 32, 64);
            const envelope = rangeEnvelope(frame, 0.08);
            const width = Math.max(1, frame.width);
            const height = Math.max(1, frame.height);
            const speed = numberParameter(frame, 'speed', 0.16);
            const x = clamp01(numberParameter(frame, 'x', 0.5));
            const y = clamp01(numberParameter(frame, 'y', 0.46));
            const opacity = clamp01(numberParameter(frame, 'opacity', 1));

            return {
                passes: [
                    {
                        program: 'draw',
                        uniforms: {
                            uTime: frame.time * speed,
                            uAspect: width / height,
                            uHot: colorParameter(frame, 'colorHot', '#ff5a1f'),
                            uCool: colorParameter(frame, 'colorCool', '#6fe6ff'),
                            uVoid: colorParameter(frame, 'colorVoid', '#03040a'),
                            uOpacity: opacity,
                            uGlow: Math.max(0, numberParameter(frame, 'glow', 1.2)),
                            uDensity: Math.max(0.05, numberParameter(frame, 'density', 1.1)),
                            uRays: Math.max(4, Math.min(24, Math.round(numberParameter(frame, 'rays', 14)))),
                            uCenter: [x, y],
                            uBass: bass,
                            uMid: mid,
                            uTreble: treble,
                            uPeak: peak,
                            uIdle: clamp01(numberParameter(frame, 'idle', 0.22)),
                            uExposure: Math.max(0.01, numberParameter(frame, 'exposure', 1.05)),
                            uEnvelope: envelope,
                        },
                    },
                ],
                state: [peak, envelope],
            };
        },
        reset() {},
        dispose() {},
    };
}
