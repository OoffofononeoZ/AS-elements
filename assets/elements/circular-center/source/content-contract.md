# 中心圆／Logo

用户要求复刻本地 Wallpaper Engine 893418273；本元素为独立拆分，原始许可证见 LICENSE.txt。2026-10-22 批准的计划覆盖全部既有场景与 JSON 内嵌媒体。

ABI 3，默认 wallpaperEngineSpectrum full / we-strength、左64项粉噪校准、相邻归一化并镜像；Responsiveness=50；静音归零／粒子退场，低频增强尺寸与运动。媒体默认 none，由宿主绑定与解码；空输入使用本元素固有颜色或透明画面。

参数、单位、默认值、范围及完整来源见 resource.json。全曲时段，处理不依赖墙钟；60Hz 固定模拟／30Hz 平滑，歌曲历史每次最多一秒，最多保留8个秒级检查点，实时分支禁止历史查询。随机粒子 usesSeed:true，其余元素不声明随机控制。

每帧不超过5000粒子／30000顶点，896根bar／5376顶点；圆与背景为全屏quad。源码／shader自包含；reset/dispose清理状态，像素资源完全由宿主管理。按绝对时间与参数revision重建；resize保留模拟状态。

preview.svg为对应效果示意图，媒体层使用自绘图形示意；实际 GPU／媒体／导出验证记录随任务交付。
