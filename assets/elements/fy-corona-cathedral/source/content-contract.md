# 日冕圣殿（肥鱼测试） Content Contract

批准来源：2026-10-21，用户选择“批准 4 份元素合同（推荐）”。本文件只记录该具体批准，不授权其他新内容。

- ID：fy-corona-cathedral；元素、算法、内容包版本均为 1；ABI 1 / V2。
- 类型：visual；单次三角网格 pass；3 层辉光线框 + 极淡彩窗三角面。
- 输入：spectrum 向量（analysis/constant/native，full，可空），默认 analysis amplitudeSpectrum/full；其余参数 constant。
- 参数：color #ffd36b、accent #6fe6ff、glass #ff9a3c、opacity 1、sensitivity 1、glow 1.3、count 6、radius 0.33、speed 0.12、x 0.5、y 0.54、depth 0.62、fill 0.16、twist 0.12、height 0.82、thickness 1。
- 几何：中轴消失点、6 跨尖拱廊、肋架穹顶、飞扶壁、中央玫瑰窗与祭坛；按 z 从远到近绘制，避免透明层顺序错误。
- 时间：绝对时间；speed 控制绕竖轴旋转；元素时段首尾 10% 平滑包络。
- 数据：64 个对数频段；低频驱动整体尺度，中频驱动拱肋流光，高频驱动玫瑰窗细部。
- 静音/低/高：静音保持基础几何、低速旋转、约 30% 辉光；高电平玫瑰窗/拱顶抬升、流光加速、冷青比例上升。
- 预算：默认约 1,000 段线框 × 3 层；含彩窗仍低于 65,536 顶点；预分配缓冲区。
- 确定性：仅依赖 frame.time/seed/参数与元素时段；相同绝对时间重复求值一致。
- 验证：封装、schema/hash、静音/低/高合成帧烟测、顶点上限、重复求值一致性；GPU/真实视觉/性能/离线导出未在无宿主环境运行时如实报告。
