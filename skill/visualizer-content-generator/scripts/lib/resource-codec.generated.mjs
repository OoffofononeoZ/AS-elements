// Generated from AudioSurf resourceCodec.ts by sync-visualizer-skill-codec.mjs. Do not edit.
const K = new Uint32Array([
  1116352408,
  1899447441,
  3049323471,
  3921009573,
  961987163,
  1508970993,
  2453635748,
  2870763221,
  3624381080,
  310598401,
  607225278,
  1426881987,
  1925078388,
  2162078206,
  2614888103,
  3248222580,
  3835390401,
  4022224774,
  264347078,
  604807628,
  770255983,
  1249150122,
  1555081692,
  1996064986,
  2554220882,
  2821834349,
  2952996808,
  3210313671,
  3336571891,
  3584528711,
  113926993,
  338241895,
  666307205,
  773529912,
  1294757372,
  1396182291,
  1695183700,
  1986661051,
  2177026350,
  2456956037,
  2730485921,
  2820302411,
  3259730800,
  3345764771,
  3516065817,
  3600352804,
  4094571909,
  275423344,
  430227734,
  506948616,
  659060556,
  883997877,
  958139571,
  1322822218,
  1537002063,
  1747873779,
  1955562222,
  2024104815,
  2227730452,
  2361852424,
  2428436474,
  2756734187,
  3204031479,
  3329325298
]);
const r = (x, n) => x >>> n | x << 32 - n;
class Sha256 {
  h = new Uint32Array([1779033703, 3144134277, 1013904242, 2773480762, 1359893119, 2600822924, 528734635, 1541459225]);
  block = new Uint8Array(64);
  words = new Uint32Array(64);
  used = 0;
  bytes = 0;
  finished = false;
  update(input) {
    if (this.finished) throw new Error("Hash already finalized.");
    this.bytes += input.length;
    for (let start = 0; start < input.length; ) {
      const count = Math.min(64 - this.used, input.length - start);
      this.block.set(input.subarray(start, start + count), this.used);
      this.used += count;
      start += count;
      if (this.used === 64) {
        this.compress();
        this.used = 0;
      }
    }
    return this;
  }
  compress() {
    const w = this.words, view = new DataView(this.block.buffer);
    for (let i = 0; i < 16; i++) w[i] = view.getUint32(i * 4, false);
    for (let i = 16; i < 64; i++) {
      const a2 = w[i - 15], b2 = w[i - 2];
      w[i] = w[i - 16] + (r(a2, 7) ^ r(a2, 18) ^ a2 >>> 3) + w[i - 7] + (r(b2, 17) ^ r(b2, 19) ^ b2 >>> 10);
    }
    let [a, b, c, d, e, f, g, h] = Array.from(this.h);
    for (let i = 0; i < 64; i++) {
      const t1 = h + (r(e, 6) ^ r(e, 11) ^ r(e, 25)) + (e & f ^ ~e & g) + K[i] + w[i] >>> 0;
      const t2 = (r(a, 2) ^ r(a, 13) ^ r(a, 22)) + (a & b ^ a & c ^ b & c) >>> 0;
      h = g;
      g = f;
      f = e;
      e = d + t1 >>> 0;
      d = c;
      c = b;
      b = a;
      a = t1 + t2 >>> 0;
    }
    [a, b, c, d, e, f, g, h].forEach((v, i) => {
      this.h[i] = this.h[i] + v;
    });
  }
  hex() {
    if (this.finished) throw new Error("Hash already finalized.");
    const bits = this.bytes * 8;
    this.block[this.used++] = 128;
    if (this.used > 56) {
      this.block.fill(0, this.used);
      this.compress();
      this.used = 0;
    }
    this.block.fill(0, this.used, 56);
    const view = new DataView(this.block.buffer);
    view.setUint32(56, Math.floor(bits / 4294967296), false);
    view.setUint32(60, bits >>> 0, false);
    this.compress();
    this.finished = true;
    return Array.from(this.h, (v) => v.toString(16).padStart(8, "0")).join("");
  }
}
const hashBytes = (input) => new Sha256().update(input).hex();

