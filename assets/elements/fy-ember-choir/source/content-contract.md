# 余烬圣咏（肥鱼测试） Content Contract

批准来源：2026-10-21，用户选择“批准 4 份元素合同（推荐）”。本文件只记录该具体批准，不授权其他新内容。

- ID：fy-ember-choir；元素、算法、内容包版本均为 1；ABI 1 / V2。
- 类型：visual；单次三角网格 pass；确定性粒子拖尾 + 三层辉光 + 高能十字爆闪。
- 输入：spectrum 向量（analysis/constant/native，full，可空），默认 analysis amplitudeSpectrum/full；其余参数 constant。
- 参数：color #ffb15a、accent #ff4f8b、opacity 1、sensitivity 1、glow 1.2、count 420、size 0.004、speed 0.22、spread 0.95、x 0.5、y 0.64、rise 1、swirl 0.45、burst 1、thickness 1、exposure 1.1。
- 时间：绝对时间；粒子生命由 hash(seed,i) + 绝对时间决定；元素时段首尾 8% 平滑包络。
- 数据：64 个对数频段；每粒子按 i*64/count 取频段；peak 控制整体爆闪。
- 静音/低/高：静音仍保留约 40% 粒子缓慢上升；高电平增亮、拖尾拉长、稀疏爆闪。
- 预算：默认 420 粒子 × 约 4 层 × 6 顶点 ≈ 10,000；最大 900 粒子仍低于 65,536；预分配缓冲区。
- 确定性：仅依赖 frame.time/seed/参数与元素时段；相同绝对时间重复求值一致。
- 验证：封装、schema/hash、静音/低/高合成帧烟测、顶点上限、重复求值一致性；GPU/真实视觉/性能/离线导出未在无宿主环境运行时如实报告。
