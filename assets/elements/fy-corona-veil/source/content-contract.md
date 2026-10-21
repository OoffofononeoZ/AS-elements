# 日冕纱幕（肥鱼测试） Content Contract

批准来源：2026-10-21，用户选择“批准 4 份元素合同（推荐）”。本文件只记录该具体批准，不授权其他新内容。

- ID：fy-corona-veil；元素、算法、内容包版本均为 1；ABI 1 / V2。
- 类型：visual；全屏 quad，单次 draw pass，输出不透明日冕背景。
- 输入：spectrum 向量（analysis/constant/native，full，可空），默认 analysis amplitudeSpectrum/full；其余参数 constant。
- 参数：colorHot #ff5a1f、colorCool #6fe6ff、colorVoid #03040a、opacity 1、sensitivity 1、glow 1.2、density 1.1、rays 14、speed 0.16、x 0.5、y 0.46、idle 0.22、exposure 1.05。
- 时间：绝对时间；speed 缩放旋转；元素时段首尾 8% 平滑包络。
- 数据：64 个对数频段；bass 0–7、mid 8–31、treble 32–63；sensitivity 乘入。
- 静音/低/高：静音保留 22% 呼吸与星尘；高电平核心过曝、射线拉长、青蓝晕扩张；tone map 防纯白。
- 预算：1 个全屏 pass，最多 5 层 fbm，17 个 uniform，无纹理/网格/历史状态。
- 确定性：仅依赖 frame.time/seed/参数与元素时段；相同绝对时间重复求值一致。
- 验证：封装、schema/hash、静音/低/高合成帧烟测已规划；GPU/真实视觉/性能/离线导出未在无宿主环境运行时如实报告。