const analyzerData = [
  {
    title: "Wallpaper Engine 风格频谱（近似）",
    abbreviation: "wallpaperEngineSpectrum",
    belongsTo: "立体声频谱",
    detail: {
      description: "用于音频响应动画的 128 项频谱：左声道 0–63、右声道 64–127，各自从低频到高频，约 30Hz。官方说明通常为 0–1，短时可以超过 1。本项目采用实数 PCM 的独立 DFT；根据官方开发者 2017 年的历史说明，将 DFT 输入约 67% 用于连续 PCM、其余尾部补零。640-bin 扫描、0.25 次幂分频与避免跳过频段的规则、频率权重、每 8 段动态增益和时间平滑参考 OWE 固定提交 4aaec723；这些细节并非官方完整规格。增益使用默认录音音量，关闭可选阈值，不添加粉噪校准、空间模糊或去零尾。单声道复制为双声道，多声道按 speakers 规则下混。频率范围为参考 DFT bin 范围，不用于精确响度或声学测量，也不承诺与当前 Wallpaper Engine 逐值相同。",
      usedfor: "音频响应动画。",
      range: "非负 Float32，通常为 0–1，允许超过 1。"
    }
  },
  {
    title: "RMS",
    abbreviation: "rms",
    belongsTo: "时域特征",
    detail: {
      description: "波形的均方根，对应其响度。对应 YAAFE 中的Energy特征，改编自 Loy 的《Musimathics》[1]。",
      usedfor: "大致了解信号的响度。",
      range: "RMS 是一个正浮点数，仅受输入信号的长度和音量限制。更多信息请查阅维基百科条目（https://en.wikipedia.org/wiki/Root_mean_square）。在需要为每个音频特征设定上限的应用中使用 RMS 时，我们建议你测量将要提取特征的音频样本，确定一个合理的“最大值”作为你的上限，然后使用 Math.min 函数取当前 rms 值或你的最大阈值中的较小值。"
    }
  },
  {
    title: "ZCR（过零率）",
    abbreviation: "zcr",
    belongsTo: "时域特征",
    detail: {
      description: "信号在缓冲区中穿过零值的次数。",
      usedfor: "有助于区分打击乐声音和音高声音。打击乐声音在不同缓冲区上的 ZCR 是随机的，而音高声音则会返回一个更恒定的值。",
      range: "0 - ((缓冲区大小 / 2) - 1)。在 Meyda 中，默认缓冲区大小 (bufferSize) 为 512，因此默认 ZCR 范围是 0 - 255。"
    }
  },
  {
    title: "Energy（能量）",
    abbreviation: "energy",
    belongsTo: "时域特征",
    detail: {
      description: "平方信号的无穷积分。根据 Lathi [2] 的定义。",
      usedfor: "这是信号响度的另一个指标。",
      range: "0 - bufferSize，其中 0.0 表示非常安静，bufferSize 表示非常响亮。"
    }
  },
  {
    title: "AmplitudeSpectrum（幅度谱）",
    abbreviation: "amplitudeSpectrum",
    belongsTo: "频域特征",
    detail: {
      description: "这也被称为幅值谱。通过计算快速傅里叶变换 (FFT)，我们得到频域表示的信号。输出是一个数组，其中每个索引是一个频率区间（即包含关于一个频率范围的信息），包含一个复数值（实部和虚部）。幅度谱获取这个复数数组并计算每个索引的幅度。结果是信号中频率分布及其对应强度。如果你想了解更多关于傅里叶变换以及时域与频域分析之间的区别，这篇文章(https://www.mathworks.com/help/signal/ug/practical-introduction-to-frequency-domain-analysis.html)是一个不错的起点。",
      usedfor: "对于任何类型的音频分析都非常有用。事实上，Meyda 中提取的许多特征都基于此 :)",
      range: "一个大小为 FFT 一半的数组，包含关于 0 到一半采样率之间频率的信息。在 Meyda 中，默认采样率 (sampleRate) 为 44100Hz，FFT 大小等于缓冲区大小 (bufferSize)，默认为 512。"
    }
  },
  {
    title: "Power Spectrum（功率谱）",
    abbreviation: "powerSpectrum",
    belongsTo: "频域特征",
    detail: {
      description: "这是 amplitudeSpectrum 的平方。",
      usedfor: "与幅度谱相比，它更好地强调了频率区间之间的差异。",
      range: "一个大小为 FFT 一半的数组，包含关于 0 到一半采样率之间频率的信息。在 Meyda 中，默认采样率 (sampleRate) 为 44100Hz，FFT 大小等于缓冲区大小 (bufferSize)，默认为 512。"
    }
  },
  {
    title: "Spectral Centroid（谱质心）",
    abbreviation: "spectralCentroid",
    belongsTo: "频域特征",
    detail: {
      description: "表示给定声音“明亮度”的指标，代表频谱的重心。如果你把频谱想象成一个木块，并试图用手指（沿 X 轴）让它平衡，谱质心就是当它成功平衡时你手指“接触”到的频率。",
      usedfor: "如上所述，它量化了声音的“明亮度”。例如，可以用来区分低音吉他（低谱质心）和小号（高谱质心）。",
      range: "0 - FFT 大小的一半。在 Meyda 中，FFT 大小等于缓冲区大小 (bufferSize)，默认为 512。"
    }
  },
  {
    title: "Spectral Flatness（谱平坦度）",
    abbreviation: "spectralFlatness",
    belongsTo: "频域特征",
    detail: {
      description: "频谱的平坦度。通过几何平均值与算术平均值的比值计算得到。",
      usedfor: "确定声音的噪声程度。例如，纯正弦波的平坦度接近 0.0，而白噪声的平坦度接近 1.0。",
      range: "0.0 - 1.0，其中 0.0 表示不平坦，1.0 表示非常平坦。"
    }
  },
  {
    title: "Spectral Flux（谱通量）",
    abbreviation: "spectralFlux",
    belongsTo: "频域特征",
    detail: {
      description: "衡量信号频谱变化快慢的指标。通过计算当前频谱与前一帧频谱的差值得到。",
      usedfor: "通常对应于声音的感知“粗糙度”。例如，可用于确定声音的音色。",
      range: "起始于 0.0。没有上限范围，因为它取决于输入信号。"
    }
  },
  {
    title: "Spectral Slope（谱斜率）",
    abbreviation: "spectralSlope",
    belongsTo: "频域特征",
    detail: {
      description: "衡量频谱形状“倾斜”程度的指标。通过对幅度谱执行线性回归计算得到。",
      usedfor: "可用于区分不同的语音质量，例如嘶嘶声、呼吸声和常规语音。与谱质心和谱滚降密切相关。",
      range: "0.0 - 1.0"
    }
  },
  {
    title: "Spectral Rolloff（谱滚降）",
    abbreviation: "spectralRolloff",
    belongsTo: "频域特征",
    detail: {
      description: "包含了频谱 99% 能量之下的频率。",
      usedfor: "可用于近似信号中的最高频率。",
      range: "0 - 一半的采样率。在 Meyda 中，默认采样率 (sampleRate) 为 44100Hz。"
    }
  },
  {
    title: "Spectral Spread（谱扩展度）",
    abbreviation: "spectralSpread",
    belongsTo: "频域特征",
    detail: {
      description: "表示频率内容在整个频谱上的扩展程度。与频率带宽相对应。",
      usedfor: "可用于区分噪声音（高谱扩展度）和音高声音（低谱扩展度）。",
      range: "0 - FFT 大小的一半。在 Meyda 中，FFT 大小等于缓冲区大小 (bufferSize)，默认为 512。"
    }
  },
  {
    title: "Spectral Skewness（谱偏度）",
    abbreviation: "spectralSkewness",
    belongsTo: "频域特征",
    detail: {
      description: "表示频谱相对于其均值是否向特定值范围偏斜。",
      usedfor: "常用于了解声音的音色。",
      range: "可以是负数、正数或零。其中 0 表示关于均值对称，负数表示频率内容向均值右侧偏斜，正数表示频率内容向均值左侧偏斜。"
    }
  },
  {
    title: "Spectral Kurtosis（谱峰度）",
    abbreviation: "spectralKurtosis",
    belongsTo: "频域特征",
    detail: {
      description: "表示频谱尖锐程度的指标。可视为谱平坦度的反面。",
      usedfor: "常用于指示声音的“音调性 / 调性感”。",
      range: "0.0 - 1.0，其中 0.0 表示无调性感，1.0 表示非常有调性感。"
    }
  },
  {
    title: "Spectral Crest（谱峰值因子）",
    abbreviation: "spectralCrest",
    belongsTo: "频域特征",
    detail: {
      description: "最大幅度与整个帧的均方根之比。数值高表示与频谱的整体曲线相比存在一个响亮的峰值。",
      usedfor: "如果你正在分析的频谱中存在峰值，它可以帮助辨别频谱的峰值程度。",
      range: "范围是任意的，数值越高表示频谱中的峰值越极端。"
    }
  },
  {
    title: "Chroma（色度）",
    abbreviation: "chroma",
    belongsTo: "频域特征",
    detail: {
      description: "计算每个半音音高类别（C、C♯、D、D♯、E、F、F♯、G、G♯、A、A♯、B）在信号中存在的程度。",
      usedfor: "常用于分析录制音乐的和声内容，例如和弦或调性检测。",
      range: "每个音高类别的范围为 0.0 - 1.0。"
    }
  },
  {
    title: "Loudness（响度）",
    abbreviation: "loudness",
    belongsTo: "感知特征",
    detail: {
      description: "人类对频率的感知是非线性的。Bark 标度(https://en.wikipedia.org/wiki/Bark_scale)是为了使等距离对应等距离的频率感知而开发的。此特征输出一个包含两个值的对象：在此标度的每个步长（通常称为频带）上输入声音的响度 (`.specific`)，总共有 24 个频带;总响度 (`.total`)，它是 24 个 `.specific` 响度系数的总和。",
      usedfor: "可用于构建更符合人类响度感知的滤波器。",
      range: "响度特征提取器使用归一化后的频谱来计算各个 Bark 频带的能量，但能量本身之后不会被归一化。如果我们将其归一化到最大可能的声音，就会压缩范围，使得低响度值失去保真度。因此，我们将此特征的归一化留给值的消费者，因为归一化方法取决于具体用例。例如，实时音频可视化器可能会选择存储“迄今为止看到的最大响度”值并以此进行归一化，而在大量音频语料库上提取音频特征的系统则可能需要一个共享的归一化参考点，并应选择适合其用例和数据集的归一化方法。请务必记住你的归一化值和方法！我们建议进行实验，看看什么方法适合你的用例。如果你对如何改进响度特征或任何其他特征有想法，请告知我们。"
    }
  },
  {
    title: "Perceptual Spread（感知扩展度）",
    abbreviation: "perceptualSpread",
    belongsTo: "感知特征",
    detail: {
      description: "计算 .specific 响度系数在 Bark 标度上的扩展度。",
      usedfor: "表示一个声音将被感知为“丰富 / 饱满”的程度指标。",
      range: "0.0 - 1.0，其中 0.0 表示不“丰富”，1.0 表示非常“丰富”。"
    }
  },
  {
    title: "Perceptual Sharpness（感知锐度）",
    abbreviation: "perceptualSharpness",
    belongsTo: "感知特征",
    detail: {
      description: "基于 Bark 响度系数的声音感知“锐度”。",
      usedfor: "检测输入声音是否被感知为“尖锐”。例如，可用于区分小军鼓和低音鼓的声音。",
      range: "0.0 - 1.0，其中 0.0 表示不“尖锐”（如低音鼓），1.0 表示非常尖锐（如小军鼓）。"
    }
  },
  {
    title: "Mel-Frequency Cepstral Coefficients（梅尔频率倒谱系数，MFCC）",
    abbreviation: "mfcc",
    belongsTo: "感知特征",
    detail: {
      description: "由于人类不是以线性方式解读音高，因此人们设计了各种频率标度来表示人类听感中音高之间的距离。梅尔标度(https://en.wikipedia.org/wiki/Mel_scale)是其中之一，现在广泛用于语音相关应用。Meyda 的实现受到了 Huang [3]、Davis [4]、Grierson [5] 以及 librosa 库(https://github.com/bmcfee/librosa)的启发。",
      usedfor: "通常用于在自动语音识别 (ASR) 之前进行语音活动检测 (VAD)。",
      range: "一个表示每个梅尔频带强度的值数组。数组的默认大小为 13，但可通过 numberOfMFCCCoefficients 配置。"
    }
  },
  {
    title: "Complex Spectrum（复频谱）",
    abbreviation: "complexSpectrum",
    belongsTo: "实用提取器",
    detail: {
      description: "一个包含 FFT 实部和虚部的复数值数组 (ComplexArray)。",
      usedfor: "用于创建 amplitudeSpectrum。也用于进一步的信号处理，因为它包含频率和信号相位的信息。",
      range: "在本项目锁定的 Meyda 5.6.3 与 1024 bufferSize 下，real 和 imag 各返回完整 1024 个 FFT bin。前半段表示非负频率，后半段表示实数音频的负频率镜像；界面保留完整 bin 顺序，并从 real/imag 派生 magnitude 与 -π 到 π 的 phase。"
    }
  },
  {
    title: "Buffer（缓冲区）",
    abbreviation: "buffer",
    belongsTo: "实用提取器",
    detail: {
      description: "这是从麦克风、wav 文件或任何其他输入音频中读取音频时获得的原始音频。它被编码为 Float32Array。",
      usedfor: "Meyda 中的所有时域特征都从这个缓冲区中提取。你也可以用它来可视化音频波形。",
      range: "一个大小为 bufferSize 的数组，其中每个值的范围可以在 -1.0 到 1.0 之间。"
    }
  }
];

const FEATURE_IDS = [
  "wallpaperEngineSpectrum",
  "rms",
  "zcr",
  "energy",
  "amplitudeSpectrum",
  "powerSpectrum",
  "spectralCentroid",
  "spectralFlatness",
  "spectralFlux",
  "spectralSlope",
  "spectralRolloff",
  "spectralSpread",
  "spectralSkewness",
  "spectralKurtosis",
  "spectralCrest",
  "chroma",
  "loudness",
  "perceptualSpread",
  "perceptualSharpness",
  "mfcc",
  "complexSpectrum",
  "buffer"
];
const isFeatureId = (value) => typeof value === "string" && FEATURE_IDS.includes(value);

