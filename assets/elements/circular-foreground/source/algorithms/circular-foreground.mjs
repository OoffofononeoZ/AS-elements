export function create() {
    const state = null;
    return {
        async prepareFrame(frame, input) {
            const p = frame.parameters;
            const visual = {
                center: [((number(p, 'x', 0.5) - 0.5) * frame.width) / frame.height, 0.5 - number(p, 'y', 0.5)],
                radius: 0,
                opacity: number(p, 'opacity', 1),
            };
            const inputId = 'foreground';
            const info = frame.media?.[inputId];
            const fit = info?.fit === 'contain' ? 1 : info?.fit === 'initial' ? 2 : 0;
            return {
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
                            uImage: inputId,
                            uNext: inputId,
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
