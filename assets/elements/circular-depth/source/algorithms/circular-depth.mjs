export function create() {
    const state = createCircularState('depth');
    return {
        async prepareFrame(frame, input) {
            const p = frame.parameters;
            const resolved = await state.resolve(frame, input);
            const visual = renderCircular(frame, resolved, 'depth');
            return {
                state: [...resolved.levels, ...resolved.particles.flatMap(p => [p.x, p.y, p.z ?? 0, p.r, p.born])],
                passes: [{ program: 'draw', uniforms: { uRound: 1 }, mesh: visual.mesh }],
            };
        },
        reset() {
            state?.reset();
        },
        dispose() {
            state?.reset();
        },
    };
}
