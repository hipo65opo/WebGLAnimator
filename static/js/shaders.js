// 頂点シェーダー：頂点の位置と質感座標を処理
const vertexShaderSource = `
    attribute vec4 aVertexPosition;
    attribute vec2 aTextureCoord;
    varying vec2 vTextureCoord;

    void main() {
        gl_Position = aVertexPosition;
        vTextureCoord = aTextureCoord;
    }
`;

// フラグメントシェーダー：メタボールエフェクトを実装
const fragmentShaderSource = `
    precision highp float;

    varying vec2 vTextureCoord;
    uniform float uTime;
    uniform float uSpeed;
    uniform float uColorIntensity;

    // メタボールの影響を計算する関数
    float metaball(vec2 p, vec2 center, float radius) {
        float r = length(p - center);
        return radius / r;
    }

    void main() {
        vec2 uv = vTextureCoord;
        float t = uTime * uSpeed;

        // 4つのメタボールの中心位置を計算
        vec2 center1 = vec2(0.5 + 0.2 * cos(t * 0.5), 0.5 + 0.2 * sin(t * 0.7));
        vec2 center2 = vec2(0.5 + 0.2 * cos(t * 0.8 + 2.0), 0.5 + 0.2 * sin(t * 0.6 + 1.0));
        vec2 center3 = vec2(0.5 + 0.2 * sin(t * 0.7 + 4.0), 0.5 + 0.2 * cos(t * 0.9 + 3.0));
        vec2 center4 = vec2(0.5 + 0.15 * sin(t * 0.5 + 1.5), 0.5 + 0.15 * cos(t * 0.8 + 2.5));

        // メタボールの合成値を計算
        float m1 = metaball(uv, center1, 0.1);
        float m2 = metaball(uv, center2, 0.08);
        float m3 = metaball(uv, center3, 0.09);
        float m4 = metaball(uv, center4, 0.07);

        // メタボールの値を合成
        float metaballValue = m1 + m2 + m3 + m4;

        // しきい値でメタボールの形状を定義
        float threshold = smoothstep(0.8, 2.0, metaballValue);

        // メタボールの色を設定
        vec3 baseColor = vec3(0.3, 0.6, 1.0);  // 基本色（青みがかった色）
        vec3 glowColor = vec3(0.8, 0.9, 1.0);  // 光る部分の色

        // メタボールの内側と外側の色を補間
        vec3 finalColor = mix(
            baseColor,
            glowColor,
            smoothstep(0.8, 2.0, metaballValue)
        );

        // 色の強度を調整
        finalColor = mix(vec3(0.0), finalColor, uColorIntensity);

        // 最終的な色を出力
        gl_FragColor = vec4(finalColor * threshold, threshold);
    }
`;