const details = new Map(
  analyzerData.map((entry) => [entry.abbreviation, entry])
);
const defineFeature = (id, input) => {
  const detail = details.get(id);
  if (!detail) {
    throw new Error(`Missing analyzerData entry for ${id}.`);
  }
  return {
    id,
    meydaKey: id,
    label: detail.title,
    description: detail.detail.description,
    extractionSource: "meyda",
    ...input
  };
};
const scalar = (id, input) => defineFeature(id, {
  ...input,
  outputShape: "scalar",
  renderer: "scalar-line",
  dimensions: () => []
});
const FEATURE_REGISTRY = {
  wallpaperEngineSpectrum: defineFeature("wallpaperEngineSpectrum", {
    outputShape: "frequency-vector",
    renderer: "stereo-spectrum",
    range: { min: 0, unit: "WE approximate" },
    dependencies: [],
    dimensions: () => [128],
    deliveryMilestone: "M10",
    workerSupported: true,
    extractionSource: "project-wallpaper-spectrum-v1"
  }),
  rms: scalar("rms", {
    range: { min: 0 },
    dependencies: [],
    deliveryMilestone: "M7",
    workerSupported: true
  }),
  zcr: scalar("zcr", {
    range: { min: 0 },
    dependencies: [],
    deliveryMilestone: "M8",
    workerSupported: true,
    zeroEnergyValue: 0
  }),
  energy: scalar("energy", {
    range: { min: 0 },
    dependencies: [],
    deliveryMilestone: "M8",
    workerSupported: true,
    zeroEnergyValue: 0
  }),
  amplitudeSpectrum: defineFeature("amplitudeSpectrum", {
    outputShape: "frequency-vector",
    renderer: "frequency-heatmap",
    range: { min: 0 },
    dependencies: [],
    dimensions: (config) => [config.frameSize / 2],
    deliveryMilestone: "M7",
    workerSupported: true
  }),
  powerSpectrum: defineFeature("powerSpectrum", {
    outputShape: "frequency-vector",
    renderer: "frequency-heatmap",
    range: { min: 0 },
    dependencies: ["amplitudeSpectrum"],
    dimensions: (config) => [config.frameSize / 2],
    deliveryMilestone: "M9",
    workerSupported: true
  }),
  spectralCentroid: scalar("spectralCentroid", {
    range: { min: 0, unit: "bin" },
    dependencies: ["amplitudeSpectrum"],
    deliveryMilestone: "M8",
    workerSupported: true,
    zeroEnergyValue: 0
  }),
  spectralFlatness: scalar("spectralFlatness", {
    range: { min: 0, max: 1 },
    dependencies: ["amplitudeSpectrum"],
    deliveryMilestone: "M8",
    workerSupported: true,
    zeroEnergyValue: 0
  }),
  spectralFlux: scalar("spectralFlux", {
    range: { min: 0 },
    dependencies: ["amplitudeSpectrum"],
    deliveryMilestone: "M8",
    workerSupported: true,
    extractionSource: "project-spectral-flux-v1",
    zeroEnergyValue: 0
  }),
  spectralSlope: scalar("spectralSlope", {
    range: { signed: true },
    dependencies: ["amplitudeSpectrum"],
    deliveryMilestone: "M8",
    workerSupported: true,
    zeroEnergyValue: 0
  }),
  spectralRolloff: scalar("spectralRolloff", {
    range: { min: 0, unit: "Hz" },
    dependencies: ["amplitudeSpectrum"],
    deliveryMilestone: "M8",
    workerSupported: true,
    zeroEnergyValue: 0
  }),
  spectralSpread: scalar("spectralSpread", {
    range: { min: 0, unit: "bin" },
    dependencies: ["amplitudeSpectrum", "spectralCentroid"],
    deliveryMilestone: "M8",
    workerSupported: true,
    zeroEnergyValue: 0
  }),
  spectralSkewness: scalar("spectralSkewness", {
    range: { signed: true },
    dependencies: ["amplitudeSpectrum", "spectralCentroid"],
    deliveryMilestone: "M8",
    workerSupported: true,
    zeroEnergyValue: 0
  }),
  spectralKurtosis: scalar("spectralKurtosis", {
    range: { min: 0 },
    dependencies: ["amplitudeSpectrum", "spectralCentroid"],
    deliveryMilestone: "M8",
    workerSupported: true,
    zeroEnergyValue: 0
  }),
  spectralCrest: scalar("spectralCrest", {
    range: { min: 0 },
    dependencies: ["amplitudeSpectrum"],
    deliveryMilestone: "M8",
    workerSupported: true,
    zeroEnergyValue: 0
  }),
  chroma: defineFeature("chroma", {
    outputShape: "category-vector",
    renderer: "chroma-heatmap",
    range: { min: 0, max: 1 },
    dependencies: ["amplitudeSpectrum"],
    dimensions: () => [12],
    deliveryMilestone: "M7",
    workerSupported: true
  }),
  loudness: defineFeature("loudness", {
    outputShape: "loudness-structure",
    renderer: "loudness",
    range: { min: 0 },
    dependencies: ["amplitudeSpectrum"],
    dimensions: () => [24, 1],
    deliveryMilestone: "M10",
    workerSupported: true
  }),
  perceptualSpread: scalar("perceptualSpread", {
    range: { min: 0, max: 1 },
    dependencies: ["loudness"],
    deliveryMilestone: "M8",
    workerSupported: true,
    zeroEnergyValue: 0
  }),
  perceptualSharpness: scalar("perceptualSharpness", {
    range: { min: 0 },
    dependencies: ["loudness"],
    deliveryMilestone: "M8",
    workerSupported: true,
    zeroEnergyValue: 0
  }),
  mfcc: defineFeature("mfcc", {
    outputShape: "category-vector",
    renderer: "frequency-heatmap",
    range: { signed: true },
    dependencies: ["amplitudeSpectrum", "powerSpectrum"],
    dimensions: (config) => [config.numberOfMFCCCoefficients],
    deliveryMilestone: "M9",
    workerSupported: true
  }),
  complexSpectrum: defineFeature("complexSpectrum", {
    outputShape: "complex-spectrum",
    renderer: "complex-spectrum",
    range: { signed: true },
    dependencies: [],
    dimensions: (config) => [config.frameSize, 2],
    deliveryMilestone: "M10",
    workerSupported: true
  }),
  buffer: defineFeature("buffer", {
    outputShape: "waveform",
    renderer: "waveform",
    range: { min: -1, max: 1, signed: true },
    dependencies: [],
    dimensions: (config) => [config.frameSize],
    deliveryMilestone: "M9",
    workerSupported: true
  })
};

const FT_ROLES = ["drums", "bass", "other", "vocals"];
const FT_RATE = 44100;
const FT_FRAMES = 343980;
const FT_OVERLAP = 85995;
const FT_STRIDE = FT_FRAMES - FT_OVERLAP;
const FT_CONFIG = {
  version: "ft-browser-p1-v3",
  sampleRate: FT_RATE,
  frames: FT_FRAMES,
  runtimeBuild: "ort-all-jsep",
  graphOptimization: "disabled",
  overlap: FT_OVERLAP,
  stride: FT_STRIDE,
  normalization: "none-export-graph",
  window: "linear-25pct-f32-uncovered-endpoint-1e-8",
  padding: "zero",
  resampler: "blackman-sinc-64tap-1024phase-zero-phase-v1",
  modelInput: "native-44100-or-task-opfs-44100-stereo-reuse-v1",
  sourceHash: "descriptor-v1-and-native-channel-chunks-16384-le-f32",
  energy: "30hz-channel-mean-square-rms-dbfs-minus80-zero-u16"
};
hashBytes(new TextEncoder().encode(JSON.stringify(FT_CONFIG)));

const STEM_FEATURE_IDS = [
  "wallpaperEngineSpectrum",
  "energy",
  "amplitudeSpectrum",
  "buffer"
];
const isStemRole = (value) => typeof value === "string" && FT_ROLES.includes(value);
const isStemFeature = (value) => STEM_FEATURE_IDS.includes(value);

