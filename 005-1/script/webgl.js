
/**
 * WebGL の API を目的別にまとめたユーティリティクラス
 * @class
 */
export class WebGLUtility {
  /**
   * ファイルをプレーンテキストとして読み込む
   * @static
   * @param {string} path - 読み込むファイルのパス
   * @return {Promise}
   */
  static loadFile(path) {
    return new Promise((resolve, reject) => {
      // fetch を使ってファイルにアクセスする
      fetch(path)
      .then((res) => {
        // テキストとして処理する
        return res.text();
      })
      .then((text) => {
        // テキストを引数に Promise を解決する
        resolve(text);
      })
      .catch((err) => {
        // なんらかのエラー
        reject(err);
      });
    });
  }

  /**
   * canvas を受け取り WebGL コンテキストを初期化する
   * @param {HTMLCanvasElement} canvas - WebGL コンテキストを取得する canvas 要素
   * @return {WebGLRenderingContext}
   */
  static createWebGLContext(canvas) {
    // canvas から WebGL コンテキスト取得を試みる
    const gl = canvas.getContext('webgl');
    if (gl == null) {
      // WebGL コンテキストが取得できない場合はエラー
      throw new Error('webgl not supported');
      return null;
    } else {
      return gl;
    }
  }

  /**
   * ソースコードからシェーダオブジェクトを生成する
   * @param {WebGLRenderingContext} gl - WebGL コンテキスト
   * @param {string} source - シェーダのソースコード
   * @param {number} type - gl.VERTEX_SHADER or gl.FRAGMENT_SHADER
   * @return {WebGLShader}
   */
  static createShaderObject(gl, source, type) {
    // 空のシェーダオブジェクトを生成する
    const shader = gl.createShader(type);
    // シェーダオブジェクトにソースコードを割り当てる
    gl.shaderSource(shader, source);
    // シェーダをコンパイルする
    gl.compileShader(shader);
    // コンパイル後のステータスを確認し問題なければシェーダオブジェクトを返す
    if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      return shader;
    } else {
      throw new Error(gl.getShaderInfoLog(shader));
      return null;
    }
  }

  /**
   * シェーダオブジェクトからプログラムオブジェクトを生成する
   * @param {WebGLRenderingContext} gl - WebGL コンテキスト
   * @param {WebGLShader} vs - 頂点シェーダのシェーダオブジェクト
   * @param {WebGLShader} fs - フラグメントシェーダのシェーダオブジェクト
   * @return {WebGLProgram}
   */
  static createProgramObject(gl, vs, fs) {
    // 空のプログラムオブジェクトを生成する
    const program = gl.createProgram();
    // ２つのシェーダをアタッチ（関連付け）する
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    // シェーダオブジェクトをリンクする
    gl.linkProgram(program);
    // リンクが完了するとシェーダオブジェクトは不要になるので削除する
    gl.deleteShader(vs);
    gl.deleteShader(fs);
    // リンク後のステータスを確認し問題なければプログラムオブジェクトを返す
    if (gl.getProgramParameter(program, gl.LINK_STATUS)) {
      gl.useProgram(program);
      return program;
    } else {
      throw new Error(gl.getProgramInfoLog(program));
      return null;
    }
  }

  /**
   * JavaScript の配列から VBO（Vertex Buffer Object）を生成する
   * @param {WebGLRenderingContext} gl - WebGL コンテキスト
   * @param {Array.<number>} vertexArray - 頂点属性情報の配列
   * @return {WebGLBuffer}
   */
  static createVBO(gl, vertexArray) {
    // 空のバッファオブジェクトを生成する
    const vbo = gl.createBuffer();
    // バッファを gl.ARRAY_BUFFER としてバインドする
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    // バインドしたバッファに Float32Array オブジェクトに変換した配列を設定する
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexArray), gl.STATIC_DRAW);
    // 安全のために最後にバインドを解除してからバッファオブジェクトを返す
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    return vbo;
  }

  /**
   * 頂点属性情報を有効化しロケーションと紐付ける
   * @param {WebGLRenderingContext} gl - WebGL コンテキスト
   * @param {WebGLBuffer} vbo - 頂点属性を格納した VBO
   * @param {number} attLocation - 頂点属性ロケーション（実際は単なる整数）
   * @param {number} attStride - 頂点属性のストライド（データサイズ）
   */
  static enableAttribute(gl, vbo, attLocation, attStride) {
    // 有効化したいバッファをまずバインドする
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    // 頂点属性ロケーションの有効化を行う
    gl.enableVertexAttribArray(attLocation);
    // 対象のロケーションのストライドやデータ型を設定する
    gl.vertexAttribPointer(attLocation, attStride, gl.FLOAT, false, 0, 0);
  }
}

