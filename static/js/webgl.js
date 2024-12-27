class WebGLAnimation {
    constructor(canvas) {
        this.canvas = canvas;
        this.gl = canvas.getContext('webgl');
        if (!this.gl) {
            throw new Error('WebGL not supported');
        }

        this.programInfo = null;
        this.buffers = null;
        this.then = 0;
        this.speed = 1.0;
        this.colorIntensity = 0.5;

        this.init();
    }

    init() {
        // Initialize shaders
        const shaderProgram = this.initShaderProgram(vertexShaderSource, fragmentShaderSource);

        this.programInfo = {
            program: shaderProgram,
            attribLocations: {
                vertexPosition: this.gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
                textureCoord: this.gl.getAttribLocation(shaderProgram, 'aTextureCoord'),
            },
            uniformLocations: {
                time: this.gl.getUniformLocation(shaderProgram, 'uTime'),
                speed: this.gl.getUniformLocation(shaderProgram, 'uSpeed'),
                colorIntensity: this.gl.getUniformLocation(shaderProgram, 'uColorIntensity'),
            },
        };

        this.buffers = this.initBuffers();
        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    initShaderProgram(vsSource, fsSource) {
        const vertexShader = this.loadShader(this.gl.VERTEX_SHADER, vsSource);
        const fragmentShader = this.loadShader(this.gl.FRAGMENT_SHADER, fsSource);

        const shaderProgram = this.gl.createProgram();
        this.gl.attachShader(shaderProgram, vertexShader);
        this.gl.attachShader(shaderProgram, fragmentShader);
        this.gl.linkProgram(shaderProgram);

        if (!this.gl.getProgramParameter(shaderProgram, this.gl.LINK_STATUS)) {
            throw new Error('Shader program initialization failed');
        }

        return shaderProgram;
    }

    loadShader(type, source) {
        const shader = this.gl.createShader(type);
        this.gl.shaderSource(shader, source);
        this.gl.compileShader(shader);

        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            this.gl.deleteShader(shader);
            throw new Error('Shader compilation failed');
        }

        return shader;
    }

    initBuffers() {
        const positions = new Float32Array([
            -1.0, -1.0,
             1.0, -1.0,
            -1.0,  1.0,
             1.0,  1.0,
        ]);

        const textureCoordinates = new Float32Array([
            0.0, 0.0,
            1.0, 0.0,
            0.0, 1.0,
            1.0, 1.0,
        ]);

        const positionBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positionBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, positions, this.gl.STATIC_DRAW);

        const textureCoordBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, textureCoordBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, textureCoordinates, this.gl.STATIC_DRAW);

        return {
            position: positionBuffer,
            textureCoord: textureCoordBuffer,
        };
    }

    resize() {
        const displayWidth = this.canvas.clientWidth;
        const displayHeight = this.canvas.clientHeight;

        if (this.canvas.width !== displayWidth || this.canvas.height !== displayHeight) {
            this.canvas.width = displayWidth;
            this.canvas.height = displayHeight;
            this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
        }
    }

    render(now) {
        now *= 0.001; // Convert to seconds
        const deltaTime = now - this.then;
        this.then = now;

        this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);

        this.gl.useProgram(this.programInfo.program);

        // Set uniforms
        this.gl.uniform1f(this.programInfo.uniformLocations.time, now);
        this.gl.uniform1f(this.programInfo.uniformLocations.speed, this.speed);
        this.gl.uniform1f(this.programInfo.uniformLocations.colorIntensity, this.colorIntensity);

        // Set vertex attributes
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffers.position);
        this.gl.vertexAttribPointer(
            this.programInfo.attribLocations.vertexPosition,
            2,
            this.gl.FLOAT,
            false,
            0,
            0
        );
        this.gl.enableVertexAttribArray(this.programInfo.attribLocations.vertexPosition);

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffers.textureCoord);
        this.gl.vertexAttribPointer(
            this.programInfo.attribLocations.textureCoord,
            2,
            this.gl.FLOAT,
            false,
            0,
            0
        );
        this.gl.enableVertexAttribArray(this.programInfo.attribLocations.textureCoord);

        // Draw
        this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);

        requestAnimationFrame((now) => this.render(now));
    }

    setSpeed(speed) {
        this.speed = speed;
    }

    setColorIntensity(intensity) {
        this.colorIntensity = intensity;
    }
}

// Initialize animation when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.querySelector('#glCanvas');
    const animation = new WebGLAnimation(canvas);
    animation.render(0);
    window.glAnimation = animation; // Make it globally accessible for controls
});
