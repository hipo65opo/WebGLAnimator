// 頂点シェーダー：頂点の位置と質感座標を処理
const vertexShaderSource = `
    // 頂点位置情報を受け取る
    attribute vec4 aVertexPosition;
    // テクスチャ座標を受け取る
    attribute vec2 aTextureCoord;
    
    // フラグメントシェーダーに渡すテクスチャ座標
    varying vec2 vTextureCoord;
    
    void main() {
        // 頂点位置をそのまま出力
        gl_Position = aVertexPosition;
        // テクスチャ座標をフラグメントシェーダーに渡す
        vTextureCoord = aTextureCoord;
    }
`;

// フラグメントシェーダー：各ピクセルの色を計算
const fragmentShaderSource = `
    // 高精度の浮動小数点を使用
    precision highp float;
    
    // 頂点シェーダーから受け取るテクスチャ座標
    varying vec2 vTextureCoord;
    
    // アニメーションの時間
    uniform float uTime;
    // アニメーションの速度
    uniform float uSpeed; 
    // 色の強度を制御
    uniform float uColorIntensity;
    
    void main() {
        // テクスチャ座標を取得
        vec2 uv = vTextureCoord;
        // 時間に基づくアニメーション値
        float t = uTime * uSpeed;
        
        // 水銀のような流体効果を作成
        // 正弦波と余弦波を組み合わせて複雑な波パターンを生成
        float fluid = sin(uv.x * 4.0 + sin(uv.y * 3.0 + t)) * 
                     cos(uv.y * 4.0 + cos(uv.x * 3.0 + t * 0.7));
                     
        // 中心からの距離に基づいて円形のうねり効果を追加
        fluid += sin(length(uv - 0.5) * 8.0 - t * 1.5) * 0.3;
        
        // 水銀の色の定義
        vec3 mercuryBase = vec3(0.8, 0.8, 0.83);      // 基本色
        vec3 mercuryHighlight = vec3(1.0, 1.0, 1.0);  // ハイライト
        vec3 mercuryShadow = vec3(0.6, 0.6, 0.65);    // 影の色
        
        // 流体パターンに基づいて3つの色を補間
        // fluid値を0-1の範囲に変換して色を混ぜる
        vec3 color = mix(mercuryShadow, 
                        mix(mercuryBase, mercuryHighlight, fluid * 0.5 + 0.5),
                        fluid * 0.5 + 0.5);
        
        // 全体的な色の強度を調整
        color = mix(vec3(0.7), color, uColorIntensity);
        
        // 最終的な色を設定（アルファ値は1.0で完全に不透明）
        gl_FragColor = vec4(color, 1.0);
    }
`;
