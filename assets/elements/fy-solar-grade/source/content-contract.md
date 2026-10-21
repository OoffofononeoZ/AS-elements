# 日冕色散（肥鱼测试） Content Contract

批准来源：2026-10-21，用户选择“批准 4 份元素合同（推荐）”。本文件只记录该具体批准，不授权其他新内容。

- ID：fy-solar-grade；元素、算法、内容包版本均为 1；ABI 1 / V2。
- 类型：modifier；单次全屏效果 pass；目标 composition；不改变构图。
- 输入：pulse 数值（constant/analysis，scalar），默认 analysis energy + transform 0–30 → 0–1，clamp，attack 0.08、release 0.3；其余参数 constant。
- 参数：amount 0.65、bloom 0.72、aberration 2.2、vignette 0.6、grain 0.05、temperature 0.22、warp 0.1、exposure 1.04、pulse 0。
- 效果：暖金高光 / 冷青阴影、12 tap 柔和辉光、径向红蓝分离、垂直热浪、暗角、细颗粒、tone map。
- 静音/低/高：静音 pulse=0 保持基础调色；高电平辉光/色散/曝光短促增强，clamp 防止失控。
- 预算：1 个全屏 pass，12 次纹理采样；无额外 render target、无多 pass ping-pong。
- 确定性：热浪/颗粒只依赖 frame.time；相同绝对时间重复求值一致。
- 验证：封装、schema/hash、静音/低/高合成帧烟测、重复求值一致性；GPU/真实视觉/性能/离线导出未在无宿主环境运行时如实报告。
