function showError(errorText) {
  const errorBoxDiv = document.getElementById("error-box");
  const errorTextElement = document.createElement("p");
  errorTextElement.innerText = errorText;
  errorBoxDiv.appendChild(errorTextElement);
  console.log(errorText);
}

showError("This is what an error looks like");

function helloTriangle() {
  const canvas = document.getElementById("demo-canvas");
  const gl = canvas.getContext("webgl2");
  if (!gl) {
    const isWebGl1Supported = !!document.createElement("canvas").getContext("webgl");
    if (isWebGl1Supported) {
      showError("WebGL 1 is supported, but not v2 - try using a different device or browser");
    } else {
      showError("WebGL is not supported on this device - try using a different device or browser");
    }
    return;
  }

  // 创建一个包含三角形顶点（“顶点”）坐标[X，Y]的列表，该三角形将由WebGL绘制。
  // JavaScript数组在WebGL中不太友好，因此创建一个更友好的Float32Array
  // 这些数据在CPU上无用，所以通过使用ARRAY_BUFFER绑定点和gl.bufferData WebGL调用将其发送到GPU缓冲区
  const triangleVertices = [
    // Top middle
    0.0, 0.5,
    // Bottom left
    -0.5, -0.5,
    // Bottom right
    0.5, -0.5,
  ];

  const trianldeVerticesCpuBuffer = new Float32Array(triangleVertices);
  const triangleGeoBuffer = gl.createBuffer();

  gl.bindBuffer(gl.ARRAY_BUFFER, triangleGeoBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, trianldeVerticesCpuBuffer, gl.STATIC_DRAW);

  /**
   * 为此演示创建顶点和片段着色器。 GLSL着色器代码是
   * 编写为纯 JavaScript 字符串，附加到着色器并编译
   * 通过“compileShader”调用。
   * 如果两个着色器都编译成功，则将它们附加到 WebGLProgram
   * 实例 - 顶点和片段着色器必须在绘图中一起使用
   * 调用，WebGLProgram 表示要使用的着色器的组合。
   */

  // 移动设备和嵌入式系统的图形编程中使用mediump精度可以节约能耗
  const vertexShaderSourceCode = `#version 300 es
    precision mediump float;

    in vec2 vertexPosition;

    void main() {
        gl_Position = vec4(vertexPosition, 0.0, 1.0);
    }
  `;

  const vertexShader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vertexShader, vertexShaderSourceCode);
  gl.compileShader(vertexShader);

  // 检查当前顶点着色器是否编译成功
  if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
    const errorMessage = gl.getShaderInfoLog(vertexShader);
    showError(`Failed to compile vertex shader - ${errorMessage}`);
    return;
  }

  const fragmentShaderSourceCode = `#version 300 es
    precision mediump float;
  
    out vec4 outputColor;
  
    void main() {
        outputColor = vec4(0.294, 0.0, 0.51, 1.0);
    }`;

  const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fragmentShader, fragmentShaderSourceCode);
  gl.compileShader(fragmentShader);

  // 检查当前片段着色器是否编译成功
  if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
    const errorMessage = gl.getShaderInfoLog(fragmentShader);
    showError(`Failed to COMPOLE fragment shader - ${errorMessage}`);
    return;
  }

  const triangleShaderProgram = gl.createProgram();
  gl.attachShader(triangleShaderProgram, vertexShader);
  gl.attachShader(triangleShaderProgram, fragmentShader);
  gl.linkProgram(triangleShaderProgram);

  if (!gl.getProgramParameter(triangleShaderProgram, gl.LINK_STATUS)) {
    showError(gl.getProgramInfoLog(triangleShaderProgram));
    return;
  }

  const vertexPositionAttribLocation = gl.getAttribLocation(triangleShaderProgram, "vertexPosition");
  if (vertexPositionAttribLocation < 0) {
    showError("Failed to get the attrib for vertexposition");
    return;
  }

  /**
   * 以下步骤中，顺序并不重要，取决于应用程序
   * 开发商。 我选择了一个具有普遍意义的顺序。
   * 唯一对顺序敏感的是绘制调用（gl.drawArrays）
   * 必须在所有其他管道状态设置完成后进行
   *正确，因为它使用以下命令将绘制命令分派到 GPU当前状态。
   */
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
  gl.clearColor(0.08, 0.08, 0.08, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  gl.viewport(0, 0, canvas.width, canvas.height);

  gl.useProgram(triangleShaderProgram);
  gl.enableVertexAttribArray(vertexPositionAttribLocation);

  gl.bindBuffer(gl.ARRAY_BUFFER, triangleGeoBuffer);
  gl.vertexAttribPointer(vertexPositionAttribLocation, 2, gl.FLOAT, false, 2 * Float32Array.BYTES_PER_ELEMENT, 0);

  gl.drawArrays(gl.TRIANGLES, 0, 3);
}

try {
  helloTriangle();
} catch (err) {
  showError(`Uncaught JavaScript excetpion: ${err}`);
}
