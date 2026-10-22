/*
MIT License

Copyright (c) [2017] [Karteek Suryadevara||V3ng3nc3]

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/
const PINK = [
    1.0548608488838, 0.76054078751554, 0.61124787706261, 0.52188737442096, 0.47582581340335, 0.442985940855,
    0.39506604448116, 0.38179901474466, 0.3791498265819, 0.35862620105656, 0.34117808276167, 0.31407858754586,
    0.32956896818321, 0.32649587026332, 0.32553041354753, 0.33023063745582, 0.33723850113961, 0.32845876137105,
    0.32345077632073, 0.33371703524763, 0.33559351013352, 0.32755038614695, 0.33723270172874, 0.33152196761531,
    0.34253960054833, 0.33996676648346, 0.35007384375669, 0.34140414964718, 0.35276302794926, 0.45428847576802,
    0.57092841582994, 0.56249676873287, 0.64297260455787, 0.64261475342015, 0.72339198663831, 0.73733259583513,
    0.83130048006773, 0.86110594108701, 0.93924222866694, 0.97183918188016, 1.0510377466679, 1.1248085597157,
    1.1805661781629, 1.2060520313183, 1.2870901748538, 1.3467060487469, 1.419748566548, 1.4930113442739,
    1.5233661865195, 1.6291546697418, 1.6687760437528, 1.7517802578211, 1.7828743148843, 1.8640559593836,
    1.9024009352922, 1.9445452898741, 2.0042892436186, 2.0429756359259, 2.0702872782946, 2.0901099761327,
    2.0997672257821, 2.1029779444138, 2.0654643664757, 2.0357843961318,
];
const number = (p, id, fallback = 0) => (typeof p[id]?.value === 'number' ? p[id].value : fallback);
const random = (seed, tick, index) => {
    let x = (seed ^ Math.imul(tick + 1, 374761393) ^ Math.imul(index + 1, 668265263)) >>> 0;
    x = Math.imul(x ^ (x >>> 13), 1274126177);
    return ((x ^ (x >>> 16)) >>> 0) / 4294967296;
};
function fresh(tick) {
    return { tick, levels: Array(64).fill(0), particles: [], emission: 0, serial: 0, speed: 2 };
}
function cloneState(s) {
    return { ...s, levels: [...s.levels], particles: s.particles.map(p => ({ ...p })) };
}
function prepareSpectrum(source, p) {
    if (!Array.isArray(source) || source.length === 0) return Array(64).fill(0);
    if (source.length !== 128 || source.some(v => !Number.isFinite(v) || v < 0))
        throw Error('Circular Visualizer requires 128 nonnegative WE strengths.');
    const raw = source.slice(0, 64).map((v, i) => (p.noise?.value === false ? v : v / PINK[i]));
    return p.normalize?.value === false
        ? raw
        : raw.map((v, i) =>
              i === 0 ? (v + raw[1]) / 2 : i === 63 ? (raw[62] + v) / 2 : (raw[i - 1] + 2 * v + raw[i + 1]) / 4,
          );
}
function updateState(s, tick, source, frame, kind) {
    const p = frame.parameters;
    if (tick % 2 === 0) {
        const raw = prepareSpectrum(source, p),
            alpha = number(p, 'responsiveness', 50) / 100;
        for (let i = 0; i < 64; i++) s.levels[i] = raw[i] * alpha + s.levels[i] * (1 - alpha);
    }
    const bass = s.levels.slice(0, 5).reduce((a, b) => a + b, 0),
        mid = s.levels.slice(29, 34).reduce((a, b) => a + b, 0);
    if (kind === 'particles') {
        const silent = source.length === 0 || source.slice(0, 64).every(v => v === 0),
            target = number(p, silent ? 'silenceCount' : 'count', silent ? 0 : 2);
        if (silent) s.emission = Math.max(target, s.emission - 0.03);
        else
            s.emission =
                s.emission < target ? Math.min(target, s.emission + 0.01) : target * random(frame.seed, tick, 0);
        for (let i = 0; i < Math.ceil(s.emission) && s.particles.length < 5000; i++) {
            const id = s.serial++,
                x = random(frame.seed, id, 1) - 0.5,
                y = random(frame.seed, id, 2) - 0.5,
                a = Math.atan2(y, (x * 16) / 9);
            s.particles.push({
                x,
                y,
                vx: (1.5 * Math.cos(a)) / 1920,
                vy: (1.5 * Math.sin(a)) / 1080,
                r: random(frame.seed, id, 3) * 2 + number(p, 'size') / 20,
                born: tick,
                id,
            });
        }
        const acceleration = bass > 0.6 ? 1.111 : mid > 0.5 ? 1.0177 : 1.0059;
        for (const particle of s.particles) {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.vx *= acceleration;
            particle.vy *= acceleration;
            particle.r *= 1.0019;
        }
        s.particles = s.particles.filter(v => Math.abs(v.x) <= 0.51 && Math.abs(v.y) <= 0.51 && tick - v.born <= 480);
    } else if (kind === 'depth') {
        const count = number(p, 'count', 100);
        while (s.particles.length < count) {
            const id = s.serial++;
            s.particles.push({
                x: random(frame.seed, id, 1) - 0.5,
                y: random(frame.seed, id, 2) - 0.5,
                z: 0.05 + random(frame.seed, id, 3) * 0.95,
                r: 1,
                id,
                born: 0,
            });
        }
        s.particles.length = count;
        s.speed =
            bass > 2
                ? Math.min(20, s.speed + 1)
                : bass > 0.5
                  ? s.speed > 8
                      ? s.speed - 2
                      : Math.min(8, s.speed + 1)
                  : 2;
        const active = source.some(v => v > 0);
        if (active)
            for (const particle of s.particles) {
                particle.z -= s.speed / 1920;
                if (particle.z <= 0.01) {
                    particle.z = 1;
                    particle.born++;
                    particle.x = random(frame.seed, particle.id, particle.born * 2 + 1) - 0.5;
                    particle.y = random(frame.seed, particle.id, particle.born * 2 + 2) - 0.5;
                }
            }
    }
    s.tick = tick;
}
function createCircularState(kind) {
    let key = '',
        latest = fresh(-1);
    const checkpoints = new Map();
    return {
        async resolve(frame, input) {
            const p = frame.parameters,
                signature =
                    frame.revision +
                    ':' +
                    frame.seed +
                    ':' +
                    JSON.stringify(Object.entries(p).filter(([id]) => id !== 'spectrum'));
            const target = Math.max(0, Math.floor(frame.time * 60 + 1e-8)),
                start = Math.max(0, Math.ceil((frame.range?.startSeconds ?? 0) * 60 - 1e-8));
            if (key !== signature) {
                key = signature;
                latest = fresh(frame.mode === 'realtime' ? target - 1 : start - 1);
                checkpoints.clear();
            }
            if (latest.tick > target) {
                const point = [...checkpoints.keys()].filter(t => t <= target).sort((a, b) => b - a)[0];
                latest = point === undefined ? fresh(start - 1) : cloneState(checkpoints.get(point));
            }
            const current = p.spectrum?.value ?? [];
            if (frame.mode === 'realtime') {
                for (let tick = latest.tick + 1; tick <= target; tick++)
                    updateState(latest, tick, current, frame, kind);
            } else {
                for (let tick = latest.tick + 1; tick < target;) {
                    const end = Math.min(target, tick + 60),
                        samples = await input.history({ parameterId: 'spectrum', startTick: tick, endTick: end });
                    const values = new Map(samples.map(s => [Math.round(s.time * 60), s.value]));
                    for (; tick < end; tick++) {
                        const value = values.get(tick);
                        if (!Array.isArray(value)) throw Error('Circular history sample unavailable.');
                        updateState(latest, tick, value, frame, kind);
                        if (tick % 60 === 0) {
                            checkpoints.set(tick, cloneState(latest));
                            if (checkpoints.size > 8) checkpoints.delete(checkpoints.keys().next().value);
                        }
                    }
                }
                if (latest.tick < target) updateState(latest, target, current, frame, kind);
                if (target % 60 === 0) {
                    checkpoints.set(target, cloneState(latest));
                    if (checkpoints.size > 8) checkpoints.delete(checkpoints.keys().next().value);
                }
            }
            return latest;
        },
        reset() {
            key = '';
            latest = fresh(-1);
            checkpoints.clear();
        },
    };
}
function hsv(h) {
    h = ((h % 1) + 1) % 1;
    const f = n => {
        const k = (n + h * 6) % 6;
        return 1 - Math.max(0, Math.min(k, 4 - k, 1));
    };
    return [f(5), f(3), f(1)];
}
function rgb(color) {
    return [1, 3, 5].map(i => parseInt(color.slice(i, i + 2), 16) / 255);
}
function geometry() {
    const positions = [],
        colors = [],
        edges = [];
    return {
        positions,
        colors,
        edges,
        quad(x1, y1, x2, y2, width, color, opacity, lineAA = false) {
            const extent = width / 2 + (lineAA ? 1 / 1080 : 0),
                dx = x2 - x1,
                dy = y2 - y1,
                len = Math.hypot(dx, dy) || 1,
                nx = (-dy / len) * extent,
                ny = (dx / len) * extent;
            const points = [
                    [x1 + nx, y1 + ny],
                    [x1 - nx, y1 - ny],
                    [x2 - nx, y2 - ny],
                    [x2 + nx, y2 + ny],
                ],
                uv = lineAA
                    ? [
                          [-extent, width / 2],
                          [extent, width / 2],
                          [extent, width / 2],
                          [-extent, width / 2],
                      ]
                    : [
                          [-1, -1],
                          [1, -1],
                          [1, 1],
                          [-1, 1],
                      ];
            for (const i of [0, 1, 2, 0, 2, 3]) {
                positions.push(...points[i], 0);
                colors.push(...color, opacity);
                edges.push(...uv[i]);
            }
        },
        point(x, y, r, color, opacity) {
            this.quad(x - r, y, x + r, y, 2 * r, color, opacity);
        },
        mesh() {
            return {
                positions: new Float32Array(positions),
                colors: new Float32Array(colors),
                edges: new Float32Array(edges),
            };
        },
    };
}
function renderCircular(frame, state, kind) {
    const p = frame.parameters,
        g = geometry(),
        aspect = frame.width / frame.height,
        opacity = number(p, 'opacity', 1),
        color = rgb(p.color?.value ?? '#ffffff');
    const bass = state.levels.slice(0, 5).reduce((a, b) => a + b, 0),
        three = state.levels.slice(0, 3).reduce((a, b) => a + b, 0);
    const threshold = 1.15 + number(p, 'shakeTolerance'),
        shake = three > threshold ? number(p, 'shake', 12) / 1080 : 0;
    const tick = Math.floor(frame.time * 60),
        jitterX = (random(0, tick, 74) - 0.5) * shake,
        jitterY = (random(0, tick, 75) - 0.5) * shake;
    const cx = (number(p, 'x', 0.5) - 0.5) * aspect + jitterX,
        cy = 0.5 - number(p, 'y', 0.5) + jitterY;
    const radius = (number(p, 'radius', 64) + bass * number(p, 'bassMultiplier', 10)) / 1080;
    if (kind === 'bars') {
        const count = number(p, 'count', 128),
            arc = number(p, 'arc', 360),
            rotation = number(p, 'rotation', 270) + frame.time * number(p, 'rotationSpeed'),
            shift = number(p, 'spectrumRotation');
        for (let i = 0; i < count && (i * 360) / count < arc; i++) {
            const j = (i + shift) % 128,
                index = j < 64 ? j : p.reverse?.value ? j - 64 : 127 - j;
            const angle = ((rotation + (i * 360) / count) * Math.PI) / 180,
                length = (state.levels[index] * number(p, 'height', 100)) / 1080,
                base = radius + number(p, 'gap', 16) / 1080;
            const c = p.rainbow?.value
                ? hsv(i / 128 + number(p, 'rainbowRotation') / 128 + (frame.time * number(p, 'rainbowSpeed')) / 360)
                : color;
            g.quad(
                cx + Math.cos(angle) * base,
                cy - Math.sin(angle) * base,
                cx + Math.cos(angle) * (base + length),
                cy - Math.sin(angle) * (base + length),
                number(p, 'width', 1) / 1080,
                c,
                opacity,
                true,
            );
        }
    } else {
        const active = (p.spectrum?.value ?? []).some(v => v > 0);
        for (const particle of state.particles) {
            if (kind === 'depth' && !active) continue;
            const scale = kind === 'depth' ? 1 / particle.z : 1,
                x = particle.x * aspect * scale,
                y = particle.y * scale;
            const r = kind === 'depth' ? (0.6 + number(p, 'size') / 20) * scale : particle.r;
            const c = p.rainbow?.value ? hsv(random(frame.seed, particle.id, p.twinkle?.value ? tick : 0)) : color;
            g.point(x, y, r / 1080, c, opacity * (kind === 'depth' ? Math.min(1, particle.z * 8) : 1));
        }
    }
    return { mesh: g.mesh(), center: [cx, cy], radius, bass, opacity };
}
