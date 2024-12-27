const vertexShaderSource = `
    attribute vec4 aVertexPosition;
    attribute vec2 aTextureCoord;
    
    varying vec2 vTextureCoord;
    
    void main() {
        gl_Position = aVertexPosition;
        vTextureCoord = aTextureCoord;
    }
`;

const fragmentShaderSource = `
    precision highp float;
    
    varying vec2 vTextureCoord;
    
    uniform float uTime;
    uniform float uSpeed;
    uniform float uColorIntensity;
    
    void main() {
        vec2 uv = vTextureCoord;
        
        // Create a moving pattern based on time
        float t = uTime * uSpeed;
        
        // Generate a complex pattern using sine waves
        float pattern = sin(uv.x * 10.0 + t) * cos(uv.y * 10.0 + t) * 
                       sin(sqrt(uv.x * uv.x + uv.y * uv.y) * 10.0 - t);
        
        // Create dynamic colors
        vec3 color = vec3(
            sin(pattern + t) * 0.5 + 0.5,
            cos(pattern + t) * 0.5 + 0.5,
            sin(pattern * 2.0 + t) * 0.5 + 0.5
        );
        
        // Apply color intensity
        color = mix(vec3(0.5), color, uColorIntensity);
        
        gl_FragColor = vec4(color, 1.0);
    }
`;
