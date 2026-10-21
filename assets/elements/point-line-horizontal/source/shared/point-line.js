const MIN_POSITION = 0.01;
const MAX_POSITION = 0.99;
const MIN_GAP = 0.05;
// Reserve six vertices to copy the preceding batch before drawing this batch.
const LINES_PER_BATCH = Math.floor((65536 - 6) / 6);
function randomPosition(seed, id, vertical) {
    let hash = (2166136261 ^ (seed >>> 0)) >>> 0;
    const key = (vertical ? 'vertical:' : 'horizontal:') + id;
    for (let i = 0; i < key.length; i++) hash = Math.imul(hash ^ key.charCodeAt(i), 16777619);
    hash ^= hash >>> 16;
    hash = Math.imul(hash, 0x7feb352d);
    hash ^= hash >>> 15;
    hash = Math.imul(hash, 0x846ca68b);
    return ((hash ^ (hash >>> 16)) >>> 0) / 4294967296;
}
function spacedPosition(random, previous) {
    if (previous === undefined) return MIN_POSITION + random * (MAX_POSITION - MIN_POSITION);
    const left = Math.max(MIN_POSITION, previous - MIN_GAP);
    const right = Math.min(MAX_POSITION, previous + MIN_GAP);
    const leftLength = left - MIN_POSITION;
    const available = leftLength + MAX_POSITION - right;
    const offset = random * available;
    return offset < leftLength ? MIN_POSITION + offset : right + offset - leftLength;
}
function lowerBound(events, time, inclusiveEnd = false) {
    let low = 0,
        high = events.length;
    while (low < high) {
        const middle = Math.floor((low + high) / 2);
        if (inclusiveEnd ? events[middle].atSeconds <= time : events[middle].atSeconds < time) low = middle + 1;
        else high = middle;
    }
    return low;
}
function smooth(value) {
    const t = Math.max(0, Math.min(1, value));
    return t * t * (3 - 2 * t);
}
function createPointLine(vertical) {
    let cacheKey = '',
        events = [];
    return {
        async prepareFrame(frame, input) {
            if (!frame.range) throw Error('点标记直线缺少元素时段。');
            const key = JSON.stringify([frame.revision, frame.seed, frame.range.endSeconds]);
            if (key !== cacheKey) {
                const collected = [];
                let cursor;
                do {
                    const page = await input.markers({
                        inputId: 'points',
                        startSeconds: 0,
                        endSeconds: frame.range.endSeconds,
                        includeEnd: true,
                        ...(cursor ? { cursor } : {}),
                    });
                    if (page.eventKind !== 'point') throw Error('点标记直线需要点事件。');
                    for (const event of page.events) collected.push(event);
                    cursor = page.nextCursor;
                } while (cursor);
                collected.sort((a, b) => a.atSeconds - b.atSeconds || a.id.localeCompare(b.id));
                let previous;
                events = collected.map((event) => {
                    const position = spacedPosition(randomPosition(frame.seed, event.id, vertical), previous);
                    previous = position;
                    return { atSeconds: event.atSeconds, position };
                });
                cacheKey = key;
            }
            const p = frame.parameters;
            const fadeIn = p.fadeInSeconds.value,
                hold = p.holdSeconds.value,
                fadeOut = p.fadeOutSeconds.value;
            const first = lowerBound(events, Math.max(frame.range.startSeconds, frame.time - hold - fadeOut));
            const last = lowerBound(events, Math.min(frame.range.endSeconds, frame.time + fadeIn), true);
            const active = [];
            for (let i = first; i < last; i++) {
                const event = events[i],
                    delta = frame.time - event.atSeconds;
                const alpha =
                    delta < 0
                        ? smooth((delta + fadeIn) / fadeIn)
                        : delta <= hold
                          ? 1
                          : 1 - smooth((delta - hold) / fadeOut);
                if (alpha > 1e-12) active.push({ position: event.position, alpha });
            }
            const aspect = frame.width / frame.height,
                thickness = (p.lineWidth.value * Math.min(frame.width, frame.height)) / frame.height;
            const passes = [];
            let signature = 2166136261;
            for (const line of active) {
                signature = Math.imul(signature ^ Math.round(line.position * 1e9), 16777619);
                signature = Math.imul(signature ^ Math.round(line.alpha * 1e9), 16777619);
            }
            for (let offset = 0; offset < active.length; offset += LINES_PER_BATCH) {
                const lines = active.slice(offset, offset + LINES_PER_BATCH),
                    count = (lines.length + 1) * 6;
                const positions = new Float32Array(count * 3),
                    colors = new Float32Array(count * 4),
                    edges = new Float32Array(count * 2);
                let vertex = 0;
                const quad = (x0, y0, x1, y1, alpha, isLine) => {
                    for (const [x, y] of [
                        [x0, y0],
                        [x1, y0],
                        [x1, y1],
                        [x0, y0],
                        [x1, y1],
                        [x0, y1],
                    ]) {
                        positions.set([x, y, 0], vertex * 3);
                        colors.set([1, 1, 1, alpha], vertex * 4);
                        edges[vertex * 2] = isLine;
                        vertex++;
                    }
                };
                quad(-aspect / 2, -0.5, aspect / 2, 0.5, 0, 0);
                for (const line of lines) {
                    if (vertical) {
                        const x = (line.position - 0.5) * aspect;
                        quad(x - thickness / 2, -0.5, x + thickness / 2, 0.5, line.alpha, 1);
                    } else {
                        const y = 0.5 - line.position;
                        quad(-aspect / 2, y - thickness / 2, aspect / 2, y + thickness / 2, line.alpha, 1);
                    }
                }
                passes.push({
                    program: 'draw',
                    uniforms: { uColor: p.color.value, uImage: 'source', uHasImage: offset > 0, uAspect: aspect },
                    mesh: { positions, colors, edges },
                });
            }
            return { passes, state: [active.length, signature >>> 0] };
        },
        reset() {
            cacheKey = '';
            events = [];
        },
        dispose() {
            cacheKey = '';
            events = [];
        },
    };
}