const COMPONENTS = /* @__PURE__ */ new Set([
  "default",
  "total",
  "specific",
  "real",
  "imag",
  "magnitude",
  "phase"
]);
class VisualizerProjectValidationError extends Error {
  code;
  constructor(code, message) {
    super(message);
    this.name = "VisualizerProjectValidationError";
    this.code = code;
  }
}
const invalid = (message) => {
  throw new VisualizerProjectValidationError("invalid-schema", message);
};
const isRecord = (value) => typeof value === "object" && value !== null && !Array.isArray(value);
const record = (value, path) => {
  if (!isRecord(value)) invalid(`${path} must be an object.`);
  return value;
};
const keys = (value, required, optional = [], path = "value") => {
  const allowed = /* @__PURE__ */ new Set([...required, ...optional]);
  for (const key of Object.keys(value)) {
    if (!allowed.has(key)) invalid(`${path}.${key} is not supported.`);
  }
  for (const key of required) {
    if (!Object.prototype.hasOwnProperty.call(value, key)) {
      invalid(`${path}.${key} is required.`);
    }
  }
};
const finite = (value, path) => {
  if (typeof value !== "number" || !Number.isFinite(value) || Object.is(value, -0)) {
    invalid(`${path} must be a finite number other than -0.`);
  }
  return value;
};
const integer = (value, path) => {
  const result = finite(value, path);
  if (!Number.isInteger(result)) invalid(`${path} must be an integer.`);
  return result;
};
const assertInRange = (value, range, path) => {
  if (value < range.min || value > range.max) {
    invalid(`${path} must be between ${range.min} and ${range.max}.`);
  }
  if (range.integer && !Number.isInteger(value)) {
    invalid(`${path} must be an integer.`);
  }
};
const text = (value, path) => {
  if (typeof value !== "string" || value.trim().length === 0) {
    invalid(`${path} must be a non-empty string.`);
  }
  return value;
};
const canonicalConstant = (input, parameter, path) => {
  if (parameter.valueKind === "number") {
    const value = finite(input, path);
    const range = parameter.range;
    if (!range) return invalid(`${path} has no registered numeric range.`);
    assertInRange(value, range, path);
    return value;
  }
  if (parameter.valueKind === "boolean") {
    if (typeof input !== "boolean") invalid(`${path} must be boolean.`);
    return input;
  }
  if (parameter.valueKind === "color") {
    const value = text(input, path);
    if (!/^#[0-9a-f]{6}$/i.test(value)) invalid(`${path} must be a six-digit color.`);
    return value;
  }
  if (!Array.isArray(input)) invalid(`${path} must be a numeric array.`);
  const values = input;
  if (values.length === 0 && !parameter.allowEmptyVector) {
    invalid(`${path} must not be empty.`);
  }
  for (let index = 0; index < values.length; index += 1) {
    if (!(index in values)) invalid(`${path} must not be sparse.`);
  }
  return values.map((entry, index) => {
    const value = finite(entry, `${path}[${index}]`);
    if (parameter.vectorElementRange) {
      assertInRange(value, parameter.vectorElementRange, `${path}[${index}]`);
    }
    return value;
  });
};
const canonicalProjection = (input, path) => {
  const value = record(input, path);
  const kind = value.kind;
  if (["scalar", "full", "mean", "max", "peak"].includes(String(kind))) {
    keys(value, ["kind"], [], path);
    return { kind };
  }
  if (kind === "bin") {
    keys(value, ["kind", "index"], [], path);
    const index = integer(value.index, `${path}.index`);
    if (index < 0) invalid(`${path}.index is invalid.`);
    return { kind, index };
  }
  if (kind === "band") {
    keys(value, ["kind", "start", "end"], [], path);
    const start = integer(value.start, `${path}.start`);
    const end = integer(value.end, `${path}.end`);
    if (start < 0 || end <= start) invalid(`${path} is not a half-open band.`);
    return { kind, start, end };
  }
  return invalid(`${path}.kind is invalid.`);
};
const projectionLength = (featureId, component) => {
  const definition = FEATURE_REGISTRY[featureId];
  if (definition.outputShape === "scalar") {
    if (component !== "default") invalid(`${featureId} only supports the default scalar component.`);
    return null;
  }
  if (definition.outputShape === "loudness-structure") {
    if (component === "total") return null;
    if (component === "specific") return 24;
    invalid("loudness requires total or specific component.");
  }
  if (definition.outputShape === "complex-spectrum") {
    if (!["real", "imag", "magnitude", "phase"].includes(component)) {
      invalid("complexSpectrum requires a complex component.");
    }
    return 1024;
  }
  if (component !== "default") invalid(`${featureId} only supports the default component.`);
  if (definition.outputShape === "frequency-vector") return 512;
  if (definition.outputShape === "category-vector") {
    return featureId === "mfcc" ? 13 : 12;
  }
  if (definition.outputShape === "waveform") return 1024;
  return invalid(`${featureId} has an unsupported projection shape.`);
};
const assertProjectionCompatible = (featureId, component, projection, parameter) => {
  const length = projectionLength(featureId, component);
  if (length === null) {
    if (projection.kind !== "scalar" || parameter.valueKind !== "number") {
      invalid(`${featureId} must use scalar projection for a numeric parameter.`);
    }
    return;
  }
  if (projection.kind === "scalar") invalid(`${featureId} is not scalar.`);
  if (projection.kind === "full" && parameter.valueKind !== "vector") {
    invalid("full projection requires a vector parameter.");
  }
  if (projection.kind !== "full" && parameter.valueKind !== "number") {
    invalid("reduced vector projection requires a numeric parameter.");
  }
  if (projection.kind === "bin" && projection.index >= length) {
    invalid("analysis bin is outside the registered dimensions.");
  }
  if (projection.kind === "band" && projection.end > length) {
    invalid("analysis band is outside the registered dimensions.");
  }
};
const canonicalTransform = (input, path, fullVector) => {
  const value = record(input, path);
  keys(
    value,
    ["inputMin", "inputMax", "outputMin", "outputMax", "clamp", "invert", "attackSeconds", "releaseSeconds"],
    [],
    path
  );
  const result = {
    inputMin: finite(value.inputMin, `${path}.inputMin`),
    inputMax: finite(value.inputMax, `${path}.inputMax`),
    outputMin: finite(value.outputMin, `${path}.outputMin`),
    outputMax: finite(value.outputMax, `${path}.outputMax`),
    clamp: value.clamp,
    invert: value.invert,
    attackSeconds: finite(value.attackSeconds, `${path}.attackSeconds`),
    releaseSeconds: finite(value.releaseSeconds, `${path}.releaseSeconds`)
  };
  if (typeof result.clamp !== "boolean" || typeof result.invert !== "boolean") {
    invalid(`${path}.clamp and invert must be boolean.`);
  }
  if (result.inputMax <= result.inputMin) invalid(`${path} input range is collapsed.`);
  if (result.attackSeconds < 0 || result.releaseSeconds < 0) {
    invalid(`${path} smoothing must be non-negative.`);
  }
  if (fullVector && (result.attackSeconds !== 0 || result.releaseSeconds !== 0)) {
    invalid(`${path} cannot smooth full vectors.`);
  }
  return result;
};
const canonicalBinding = (input, parameter, editorProject, path) => {
  const value = record(input, path);
  keys(value, ["parameterId", "source"], ["transform"], path);
  if (text(value.parameterId, `${path}.parameterId`) !== parameter.id) {
    invalid(`${path}.parameterId does not match the registry order.`);
  }
  const sourceValue = record(value.source, `${path}.source`);
  if (typeof sourceValue.kind !== "string" || !parameter.allowedSourceKinds.includes(sourceValue.kind)) {
    invalid(`${path}.source.kind is not allowed for ${parameter.id}.`);
  }
  let source;
  if (sourceValue.kind === "constant") {
    keys(sourceValue, ["kind", "value"], [], `${path}.source`);
    source = {
      kind: "constant",
      value: canonicalConstant(sourceValue.value, parameter, `${path}.source.value`)
    };
  } else if (sourceValue.kind === "analysis") {
    if (!["number", "vector"].includes(parameter.valueKind)) {
      invalid(`${path} parameter cannot use analysis data.`);
    }
    keys(sourceValue, ["kind", "featureId", "projection"], ["component", "stemRole"], `${path}.source`);
    const rawFeatureId = sourceValue.featureId;
    if (!isFeatureId(rawFeatureId)) invalid(`${path}.source.featureId is invalid.`);
    const featureId = rawFeatureId;
    if (sourceValue.stemRole !== void 0 && (!isStemRole(sourceValue.stemRole) || !isStemFeature(featureId) || parameter.valueKind !== "vector"))
      invalid(`${path}.source.stemRole requires a compatible spectrum input.`);
    const component = sourceValue.component === void 0 ? "default" : sourceValue.component;
    if (typeof component !== "string" || !COMPONENTS.has(component)) {
      invalid(`${path}.source.component is invalid.`);
    }
    const projection = canonicalProjection(sourceValue.projection, `${path}.source.projection`);
    if (!parameter.allowedAnalysisComponents?.includes(component)) {
      invalid(`${path}.source.component is not allowed for ${parameter.id}.`);
    }
    if (!parameter.allowedAnalysisProjections?.includes(projection.kind)) {
      invalid(`${path}.source.projection is not allowed for ${parameter.id}.`);
    }
    assertProjectionCompatible(featureId, component, projection, parameter);
    source = {
      kind: "analysis",
      featureId,
      ...sourceValue.stemRole === void 0 ? {} : { stemRole: sourceValue.stemRole },
      ...sourceValue.component === void 0 ? {} : { component },
      projection
    };
  } else if (sourceValue.kind === "editor-event") {
    if (parameter.valueKind !== "number") {
      invalid(`${path} parameter cannot use Editor events.`);
    }
    keys(sourceValue, ["kind", "laneId"], ["innerClassId"], `${path}.source`);
    text(sourceValue.laneId, `${path}.source.laneId`);
    return invalid(`${path}.source.laneId is not present in the Editor snapshot.`);
  } else {
    return invalid(`${path}.source.kind is invalid.`);
  }
  const transform = value.transform === void 0 ? void 0 : canonicalTransform(
    value.transform,
    `${path}.transform`,
    source.kind === "analysis" && source.projection.kind === "full"
  );
  if (transform && parameter.valueKind !== "number" && !(source.kind === "analysis" && source.projection.kind === "full")) {
    invalid(`${path}.transform is only valid for numeric bindings.`);
  }
  const outputRange = parameter.valueKind === "number" ? parameter.range : parameter.vectorElementRange;
  if (transform && outputRange) {
    assertInRange(transform.outputMin, outputRange, `${path}.transform.outputMin`);
    assertInRange(transform.outputMax, outputRange, `${path}.transform.outputMax`);
  }
  return { parameterId: parameter.id, source, ...transform ? { transform } : {} };
};

const identifier$1 = (v) => {
  const id = text(v, "媒体输入 ID");
  if (!/^[a-z][a-z0-9-]*$/.test(id) || ["constructor", "prototype", "__proto__"].includes(id))
    return invalid("媒体输入 ID 无效。");
  return id;
};
function validateMediaInputs(input) {
  if (input === void 0) return void 0;
  if (!Array.isArray(input) || !input.length) return invalid("媒体输入声明无效。");
  const result = input.map((raw) => {
    const v = record(raw, "媒体输入");
    keys(v, ["id", "kinds", "multiple"]);
    if (!Array.isArray(v.kinds) || !v.kinds.length || new Set(v.kinds).size !== v.kinds.length || v.kinds.some((k) => !["image", "video"].includes(k)) || typeof v.multiple !== "boolean")
      return invalid("媒体输入能力无效。");
    return { id: identifier$1(v.id), kinds: [...v.kinds], multiple: v.multiple };
  });
  if (new Set(result.map((i) => i.id)).size !== result.length) return invalid("媒体输入重复。");
  return result;
}
function validateMediaDefinitions(input, contract) {
  if (!contract) {
    if (input !== void 0) return invalid("算法未声明媒体输入。");
    return void 0;
  }
  if (!Array.isArray(input) || input.length !== contract.length) return invalid("媒体输入定义不完整。");
  return input.map((raw, i) => {
    const v = record(raw, "媒体输入定义");
    keys(v, ["id", "kinds", "multiple", "label"]);
    const c = contract[i];
    const [definition] = validateMediaInputs([{ id: v.id, kinds: v.kinds, multiple: v.multiple }]);
    if (definition.id !== c.id || definition.kinds.some((k) => !c.kinds.includes(k)) || definition.multiple && !c.multiple)
      return invalid("媒体输入超出算法能力。");
    return { ...definition, label: text(v.label, "媒体输入名称") };
  });
}
function validateMediaBindings(input, definitions, assets = [], template = false) {
  if (!definitions) {
    if (input !== void 0) return invalid("元素未声明媒体输入。");
    return void 0;
  }
  const v = record(input, "媒体绑定");
  keys(
    v,
    definitions.map((i) => i.id)
  );
  return Object.fromEntries(
    definitions.map((d) => {
      const b = record(v[d.id], "媒体绑定");
      if (b.kind === "none") {
        keys(b, ["kind"]);
        return [d.id, { kind: "none" }];
      }
      keys(b, ["kind", "assetIds", "fit", "intervalSeconds", "crossfadeSeconds"]);
      if (template || b.kind !== "media" || !Array.isArray(b.assetIds) || !b.assetIds.length || new Set(b.assetIds).size !== b.assetIds.length || !d.multiple && b.assetIds.length !== 1 || !["cover", "contain", "initial"].includes(String(b.fit)))
        return invalid("媒体绑定无效。");
      const selected = b.assetIds.map((id) => assets.find((a) => a.id === id));
      if (selected.some((a) => !a || !d.kinds.includes(a.mimeType.startsWith("image/") ? "image" : "video")) || selected.length > 1 && selected.some((a) => a.mimeType.startsWith("video/")))
        return invalid("媒体缺失或不符合输入能力。");
      const intervalSeconds = finite(b.intervalSeconds, "轮播间隔"), crossfadeSeconds = finite(b.crossfadeSeconds, "淡化时长");
      if (intervalSeconds <= 0 || crossfadeSeconds < 0 || crossfadeSeconds > intervalSeconds)
        return invalid("轮播时间无效。");
      return [
        d.id,
        {
          kind: "media",
          assetIds: [...b.assetIds],
          fit: b.fit,
          intervalSeconds,
          crossfadeSeconds
        }
      ];
    })
  );
}

function canonicalJson(value) {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return "[" + value.map(canonicalJson).join(",") + "]";
  const object = value;
  return "{" + Object.keys(object).sort().map((key) => JSON.stringify(key) + ":" + canonicalJson(object[key])).join(",") + "}";
}
function resourceHash(value) {
  const { hash: _hash, ...payload } = value;
  return hashBytes(new TextEncoder().encode(canonicalJson(payload)));
}
const resourceKey = (ref) => `${ref.id}@${ref.version}:${ref.hash}`;
const sameResource = (a, b) => resourceKey(a) === resourceKey(b);

function validateMarkerInputs(input) {
  if (!Array.isArray(input) || !input.length) return invalid("标记输入声明必须为非空列表。");
  const ids = /* @__PURE__ */ new Set();
  return input.map((raw) => {
    const v = record(raw, "标记输入");
    keys(v, ["id", "eventKind", "selectionModes"], ["categorySelection"]);
    const id = text(v.id, "标记输入 ID");
    if (!/^[a-zA-Z_][a-zA-Z0-9_.-]*$/.test(id) || ["__proto__", "prototype", "constructor"].includes(id) || ids.has(id))
      return invalid("标记输入 ID 无效或重复。");
    ids.add(id);
    if (!["point", "range"].includes(String(v.eventKind)) || !Array.isArray(v.selectionModes) || !v.selectionModes.length || new Set(v.selectionModes).size !== v.selectionModes.length || v.selectionModes.some((m) => !["single", "collection"].includes(m)))
      return invalid("标记输入类型或选择模式无效。");
    if (v.categorySelection !== void 0 && (v.categorySelection !== "single" || !v.selectionModes.includes("collection")))
      return invalid("单分类约束只允许集合输入。");
    return {
      id,
      eventKind: v.eventKind,
      selectionModes: [...v.selectionModes],
      ...v.categorySelection === "single" ? { categorySelection: "single" } : {}
    };
  });
}
function validateMarkerDefinitions(input, contracts) {
  if (!contracts) {
    if (input !== void 0) invalid("算法未声明标记输入。");
    return void 0;
  }
  if (!Array.isArray(input) || input.length !== contracts.length) return invalid("元素标记输入定义不完整。");
  return contracts.map((contract, index) => {
    const v = record(input[index], "元素标记输入");
    keys(v, ["id", "eventKind", "selectionModes", "label"], ["categorySelection"]);
    const entry = validateMarkerInputs([
      {
        id: v.id,
        eventKind: v.eventKind,
        selectionModes: v.selectionModes,
        ...v.categorySelection !== void 0 ? { categorySelection: v.categorySelection } : {}
      }
    ])[0];
    if (entry.id !== contract.id || entry.eventKind !== contract.eventKind || contract.categorySelection === "single" && entry.categorySelection !== "single" || entry.selectionModes.some((m) => !contract.selectionModes.includes(m)))
      return invalid("元素标记输入超出算法声明。");
    return { ...entry, label: text(v.label, "标记输入标签") };
  });
}
function validateMarkerBindings(input, inputs, timingInput, editor, packageOnly = false) {
  const selected = inputs?.filter((i) => i.id !== timingInput) ?? [];
  if (!selected.length) {
    if (input !== void 0) invalid("此元素不接受独立标记绑定。");
    return void 0;
  }
  const value = record(input, "标记绑定");
  keys(
    value,
    selected.map((i) => i.id)
  );
  return Object.fromEntries(
    selected.map((descriptor) => {
      const v = record(value[descriptor.id], "标记绑定");
      if (v.kind === "unbound") {
        keys(v, ["kind"]);
        return [descriptor.id, { kind: "unbound" }];
      }
      if (packageOnly) return invalid("资源包不能保存实际工程的标记引用。");
      if (!descriptor.selectionModes.includes(v.kind))
        return invalid("标记选择模式不受支持。");
      text(v.laneId, "标记轨道");
      return invalid("标记轨道缺失或类型不匹配：" + descriptor.label);
    })
  );
}

const identifier = (value) => {
  const id = text(value, "算法标识");
  if (!/^[a-zA-Z_][a-zA-Z0-9_.-]*$/.test(id) || ["__proto__", "prototype", "constructor"].includes(id))
    invalid("算法标识无效。");
  return id;
};
const list = (value, allowed) => {
  if (!Array.isArray(value) || new Set(value).size !== value.length) return invalid("算法能力列表无效。");
  return value.map((v) => {
    const id = identifier(v);
    if (allowed && !allowed.includes(id)) invalid("算法声明了不支持的能力。");
    return id;
  });
};
function range(input) {
  const v = record(input, "算法参数范围");
  keys(v, ["min", "max"], ["integer", "editingPrecision"]);
  if (finite(v.min, "min") > finite(v.max, "max")) invalid("算法参数范围无效。");
  if (v.integer !== void 0 && typeof v.integer !== "boolean") invalid("算法整数声明无效。");
  if (v.editingPrecision !== void 0 && (!Number.isInteger(v.editingPrecision) || Number(v.editingPrecision) < 0 || Number(v.editingPrecision) > 100))
    invalid("算法编辑精度无效。");
}
function parameter$1(input) {
  const v = record(input, "算法参数");
  keys(
    v,
    ["id", "valueKind", "allowedSourceKinds"],
    ["range", "vectorElementRange", "allowEmptyVector", "allowedAnalysisComponents", "allowedAnalysisProjections"]
  );
  identifier(v.id);
  if (!["number", "boolean", "color", "vector"].includes(String(v.valueKind))) invalid("算法参数类型无效。");
  if (!list(v.allowedSourceKinds, ["constant", "analysis", "native"]).length) invalid("算法缺少输入能力。");
  if (v.range !== void 0) {
    if (v.valueKind !== "number") invalid("仅数值参数支持范围。");
    range(v.range);
  }
  if (v.vectorElementRange !== void 0) {
    if (v.valueKind !== "vector") invalid("仅向量支持分量范围。");
    range(v.vectorElementRange);
  }
  if (v.allowEmptyVector !== void 0 && (v.valueKind !== "vector" || typeof v.allowEmptyVector !== "boolean"))
    invalid("算法向量声明无效。");
  if (v.allowedAnalysisComponents !== void 0)
    list(v.allowedAnalysisComponents, ["default", "total", "specific", "real", "imag", "magnitude", "phase"]);
  if (v.allowedAnalysisProjections !== void 0)
    list(v.allowedAnalysisProjections, ["scalar", "mean", "max", "peak", "bin", "band", "full"]);
  return structuredClone(v);
}
function validateAlgorithmContract(input, apiVersion = 1) {
  const v = record(input, "算法契约");
  keys(
    v,
    ["kind", "parameters", "sharedParameters", "historyParameters"],
    apiVersion === 3 ? ["inputParameter", "markerInputs", "timingInput", "mediaInputs", "executionModes"] : apiVersion === 2 ? ["inputParameter", "markerInputs", "timingInput"] : ["inputParameter"]
  );
  if (!["visual", "modifier", "transition"].includes(String(v.kind)) || !Array.isArray(v.parameters))
    return invalid("算法种类或参数无效。");
  const parameters = v.parameters.map(parameter$1), ids = parameters.map((p) => p.id);
  if (new Set(ids).size !== ids.length) invalid("算法参数重复。");
  if (v.inputParameter !== void 0 && !ids.includes(identifier(v.inputParameter))) invalid("算法输入参数不存在。");
  const sharedParameters = list(v.sharedParameters, ids), historyParameters = list(v.historyParameters, ids);
  if (sharedParameters.some((id) => parameters.find((p) => p.id === id)?.valueKind !== "number"))
    invalid("共同处理参数必须为数值。");
  const markerInputs = apiVersion === 2 || apiVersion === 3 && v.markerInputs !== void 0 ? validateMarkerInputs(v.markerInputs) : void 0;
  const mediaInputs = apiVersion === 3 ? validateMediaInputs(v.mediaInputs) : void 0;
  const executionModes = apiVersion === 3 ? list(v.executionModes, ["timeline", "realtime"]) : void 0;
  if (executionModes && !executionModes.length) invalid("ABI 3 必须声明执行模式。");
  let timingInput;
  if (v.timingInput !== void 0) {
    timingInput = identifier(v.timingInput);
    const marker = markerInputs?.find((i) => i.id === timingInput);
    if (v.kind !== "transition" || !marker || marker.eventKind !== "range" || marker.selectionModes.length !== 1 || marker.selectionModes[0] !== "single")
      invalid("转场时间输入必须声明单个范围。");
  }
  return {
    kind: v.kind,
    parameters,
    sharedParameters,
    historyParameters,
    ...v.inputParameter !== void 0 ? { inputParameter: String(v.inputParameter) } : {},
    ...markerInputs ? { markerInputs } : {},
    ...timingInput ? { timingInput } : {},
    ...mediaInputs ? { mediaInputs } : {},
    ...executionModes ? { executionModes } : {}
  };
}
function validateShaderProgram(input) {
  const v = record(input, "Shader");
  keys(v, ["vertex", "fragment", "geometry", "uniforms"]);
  text(v.vertex, "vertex");
  text(v.fragment, "fragment");
  if (!["quad", "triangles"].includes(String(v.geometry))) invalid("Shader 几何类型无效。");
  const uniforms = record(v.uniforms, "uniforms");
  for (const [name, raw] of Object.entries(uniforms)) {
    identifier(name);
    const u = record(raw, "uniform");
    keys(u, ["type"], ["length", "inputId", "slot"]);
    if (!["number", "int", "boolean", "color", "vec2", "vec3", "array", "source", "media"].includes(String(u.type)))
      invalid("uniform 类型无效。");
    if (u.type === "media") {
      identifier(u.inputId);
      if (!["current", "next"].includes(String(u.slot))) invalid("媒体纹理 slot 无效。");
    } else if (u.inputId !== void 0 || u.slot !== void 0) invalid("仅媒体纹理声明媒体输入。");
    if (u.type === "array") {
      const length = integer(u.length, "uniform length");
      if (length < 1 || length > 65536) invalid("uniform 数组长度无效。");
    } else if (u.length !== void 0) invalid("仅数组 uniform 支持长度。");
  }
  return structuredClone(v);
}
function validateAlgorithmDefinition(input) {
  const v = record(input, "算法定义");
  keys(v, ["id", "version", "hash", "apiVersion", "contract", "source", "programs"]);
  const id = text(v.id, "算法 ID"), version = integer(v.version, "算法版本");
  if (!/^[a-z0-9][a-z0-9._-]*$/.test(id) || version < 1 || !Number.isSafeInteger(version)) invalid("算法身份无效。");
  if (v.apiVersion !== 1 && v.apiVersion !== 2 && v.apiVersion !== 3) invalid("算法 ABI 不受支持。");
  if (typeof v.hash !== "string" || !/^[a-f0-9]{64}$/.test(v.hash) || resourceHash(v) !== v.hash)
    invalid("算法内容与 SHA-256 不匹配。");
  const contract = validateAlgorithmContract(v.contract, v.apiVersion), programs = {};
  for (const [name, program] of Object.entries(record(v.programs, "programs")))
    Object.defineProperty(programs, identifier(name), { value: validateShaderProgram(program), enumerable: true });
  for (const program of Object.values(programs))
    for (const u of Object.values(program.uniforms))
      if (u.type === "media" && (v.apiVersion !== 3 || !contract.mediaInputs?.some((i) => i.id === u.inputId)))
        invalid("媒体纹理未获声明授权。");
  if (!Object.keys(programs).length) invalid("算法缺少 Shader。");
  return {
    id,
    version,
    hash: String(v.hash),
    apiVersion: v.apiVersion,
    contract,
    source: text(v.source, "算法源码"),
    programs
  };
}

function validateElementBinding(input, p) {
  const b = record(input, "binding"), source = record(b.source, "source");
  if (source.kind === "unbound") {
    keys(b, ["parameterId", "source"]);
    keys(source, ["kind"]);
    if (b.parameterId !== p.id || !p.allowedSourceKinds.includes("analysis"))
      return invalid("此参数不能处于未绑定状态。");
    return { parameterId: p.id, source: { kind: "unbound" } };
  }
  if (source.kind === "native") {
    keys(b, ["parameterId", "source"]);
    keys(source, ["kind", "featureId"]);
    if (b.parameterId !== p.id || p.valueKind !== "vector" || !p.allowedSourceKinds.includes("native") || source.featureId !== "frequency" && source.featureId !== "waveform")
      return invalid("原生输入特征或参数无效。");
    return {
      parameterId: p.id,
      source: { kind: "native", featureId: source.featureId }
    };
  }
  if (source.kind !== "constant" && source.kind !== "analysis")
    return invalid("只支持固定值、原曲 Analyzer 或原生输入。");
  return canonicalBinding(b, p, void 0, "binding");
}
function validateElementBindings(input, parameters) {
  if (!Array.isArray(input) || input.length !== parameters.length) return invalid("元素参数不完整。");
  return parameters.map((parameter, index) => validateElementBinding(input[index], parameter));
}

function findResource(entries, id) {
  const found = typeof id === "string" ? entries.find((e) => resourceKey(e) === id) ?? entries.filter((e) => e.id === id).sort((a, b) => b.version - a.version)[0] : entries.find((e) => sameResource(e, id));
  if (!found) throw Error("资源不存在或版本缺失：" + (typeof id === "string" ? id : resourceKey(id)));
  return found;
}

const analysisComponentsForFeature = (featureId) => {
  const shape = FEATURE_REGISTRY[featureId].outputShape;
  if (shape === "loudness-structure") return ["total", "specific"];
  if (shape === "complex-spectrum") {
    return ["real", "imag", "magnitude", "phase"];
  }
  return ["default"];
};
const analysisComponentIsVector = (featureId, component) => {
  const shape = FEATURE_REGISTRY[featureId].outputShape;
  if (shape === "scalar") return false;
  if (shape === "loudness-structure") return component === "specific";
  return true;
};
const compatibleAnalysisFeatures = (parameter) => FEATURE_IDS.filter((featureId) => {
  const components = analysisComponentsForFeature(featureId);
  return components.some((component) => {
    if (!parameter.allowedAnalysisComponents?.includes(component)) return false;
    const vector = analysisComponentIsVector(featureId, component);
    if (parameter.valueKind === "vector") {
      return vector && (parameter.allowedAnalysisProjections?.includes("full") ?? false);
    }
    if (parameter.valueKind !== "number") return false;
    return parameter.allowedAnalysisProjections?.some((kind) => vector ? kind !== "scalar" && kind !== "full" : kind === "scalar") ?? false;
  });
});
const compatibleAnalysisProjections = (parameter, featureId, component) => {
  const vector = analysisComponentIsVector(featureId, component);
  return (parameter.allowedAnalysisProjections ?? []).filter((kind) => {
    if (parameter.valueKind === "vector") return vector && kind === "full";
    if (parameter.valueKind !== "number") return false;
    return vector ? kind !== "scalar" && kind !== "full" : kind === "scalar";
  });
};
const createProjection = (kind) => {
  if (kind === "bin") return { kind, index: 0 };
  if (kind === "band") return { kind, start: 0, end: 1 };
  return { kind };
};
const defaultAnalysisSelection = (parameter, featureId) => {
  const components = analysisComponentsForFeature(featureId).filter(
    (component2) => parameter.allowedAnalysisComponents?.includes(component2)
  );
  const component = components.find((entry) => parameter.valueKind === "vector" ? analysisComponentIsVector(featureId, entry) : !analysisComponentIsVector(featureId, entry)) ?? components[0];
  if (!component) throw new Error("该特征没有兼容的分析分量。");
  const projections = compatibleAnalysisProjections(
    parameter,
    featureId,
    component
  );
  const preferred = projections.includes("mean") ? "mean" : projections[0];
  if (!preferred) throw new Error("该参数没有兼容的分析投影。");
  return { component, projection: createProjection(preferred) };
};
const defaultNumericTransform = (parameter, featureId) => {
  if (parameter.valueKind !== "number" || !parameter.range) {
    throw new Error("只有数值参数可以建立数值映射。");
  }
  const featureRange = featureId ? FEATURE_REGISTRY[featureId].range : void 0;
  const finiteRegistryRange = Number.isFinite(featureRange?.min) && Number.isFinite(featureRange?.max) && (featureRange?.max ?? 0) > (featureRange?.min ?? 0);
  return {
    inputMin: finiteRegistryRange ? featureRange.min : 0,
    inputMax: finiteRegistryRange ? featureRange.max : 1,
    outputMin: typeof parameter.defaultValue === "number" ? parameter.defaultValue : parameter.range.min,
    outputMax: parameter.range.max,
    clamp: true,
    invert: false,
    attackSeconds: 0,
    releaseSeconds: 0
  };
};
const createDefaultAnalysisBinding = (parameter, featureId) => {
  const selection = defaultAnalysisSelection(parameter, featureId);
  return {
    parameterId: parameter.id,
    source: {
      kind: "analysis",
      featureId,
      ...selection.component === "default" ? {} : { component: selection.component },
      projection: selection.projection
    },
    ...parameter.valueKind === "number" ? { transform: defaultNumericTransform(parameter, featureId) } : {}
  };
};

const transformFields = [
  "inputMin",
  "inputMax",
  "outputMin",
  "outputMax",
  "clamp",
  "invert",
  "attackSeconds",
  "releaseSeconds"
];
function controlBinding(control, binding, value, definition, algorithms) {
  const parameter = definition.parameters.find((p) => p.id === control.parameterId);
  if (!parameter) return invalid("共同参数不存在。");
  const kernel = findResource(algorithms, definition.algorithm).contract;
  let candidate;
  if (control.kind === "value") {
    if (!kernel.sharedParameters.includes(parameter.id) || parameter.valueKind !== "number")
      return invalid("样式参数不能作为预设共同参数。");
    candidate = { parameterId: parameter.id, source: { kind: "constant", value } };
  } else if (control.kind === "binding") {
    if (kernel.inputParameter !== parameter.id) return invalid("共同输入必须是内核声明的数据输入。");
    const v = record(value, "共同输入");
    keys(v, ["source"], ["transform"]);
    candidate = { parameterId: parameter.id, ...v };
  } else {
    if (kernel.inputParameter !== parameter.id || parameter.valueKind !== "number" || binding.source.kind !== "analysis" || !control.field || !transformFields.includes(control.field))
      return invalid("共同映射字段不可用。");
    candidate = {
      ...binding,
      transform: {
        ...binding.transform ?? defaultNumericTransform(parameter, binding.source.featureId),
        [control.field]: value
      }
    };
  }
  return validateElementBinding(candidate, parameter);
}
function commonValue(control, binding, definition) {
  if (control.kind === "value") return binding.source.kind === "constant" ? binding.source.value : null;
  if (control.kind === "binding") {
    const { parameterId: _parameterId, ...value } = binding;
    return value;
  }
  const parameter = definition.parameters.find((p) => p.id === binding.parameterId);
  return binding.source.kind === "analysis" ? (binding.transform ?? defaultNumericTransform(parameter, binding.source.featureId))[control.field] : null;
}
function validateCommonControls(input, targets, algorithms) {
  if (!Array.isArray(input)) return invalid("共同参数必须为列表。");
  const ids = /* @__PURE__ */ new Set(), owned = /* @__PURE__ */ new Set();
  return input.map((entry) => {
    const c = record(entry, "共同参数");
    keys(c, ["id", "label", "kind", "parameterId", "targets", "value"], ["field"]);
    if (!["value", "binding", "transform"].includes(String(c.kind))) return invalid("共同参数类型无效。");
    const id = text(c.id, "共同参数 ID");
    if (ids.has(id)) return invalid("共同参数 ID 重复。");
    ids.add(id);
    if (!Array.isArray(c.targets) || !c.targets.length || c.targets.some((t) => typeof t !== "string") || new Set(c.targets).size !== c.targets.length)
      return invalid("共同参数目标无效。");
    if (c.kind === "transform" ? !transformFields.includes(c.field) : c.field !== void 0)
      return invalid("共同参数字段无效。");
    const control = {
      id,
      label: text(c.label, "共同参数名称"),
      kind: c.kind,
      parameterId: text(c.parameterId, "parameterId"),
      targets: [...c.targets],
      value: structuredClone(c.value),
      ...c.field ? { field: c.field } : {}
    };
    for (const target of control.targets) {
      const t = targets.get(target), binding = t?.bindings.find((b) => b.parameterId === control.parameterId);
      if (!t || !binding) return invalid("共同参数引用了不存在的子元素或参数。");
      const bindingKey = target + ":" + control.parameterId;
      const key = bindingKey + ":" + (control.kind === "transform" ? control.field : "*");
      if (owned.has(key) || owned.has(bindingKey + ":*") || control.kind !== "transform" && [...owned].some((key2) => key2.startsWith(bindingKey + ":")))
        return invalid("共同参数不能重叠控制同一字段。");
      owned.add(key);
      const parameter = t.definition.parameters.find((p) => p.id === control.parameterId);
      const probe = control.kind === "transform" && binding.source.kind !== "analysis" ? createDefaultAnalysisBinding(
        parameter,
        compatibleAnalysisFeatures(parameter)[0]
      ) : binding;
      controlBinding(control, probe, control.value, t.definition, algorithms);
    }
    return control;
  });
}

const roundEditingValue = (value, precision) => Number(value.toFixed(precision));

const icons = [
  "square",
  "strings",
  "dots",
  "rings",
  "radial",
  "orbit",
  "wireform",
  "arcs",
  "tunnel",
  "stars",
  "scale",
  "blur",
  "fade"
];
const name = (input) => {
  const value = text(input, "资源 ID");
  if (!/^[a-z0-9][a-z0-9._-]*$/.test(value)) return invalid("资源 ID 格式无效。");
  return value;
};
const version = (input) => {
  const value = integer(input, "资源版本");
  if (value < 1 || !Number.isSafeInteger(value)) return invalid("资源版本无效。");
  return value;
};
function validateResourceRef(input) {
  const v = record(input, "资源引用");
  keys(v, ["id", "version", "hash"]);
  if (typeof v.hash !== "string" || !/^[a-f0-9]{64}$/.test(v.hash)) return invalid("资源 SHA-256 无效。");
  return { id: name(v.id), version: version(v.version), hash: v.hash };
}
function identity(v) {
  const ref = validateResourceRef({ id: v.id, version: v.version, hash: v.hash });
  if (resourceHash(v) !== ref.hash) return invalid("资源内容与 SHA-256 不匹配。");
  return ref;
}
function assertDefaultPrecision(value, parameter2) {
  if (parameter2.valueKind === "number" && typeof value === "number" && roundEditingValue(value, parameter2.range?.editingPrecision ?? (parameter2.range?.integer ? 0 : 2)) !== value)
    return invalid("资源默认常量须遵守声明的编辑精度。");
}
function parameter(input, contract) {
  const v = record(input, "参数定义");
  keys(
    v,
    ["id", "label", "valueKind", "defaultValue", "allowedSourceKinds"],
    [
      "range",
      "vectorElementRange",
      "allowEmptyVector",
      "allowedAnalysisComponents",
      "allowedAnalysisProjections",
      "defaultBinding"
    ]
  );
  if (v.id !== contract.id || v.valueKind !== contract.valueKind) return invalid("参数与绘制内核不匹配。");
  text(v.label, "参数标签");
  for (const field of ["allowedSourceKinds", "allowedAnalysisComponents", "allowedAnalysisProjections"]) {
    const values = v[field], allowed = contract[field];
    if (values === void 0 && allowed === void 0) continue;
    if (!Array.isArray(values) || !values.length || !allowed || new Set(values).size !== values.length || values.some((value) => !allowed.includes(value)))
      return invalid("参数声明了内核不支持的输入能力。");
  }
  for (const field of ["range", "vectorElementRange"]) {
    const permitted = contract[field];
    if (!permitted) {
      if (v[field] !== void 0) return invalid("内核未声明此参数范围。");
      continue;
    }
    const range = record(v[field], field);
    keys(range, ["min", "max"], ["integer", "editingPrecision"]);
    const min = finite(range.min, "min"), max = finite(range.max, "max");
    if (min < permitted.min || max > permitted.max || min > max || range.integer !== permitted.integer)
      return invalid("参数范围超出内核约束。");
    if (range.editingPrecision !== void 0 && (!Number.isInteger(range.editingPrecision) || Number(range.editingPrecision) < 0 || Number(range.editingPrecision) > 100))
      return invalid("参数编辑精度无效。");
  }
  if (v.allowEmptyVector !== contract.allowEmptyVector) return invalid("向量约束与内核不符。");
  const result = structuredClone(v);
  assertDefaultPrecision(result.defaultValue, result);
  validateElementBinding(
    { parameterId: result.id, source: { kind: "constant", value: result.defaultValue } },
    { ...result, allowedSourceKinds: ["constant"] }
  );
  if (v.defaultBinding !== void 0) {
    const binding = record(v.defaultBinding, "默认绑定");
    keys(binding, ["source"], ["transform"]);
    const validated = validateElementBinding({ parameterId: result.id, ...binding }, result);
    if (validated.source.kind === "constant") assertDefaultPrecision(validated.source.value, result);
  }
  return result;
}
function elementDefinition(input, algorithms) {
  const v = record(input, "元素定义");
  keys(
    v,
    ["id", "version", "hash", "algorithm", "kind", "title", "icon", "parameters"],
    ["inputParameter", "markerInputs", "usesSeed", "mediaInputs"]
  );
  const ref = identity(v);
  if (v.usesSeed !== void 0 && v.usesSeed !== true) return invalid("Seed 能力声明必须为 true 或省略。");
  const algorithm = validateResourceRef(v.algorithm), definition = algorithms.find((a) => sameResource(a, algorithm));
  if (!definition) return invalid("绘制算法依赖缺失。");
  const kernel = definition.contract;
  if (v.kind !== kernel.kind || v.inputParameter !== kernel.inputParameter || !icons.includes(String(v.icon)))
    return invalid("元素种类、输入或图标无效。");
  if (!Array.isArray(v.parameters) || v.parameters.length !== kernel.parameters.length)
    return invalid("元素参数定义不完整。");
  const mediaInputs = validateMediaDefinitions(v.mediaInputs, kernel.mediaInputs);
  const markerInputs = validateMarkerDefinitions(v.markerInputs, kernel.markerInputs);
  return {
    ...ref,
    algorithm,
    ...v.usesSeed === true ? { usesSeed: true } : {},
    kind: kernel.kind,
    title: text(v.title, "元素名称"),
    icon: String(v.icon),
    ...kernel.inputParameter ? { inputParameter: kernel.inputParameter } : {},
    parameters: kernel.parameters.map((p, i) => parameter(v.parameters[i], p)),
    ...markerInputs ? { markerInputs } : {},
    ...mediaInputs ? { mediaInputs } : {}
  };
}
function mergeResources(...snapshots) {
  const result = { algorithms: [], elements: [], presets: [] };
  for (const field of ["algorithms", "elements", "presets"]) {
    const entries = /* @__PURE__ */ new Map();
    for (const snapshot of snapshots)
      for (const definition of snapshot[field]) {
        const key = definition.id + "@" + definition.version, existing = entries.get(key);
        if (existing && !sameResource(existing, definition))
          return invalid("同一资源 ID 与版本对应了不同内容。");
        entries.set(key, definition);
      }
    Object.assign(result, { [field]: [...entries.values()] });
  }
  return result;
}
function presetDefinition(input, elements, algorithms) {
  const v = record(input, "预设定义");
  keys(v, ["id", "version", "hash", "title", "description", "preview", "elements", "controls"]);
  const ref = identity(v);
  if (!["geometric", "cinematic"].includes(String(v.preview))) return invalid("预设预览类型无效。");
  if (!Array.isArray(v.elements) || !v.elements.length) return invalid("预设至少包含一个元素。");
  const targets = /* @__PURE__ */ new Map();
  const templates = v.elements.map((input2) => {
    const e = record(input2, "预设子元素");
    keys(
      e,
      ["key", "element", "name", "enabled", "bindings", "timing"],
      ["targets", "markerBindings", "mediaBindings"]
    );
    const key = name(e.key), element = validateResourceRef(e.element), definition = elements.find((d) => sameResource(d, element));
    if (!definition) return invalid("预设缺少精确版本的元素依赖：" + resourceKey(element));
    if (targets.has(key) || typeof e.enabled !== "boolean") return invalid("预设子元素 key 或启用状态无效。");
    const bindings = validateElementBindings(e.bindings, definition.parameters);
    const mediaBindings = validateMediaBindings(e.mediaBindings, definition.mediaInputs, [], true);
    const markerBindings = validateMarkerBindings(
      e.markerBindings,
      definition.markerInputs,
      algorithms.find((a) => sameResource(a, definition.algorithm)).contract.timingInput,
      void 0,
      true
    );
    for (const [index, binding] of bindings.entries())
      if (binding.source.kind === "constant")
        assertDefaultPrecision(binding.source.value, definition.parameters[index]);
    targets.set(key, { definition, bindings });
    const t = record(e.timing, "预设时间");
    if (definition.kind === "transition") {
      keys(t, ["kind"]);
      if (t.kind !== "unbound") return invalid("预设转场须待选择范围。");
    } else {
      keys(t, ["kind", "start", "end"]);
      if (t.kind !== "relative" || finite(t.start, "start") < 0 || finite(t.end, "end") > 1 || Number(t.start) >= Number(t.end))
        return invalid("预设相对时间无效。");
    }
    return {
      key,
      element,
      name: text(e.name, "子元素名称"),
      enabled: e.enabled,
      bindings,
      ...markerBindings ? { markerBindings } : {},
      ...mediaBindings ? { mediaBindings } : {},
      timing: structuredClone(t),
      ...e.targets !== void 0 ? { targets: structuredClone(e.targets) } : {}
    };
  });
  for (const e of templates) {
    const definition = targets.get(e.key).definition;
    if (definition.kind === "visual") {
      if (e.targets !== void 0) return invalid("视觉元素不能声明效果目标。");
      continue;
    }
    const target = record(e.targets, "预设效果目标");
    if (target.kind === "composition") keys(target, ["kind"]);
    else {
      keys(target, ["kind", "ids"]);
      if (target.kind !== "elements" || !Array.isArray(target.ids) || new Set(target.ids).size !== target.ids.length || target.ids.some((id) => targets.get(String(id))?.definition.kind !== "visual"))
        return invalid("预设内部效果引用无效。");
    }
  }
  const controls = validateCommonControls(v.controls, targets, algorithms);
  for (const control of controls)
    for (const key of control.targets) {
      const t = targets.get(key);
      if (canonicalJson(
        commonValue(
          control,
          t.bindings.find((b) => b.parameterId === control.parameterId),
          t.definition
        )
      ) !== canonicalJson(control.value))
        return invalid("预设共同值与默认子元素配置不一致。");
    }
  const features = new Set(
    templates.flatMap((e) => e.bindings.flatMap((b) => b.source.kind === "analysis" ? [b.source.featureId] : []))
  );
  if (features.size > 4) return invalid("一个预设最多使用四个不同的 Analyzer 特征。");
  return {
    ...ref,
    title: text(v.title, "预设名称"),
    description: text(v.description, "预设说明"),
    preview: v.preview,
    elements: templates,
    controls
  };
}
function validateResourceSnapshot(input, base = { algorithms: [], elements: [], presets: [] }) {
  const v = record(input, "资源快照");
  keys(v, ["algorithms", "elements", "presets"]);
  if (!Array.isArray(v.elements) || !Array.isArray(v.presets)) return invalid("资源定义必须为列表。");
  if (!Array.isArray(v.algorithms)) return invalid("算法定义必须为列表。");
  const algorithms = v.algorithms.map(validateAlgorithmDefinition);
  const combined = mergeResources(base, { algorithms, elements: [], presets: [] });
  const elements = v.elements.map((e) => elementDefinition(e, combined.algorithms));
  const all = mergeResources(combined, { algorithms: [], elements, presets: [] });
  const presets = v.presets.map((p) => presetDefinition(p, all.elements, all.algorithms));
  mergeResources(all, { algorithms: [], elements: [], presets });
  return { algorithms, elements, presets };
}
function validateResourcePackage(input, base) {
  const v = record(input, "资源包");
  keys(v, ["format", "schemaVersion", "id", "version", "algorithms", "elements", "presets"]);
  if (v.format !== "audiosurf-visualizer-resource" || v.schemaVersion !== 2)
    return invalid("资源包格式或版本不支持。");
  const snapshot = validateResourceSnapshot(
    { algorithms: v.algorithms, elements: v.elements, presets: v.presets },
    base
  );
  if (!snapshot.elements.length && !snapshot.presets.length) return invalid("资源包不能为空。");
  return {
    format: "audiosurf-visualizer-resource",
    schemaVersion: 2,
    id: name(v.id),
    version: version(v.version),
    ...snapshot
  };
}
const decodeResourcePackage = (bytes, base) => validateResourcePackage(JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes)), base);
const resourceFileFormat = { extension: ".json", mimeType: "application/json" };

export { decodeResourcePackage, mergeResources, resourceFileFormat, validateResourcePackage, validateResourceRef, validateResourceSnapshot };
