export function create() {
    return {
        prepareFrame(frame) {
            const number = (id, fallback) => {
                const value = frame.parameters?.[id]?.value;
                return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
            };
            const width = Math.max(1, frame.width);
            const height = Math.max(1, frame.height);
            const pulse = Math.max(0, Math.min(1, number('pulse', 0)));
            return {
                passes: [
                    {
                        program: 'draw',
                        uniforms: {
                            uImage: 'source',
                            uAmount: Math.max(0, Math.min(1, number('amount', 0.65))),
                            uBloom: Math.max(0, number('bloom', 0.72)),
                            uAberration: Math.max(0, number('aberration', 2.2)),
                            uVignette: Math.max(0, number('vignette', 0.6)),
                            uGrain: Math.max(0, Math.min(1, number('grain', 0.05))),
                            uTemperature: Math.max(-1, Math.min(1, number('temperature', 0.22))),
                            uWarp: Math.max(0, Math.min(1, number('warp', 0.1))),
                            uExposure: Math.max(0.01, number('exposure', 1.04)),
                            uPulse: pulse,
                            uTime: frame.time,
                            uViewport: [width, height],
                        },
                    },
                ],
                state: [pulse],
            };
        },
        reset() {},
        dispose() {},
    };
}
