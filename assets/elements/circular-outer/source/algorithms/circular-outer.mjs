export function create() {
    const state = createCircularState('outer');
    return {
        async prepareFrame(frame, input) {
            const p = frame.parameters;
            const resolved = await state.resolve(frame, input);
            const visual = renderCircular(frame, resolved, 'outer');
            const inputId = '';
            const info = frame.media?.[inputId];
            const fit = info?.fit === 'contain' ? 1 : info?.fit === 'initial' ? 2 : 0;
            return {
                state: [...resolved.levels],
                passes: [
                    {
                        program: 'draw',
                        uniforms: {
                            uViewport: [frame.width, frame.height],
                            uColor: p.color?.value ?? '#ffffff',
                            uOpacity: visual.opacity,
                            uPosition: visual.center,
                            uRadius: visual.radius,
                            uArc: number(p, 'arc', 360),
                            uRotation: number(p, 'rotation'),
                            uLogoAngle: (frame.time * number(p, 'logoSpeed') * Math.PI) / 180,
                            uExtent: [number(p, 'width', 1920) / 1080, number(p, 'height', 1080) / 1080],
                            uHasMedia: !!info?.available,
                            uMediaSize: [info?.width ?? 1, info?.height ?? 1],
                            uNextSize: [info?.nextWidth ?? 1, info?.nextHeight ?? 1],
                            uMix: info?.mix ?? 0,
                            uFit: fit,
                        },
                    },
                ],
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
