# ABI 3 媒体与执行模式

ABI 3 继承 ABI 2，contract 增加 executionModes（非空 timeline/realtime 数组）及可选 mediaInputs。既有 V2 包、V5 工程与 V1 实时样式保留版本和旧资源 hash；仅新增内容使用新字段。宿主与独立 codec 的事实源同步见 AudioSurf 的 visualizer:skill-codec / visualizer:skill-codec:check。

## 声明与绑定

contract.mediaInputs 为非空数组，每项 {id,kinds,multiple}。id 为小写短横线名称；kinds 为 image/video 的非空去重子集，multiple 为布尔。元素提供同序 mediaInputs，每项另含 label，能力只能收窄。

PresetElementTemplate 可有 mediaBindings，声明输入时必须逐项保存 {kind:'none'}。外部包不包含用户素材或路径。生成的背景默认黑色、中心圆默认实心、前景默认透明，这些是 none 的明确视觉语义，不是解码失败后的 fallback。

加入工程后实例可绑定 {kind:'media',assetIds,fit,intervalSeconds,crossfadeSeconds}；单个素材可为图片或视频，多个素材仅图片且声明 multiple。fit 为 cover/contain/initial，intervalSeconds>0，0≤crossfadeSeconds≤intervalSeconds。素材由宿主选择并验证，Base64 与原始字节 SHA-256 存于工程／样式可选 mediaAssets；算法不可读文件或 URL。

## 帧与 Shader

frame.mode 为 timeline/realtime。frame.media[inputId] 提供 {available,width,height,nextWidth,nextHeight,mix,fit}，均由宿主管理；初始化无媒体读取权限。无素材时 available:false、尺寸为1、mix为0。

Shader sampler2D uniform 声明 {type:'media',inputId,slot:'current'|'next'}；DrawPass 对应 uniform 值只能为声明的 inputId 字符串。宿主选择当前／下一张图片或视频目标帧并提供纹理，算法保持隔离。轮播区间末尾淡化，视频按元素相对时间（timeline）或会话时间（realtime）循环并静音。

媒体纹理按既有合成链保留显示编码 RGB 与直通 alpha，不做隐式 sRGB→linear 解码。Shader 输出 RGB 须乘最终 alpha，与既有预乘合成一致；中间色应保持素材亮度。

timeline 可读取 historyParameters 声明的历史；realtime 仍拒绝历史和标记查询。需要平滑的双模式元素应在歌曲模式固定步进并重建历史，在实时模式维护当前输入的因果状态。现有 ABI 1/2 历史元素的实时限制保持。

## Brief 与验证

新增元素可声明 mediaInputs，每项 {id,kinds,multiple,purpose,emptyBehavior}，只表达能力及空输入视觉，不携带真实素材；可声明 executionModes。图像／视频不是数值参数来源。

验证 none、图片、轮播、视频、填充、跳转、循环、取消／替换和损坏素材；检查 JSON／草稿／实时样式脱离原文件恢复，以及 Chrome/Edge 离线视频和壁纸。分别记录未运行、失败和通过。每个新资源仍须有独立展示图；源码与 Shader 保持自身目录内自包含。
