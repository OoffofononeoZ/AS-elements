# 赫利俄斯圣殿（肥鱼测试） Preset Contract

批准来源：2026-10-21，用户选择“批准并生成预设（推荐）”。本文件只记录该具体批准，不授权其他新内容。

- ID：fy-helios-cathedral；预设、内容包版本均为 1；V2 运行包；工程侧为 V5 快照。
- 类型：preset；运行包 algorithms/elements 为空，只含一个 preset。
- 子项顺序：veil（fy-corona-veil）→ cathedral（fy-corona-cathedral）→ embers（fy-ember-choir）→ grade（fy-solar-grade，modifier，目标 composition）。
- 相对时段：veil 0–1；cathedral 0.10–0.94；embers 0.24–1；grade 0–1。
- 绑定：三个 visual 使用 analysis amplitudeSpectrum / full；grade 的 pulse 使用 analysis energy / scalar，transform 0–30 → 0–1，clamp，attack 0.08、release 0.3；其余按合同常量。
- 共同控件：sensitivity=0.9、glow=1.4、spectrum=amplitudeSpectrum/full，目标均为 veil/cathedral/embers；不建立继承，批量写入并提示差异。
- 特征并集：amplitudeSpectrum + energy = 2 种；低于 4 种上限。
- 无 transition、无 marker 输入、无 native 输入。
- 确定性：绝对时间 + seed + 参数；无累计状态；seek/循环/离线逐帧一致。
- 验证：预设包 schema/依赖/时段/目标/控件、四元素精确绑定烟测；GPU/真实视觉/性能/离线导出未在无宿主环境运行时如实报告。
