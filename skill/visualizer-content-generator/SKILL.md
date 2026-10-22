---
name: visualizer-content-generator
description: 自主设计、生成带展示图的外部 V2 算法元素包与预设；预设仅组合已有元素，明确需求缺少关键条件时再询问。
version: 2.4.0
---

# Visualizer 内容生成

本 skill 独立运行，不依赖应用仓库。资源位于用户指定的 assets 文件夹：elements/<id>/、presets/<id>/。输出 V2 运行包，工程和草稿仍为 V5 自包含快照。已有算法使用 ABI 1；声明标记输入的算法使用 ABI 2。不生成 ZIP。允许按所在仓库的规则使用 Git，不默认创建历史副本或版本目录，不自动推送、发布或重写历史。

## 工作流

1. 将请求规范化为 [VisualizerContentBriefV2](references/input-contract.md)。开放创意（例如“创建一个惊艳四座的预设”）由 agent 自主确定风格、结构、参数、响应和时段，并区分用户要求与自主设计。对明确需求，只有关键条件缺失、冲突或无法据此实现时才进一步询问；不要为可自主确定的配色、密度等细节反复提问。临时 brief 放系统临时目录。
2. 运行 `node <skill>/scripts/validate-content-brief.mjs <brief.json>`。INPUT_INCOMPLETE 时先补齐可自主决定的字段并重试，真正缺少必要用户信息时只询问阻塞项。READY_FOR_CONTRACT 表示结构完整，可继续生成，不是等待批准的关卡。不兼容 V1 输入。
3. 阅读 [内容规则](references/content-rules.md)、[资源格式与 ABI](references/resource-format.md)，核对指定资源库。预设只能精确引用已有元素；缺少元素时先生成、封装并验证独立元素，再创建预设，不另设内容审批。禁止预设包夹带新增元素或算法。
4. 简要说明选定的生成方案并继续执行，不输出 AWAITING_APPROVAL，不等待用户逐项批准。将 ID/版本、视觉及拆分、算法 ABI、参数/default bindings、静态/静音/低/高状态、数据映射/单位、时间/目标、seed/确定性、资源预算和验证方案记为设计记录；预设另记录清单、顺序、时段、内部引用及共同控件。用户请求范围内的内容调整继续推进，不要求重新批准。
5. 在资源 source/ 按需保存设计记录、用户原始要求与自主设计选择，不伪造批准来源。每个资源包含 resource-info.json、source/ 和 resource-package.json。创建者默认 default；创建时间用实际 ISO 8601 时间，重新封装不重置。
6. **正常生成交付必须至少附带一张可打开、能表达该资源效果的展示图**，并填写 previewPath 指向自身资源文件夹内的实际文件。支持 PNG/JPEG/WebP 或独立 SVG，可用准确示意图或截图，不强制截图。交付前打开核对图片和路径；共享默认封面不能代替应生成的展示图。既有资源缺图或坏图时的查找、默认封面容错见资源格式，不据此省略正常交付图片。
7. 在 skill 目录按 lockfile 运行 `npm ci`，再执行 `node <skill>/scripts/resource-library.mjs --build <assets>` 和 `--check <assets>`。源码与 Shader 必须位于自身文件夹内，不依赖其他元素的辅助代码。工具接受合法缺图资源不等于新生成内容已满足展示图交付要求。
8. 按 [验证矩阵](references/test-matrix.md) 检查实际内容。封装不证明算法初始化、GPU、视觉或导出通过。如实报告通过/失败/未运行与必要人工输入，不自动发布或生成 readiness 结论。

## 边界

- 全工程最多四种不同 Analyzer 特征，包含禁用元素；native 和 Editor 标记不计额度。参数来源为 constant/analysis/native 或明确 unbound；Editor 点/范围通过独立的 [标记输入](references/editor-marker-inputs.md) 提供，不恢复旧 editor-event 参数来源。
- 外部包只声明标记类型和选择范围，不保存真实轨道、分类或事件引用。加入工程并由用户绑定后，实例才能查询该工程快照中的获准数据；目录校验和初始化阶段不能读取标记。只使用已应用的点/范围，不接 BPM、识别候选或推测的音色字段。
- 算法只在宿主隔离 Worker 运行并返回受控 DrawPacket，不在主页面求值，不创建 Canvas/Renderer/RAF/AudioContext/Worker、网络或存储旁路。宿主统一输入、合成和离线逐帧导出。
- 扩展 ABI、输入能力、工程格式、拓扑、支持矩阵、性能预算/阈值或不明许可资产，先请求独立决定；取消内容审批不扩大这些边界，不得以 fallback 绕过失败。
- V5 快照内嵌算法、Shader、元素及预设。资源更新不得重绑、量化或覆盖既有工程。
