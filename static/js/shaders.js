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

// フラグメントシェーダー：流動的な金属エフェクトを実装
const fragmentShaderSource = `
    precision highp float;

    varying vec2 vTextureCoord;
    uniform float uTime;
    uniform float uSpeed;
    uniform float uColorIntensity;

    // メタボールの影響を計算する関数
    float metaball(vec2 p, vec2 center, float radius) {
        float r = length(p - center);
        return radius / (r * r);
    }

    // フレネル効果を計算する関数
    float fresnel(float value, float power) {
        return pow(clamp(1.0 - value, 0.0, 1.0), power);
    }

    // ノイズ関数
    float noise(vec2 p) {
        return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
    }

    void main() {
        vec2 uv = vTextureCoord;
        float t = uTime * uSpeed;

        // より大きな波のような動きを生成
        float wave = sin(uv.x * 3.0 + t) * cos(uv.y * 2.0 - t * 1.5) * 0.1;
        uv += wave;

        // メタボールの中心位置を計算（より大きな動き）
        vec2 center1 = vec2(0.5 + 0.3 * sin(t * 0.4), 0.5 + 0.3 * cos(t * 0.5));
        vec2 center2 = vec2(0.5 + 0.35 * cos(t * 0.3), 0.5 + 0.35 * sin(t * 0.6));
        vec2 center3 = vec2(0.5 + 0.25 * sin(t * 0.7), 0.5 + 0.25 * cos(t * 0.4));
        vec2 center4 = vec2(0.5 + 0.4 * cos(t * 0.2), 0.5 + 0.4 * sin(t * 0.3));

        // メタボールの合成値を計算（より強い影響）
        float m1 = metaball(uv, center1, 0.15);
        float m2 = metaball(uv, center2, 0.12);
        float m3 = metaball(uv, center3, 0.14);
        float m4 = metaball(uv, center4, 0.13);

        float metaballValue = m1 + m2 + m3 + m4;

        // メタボールの形状を定義（よりスムーズな変化）
        float threshold = smoothstep(1.0, 2.5, metaballValue);

        // 金属的な色の定義
        vec3 metalColor1 = vec3(0.9, 0.95, 1.0);    // より明るい青白い金属色
        vec3 metalColor2 = vec3(0.6, 0.7, 0.9);     // より深い青みの金属色
        vec3 reflectionColor = vec3(0.98, 0.99, 1.0); // 純白に近い反射色

        // フレネル効果の計算（より強い効果）
        float fresnel = fresnel(threshold, 4.0);

        // 動的な環境光の反射を計算
        float envReflection = 
            sin(uv.x * 8.0 + t) * sin(uv.y * 8.0 + t * 0.7) * 0.5 +
            cos(uv.x * 6.0 - t * 0.5) * cos(uv.y * 6.0 + t * 0.6) * 0.3 +
            sin(uv.x * 4.0 + t * 0.3) * sin(uv.y * 4.0 - t * 0.4) * 0.2;
        envReflection = pow(envReflection * 0.5 + 0.5, 2.0);

        // ノイズパターンを追加して細かな質感を表現
        float noisePattern = noise(uv * 10.0 + t * 0.1) * 0.1;

        // 金属的な質感の合成
        vec3 baseColor = mix(metalColor2, metalColor1, threshold + noisePattern);
        vec3 finalColor = mix(baseColor, reflectionColor, fresnel * envReflection);

        // Color Intensityによる金属感の調整
        float metallic = mix(0.6, 1.2, uColorIntensity);
        finalColor *= metallic;

        // 動的なハイライトの追加
        float highlight = pow(metaballValue, 3.0) * (1.0 + sin(t) * 0.2);
        finalColor += reflectionColor * highlight * uColorIntensity;

        // 青みがかった反射の動的な追加
        float blueReflection = sin(uv.x * 12.0 + t) * sin(uv.y * 12.0 - t * 0.8) * 0.5 + 0.5;
        finalColor += vec3(0.2, 0.4, 0.6) * blueReflection * threshold * uColorIntensity;

        // 最終的な色を出力
        gl_FragColor = vec4(finalColor, 1.0);
    }
`;