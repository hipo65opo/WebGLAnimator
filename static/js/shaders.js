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

// フラグメントシェーダー：金属的なメタボールエフェクトを実装
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

    // フレネル効果を計算する関数
    float fresnel(float value, float power) {
        return pow(clamp(1.0 - value, 0.0, 1.0), power);
    }

    void main() {
        vec2 uv = vTextureCoord;
        float t = uTime * uSpeed;

        // メタボールの中心位置を計算
        vec2 center1 = vec2(0.5 + 0.2 * cos(t * 0.5), 0.5 + 0.2 * sin(t * 0.7));
        vec2 center2 = vec2(0.5 + 0.2 * cos(t * 0.8 + 2.0), 0.5 + 0.2 * sin(t * 0.6 + 1.0));
        vec2 center3 = vec2(0.5 + 0.2 * sin(t * 0.7 + 4.0), 0.5 + 0.2 * cos(t * 0.9 + 3.0));
        vec2 center4 = vec2(0.5 + 0.15 * sin(t * 0.5 + 1.5), 0.5 + 0.15 * cos(t * 0.8 + 2.5));

        // メタボールの合成値を計算
        float m1 = metaball(uv, center1, 0.1);
        float m2 = metaball(uv, center2, 0.08);
        float m3 = metaball(uv, center3, 0.09);
        float m4 = metaball(uv, center4, 0.07);

        float metaballValue = m1 + m2 + m3 + m4;

        // メタボールの形状を定義
        float threshold = smoothstep(0.8, 2.0, metaballValue);

        // 金属的な色の定義
        vec3 metalColor1 = vec3(0.95, 0.93, 0.88);  // 明るい金色
        vec3 metalColor2 = vec3(0.85, 0.83, 0.78);  // 暗めの金色
        vec3 reflectionColor = vec3(1.0, 0.98, 0.9); // 反射光の色

        // フレネル効果の計算
        float fresnel = fresnel(threshold, 3.0);

        // 環境光の反射を計算
        float envReflection = sin(uv.x * 10.0 + t) * sin(uv.y * 10.0 + t * 0.7) * 0.5 + 0.5;
        envReflection = pow(envReflection, 2.0);

        // 金属的な質感の合成
        vec3 finalColor = mix(metalColor2, metalColor1, threshold);
        finalColor = mix(finalColor, reflectionColor, fresnel * envReflection);

        // ハイライトの追加
        float highlight = pow(metaballValue, 4.0);
        finalColor += reflectionColor * highlight * 0.5;

        // 色の強度を調整
        finalColor = mix(vec3(0.5), finalColor, uColorIntensity);

        // 最終的な色を出力（アルファ値は不透明）
        gl_FragColor = vec4(finalColor * threshold, 1.0);
    }
`;