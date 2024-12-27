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

    #define pi 3.141592653589793

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
        float T = uTime * uSpeed * 1.9;
        float TT = uTime * uSpeed * 0.6;
        vec2 p = (2.0 * vTextureCoord - 1.0);
        
        for(int i=1; i<11; i++) {
            vec2 newp = p;
            float ii = float(i);
            newp.x += 0.85/ii * sin(ii*pi*p.y + T*0.095 + cos((TT/(5.0*ii))*ii));
            newp.y += 0.25/ii * cos(ii*pi*p.x + TT + 0.095 + sin((T/(5.0*ii))*ii));
            p = newp;
        }

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

        vec3 col = vec3(
            cos(p.x + p.y + 3.0 * 0.45) * 0.5 + 0.5,
            sin(p.x + p.y + 6.0 * 1.33) * 0.5 + 0.5,
            (sin(p.x + p.y + 9.0 * 1.0) + cos(p.x + p.y + 12.0 * 0.22)) * 0.25 + 0.5
        );
        gl_FragColor = vec4(col * col * uColorIntensity, 1.0);
    }
`;