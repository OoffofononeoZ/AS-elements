# Circular Visualizer

用户原始要求：使用项目 skill 复刻 D:/steam/steamapps/workshop/content/431960/893418273，至少独立拆分粒子、可变背景、中心圆和音乐 bar，默认 responsiveness 为50。用户随后指定 AudioSurf 宿主路径，要求图片／视频、全部既有场景、自包含 JSON 及两仓库同步，并批准实施计划。

本预设按背景→扩散粒子→纵深粒子→音乐bar→外层圆→中心圆／Logo→前景图排序，全曲有效。纵深粒子与前景图默认禁用，其余启用；背景黑色、中心圆白色、128根镜像频谱。具体尺寸／颜色等默认值取原版配置，并按1080p参照等比缩放；原版 Responsiveness=33 改为用户要求的50。媒体默认none，不携带用户文件。

只依赖七个已独立封装的精确元素，不内嵌算法或元素。共同Responsiveness批量写入五个音频响应元素，子项保持独立；未提升颜色／位置／尺寸等样式。特征并集仅wallpaperEngineSpectrum。

原项目 MIT 声明见LICENSE.txt；时钟、日期、自定义文字与FPS提示不纳入本轮。展示图为使用合成频谱的黑白构图示意，实际浏览器／媒体证据随交付报告。

preview.png 为真实浏览器 GPU 渲染截图（合成 WE 强度输入），preview.svg 为构图示意。Chrome／Edge 的元素、媒体与实时功能，以及 8 份四档短视频的精确帧数／PTS／完整解码已验证。2026-10-22 用户明确 Wallpaper Engine 导出后运行时的问题属于其他范围，无需相关测试，本次不以该运行时作为验收条件。
