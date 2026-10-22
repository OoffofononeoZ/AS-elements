import { expect, test } from 'vitest';
import { validateContentBrief } from '../scripts/validate-content-brief.mjs';

const brief = () => ({
    schemaVersion: 2,
    kind: 'element',
    intent: '生成可更换媒体的背景',
    elements: [
        {
            key: 'background',
            origin: 'new',
            type: 'media-background',
            kind: 'visual',
            appearance: '全屏背景',
            spatialStructure: '覆盖输出',
            motion: '静态图片或按宿主时间播放视频',
            executionModes: ['timeline', 'realtime'],
            mediaInputs: [
                {
                    id: 'background',
                    kinds: ['image', 'video'],
                    multiple: true,
                    purpose: '由宿主提供图片或视频纹理',
                    emptyBehavior: '纯黑背景',
                },
            ],
        },
    ],
});

test('media intake declares capabilities without embedding user media', () => {
    expect(validateContentBrief(brief()).status).toBe('READY_FOR_CONTRACT');
    for (const patch of [
        { executionModes: [] },
        { executionModes: ['browser'] },
        { mediaInputs: [] },
        { mediaInputs: [{ id: 'background', kinds: ['image'], multiple: true, purpose: '图片', emptyBehavior: '' }] },
        {
            mediaInputs: [
                {
                    id: 'background',
                    kinds: ['image'],
                    multiple: true,
                    purpose: '图片',
                    emptyBehavior: '黑色',
                    path: 'D:/private.png',
                },
            ],
        },
    ]) {
        const input = brief();
        Object.assign(input.elements[0]!, patch);
        expect(validateContentBrief(input).status).toBe('INPUT_INCOMPLETE');
    }
});
