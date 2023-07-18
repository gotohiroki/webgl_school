// モジュールを読み込み
import { WebGLUtility } from './webgl.js';
import GUI from 'https://cdn.jsdelivr.net/npm/lil-gui@0.18/+esm';


// ドキュメントの読み込みが完了したら実行されるようイベントを設定する
window.addEventListener('DOMContentLoaded', () => {
  // アプリケーションのインスタンスを初期化し、必要なリソースをロードする
  const app = new App();
  app.init();
  app.load()
  .then(() => {
    // ジオメトリセットアップ
    app.setupGeometry();
    // ロケーションのセットアップ
    app.setupLocation();
    // app.setupGUI();

    // セットアップが完了したら描画を開始する
    app.start();
  });
}, false);

/**
 * アプリケーション管理クラス
 */
class App {
  /**
   * @constructro
   */
  constructor() {
    /**
     * WebGL で描画対象となる canvas
     * @type {HTMLCanvasElement}
     */
    this.canvas = null;
    /**
     * WebGL コンテキスト
     * @type {WebGLRenderingContext}
     */
    this.gl = null;
    /**
     * プログラムオブジェクト
     * @type {WebGLProgram}
     */
    this.program = null;
    /**
     * uniform 変数のロケーションを保持するオブジェクト
     * @type {object.<WebGLUniformLocation>}
     */
    this.uniformLocation = null;
    /**
     * 頂点の座標を格納する配列
     * @type {Array.<number>}
     */
    this.position = [];
    /**
     * 頂点の座標を構成する要素数（ストライド）
     * @type {number}
     */
    this.positionStride = null;
    /**
     * 座標の頂点バッファ
     * @type {WebGLBuffer}
     */
    this.positionVBO = null;
    /**
     * 頂点の色を格納する配列
     * @type {Array.<number>}
     */
    this.color = [];
    /**
     * 頂点の色を構成する要素数（ストライド）
     * @type {number}
     */
    this.colorStride = null;
    /**
     * 色の頂点バッファ
     * @type {WebGLBuffer}
     */
    this.colorVBO = null;
    /**
     * レンダリング開始時のタイムスタンプ
     * @type {number}
     */
    this.startTime = null;
    /**
     * レンダリングを行うかどうかのフラグ
     * @type {boolean}
     */
    this.isRender = false;

    // this を固定するためのバインド処理
    this.render = this.render.bind(this);
  }

  /**
   * 初期化処理を行う
   */
  init() {
    // レンダリング開始時のタイムスタンプを取得しておく
    this.startTime = Date.now();

    // canvas エレメントの取得と WebGL コンテキストの初期化
    this.canvas = document.getElementById('webgl-canvas');
    this.gl = WebGLUtility.createWebGLContext(this.canvas);

    // canvas のサイズを設定
    const size = Math.min(window.innerWidth, window.innerHeight);
    this.canvas.width  = size;
    this.canvas.height = size;
  }

  /**
   * 各種リソースのロードを行う
   * @return {Promise}
   */
  load() {
    return new Promise((resolve, reject) => {
      // 変数に WebGL コンテキストを代入しておく（コード記述の最適化）
      const gl = this.gl;
      // WebGL コンテキストがあるかどうか確認する
      if (gl == null) {
        // もし WebGL コンテキストがない場合はエラーとして Promise を reject する
        const error = new Error('not initialized');
        reject(error);
      } else {
        let vs = null;
        let fs = null;
        // まず頂点シェーダのソースコードを読み込む
        WebGLUtility.loadFile('./shader/main.vert')
        .then((vertexShaderSource) => {
          vs = WebGLUtility.createShaderObject(gl, vertexShaderSource, gl.VERTEX_SHADER);
          return WebGLUtility.loadFile('./shader/main.frag');
        })
        .then((fragmentShaderSource) => {
          fs = WebGLUtility.createShaderObject(gl, fragmentShaderSource, gl.FRAGMENT_SHADER);
          this.program = WebGLUtility.createProgramObject(gl, vs, fs);

          // Promise を解決
          resolve();
        });
      }
    });
  }

  /**
   * 頂点属性（頂点ジオメトリ）のセットアップを行う
   */
  setupGeometry() {
    // 頂点座標の定義
    this.position = [];
    // 要素数は XYZ の３つ
    this.positionStride = 3;
    // 頂点の色の定義
    this.color = [];
    // 要素数は RGBA の４つ
    this.colorStride = 4;

    const offsetTheta = Math.PI * 0.5
    const R = 0.5
    const num = 5

    for(let i = 0; i < num; i++) {
      const theta = offsetTheta + (360 / `${num}`) / 180 * Math.PI * i;
      const nextTheta = offsetTheta + (360 / `${num}`) / 180 * Math.PI * (i + 1);

      // first triangle
      const vert1 = [0, 0, 0];
      const vert2 = [Math.cos(theta) * R, Math.sin(theta) * R, 0];
      const vert3 = [Math.cos(nextTheta) * R, Math.sin(nextTheta) * R, 0];

      this.position.push(...vert1, ...vert2, ...vert3);

      const colorArray = [
        1.2, 1.8, 0.4, 1.0, // ひとつ目の頂点の r, g, b, a カラー
        0.0, 1.2, 0.2, 1.0, // ふたつ目の頂点の r, g, b, a カラー
        0.4, 0.8, 1.0, 0.5, // みっつ目の頂点の r, g, b, a カラー

        1.2, 1.8, 0.4, 1.0, // ひとつ目の頂点の r, g, b, a カラー
        0.0, 1.2, 0.2, 1.0, // ふたつ目の頂点の r, g, b, a カラー
        0.4, 0.8, 1.0, 0.5, // みっつ目の頂点の r, g, b, a カラー

        1.2, 1.8, 0.4, 1.0, // ひとつ目の頂点の r, g, b, a カラー
        0.0, 1.2, 0.2, 1.0, // ふたつ目の頂点の r, g, b, a カラー
        0.4, 0.8, 1.0, 0.6, // みっつ目の頂点の r, g, b, a カラー
      ];

      this.color.push(...colorArray);
    }

    // VBO を生成
    this.positionVBO = WebGLUtility.createVBO(this.gl, this.position);
    this.colorVBO = WebGLUtility.createVBO(this.gl, this.color);
  }

  /**
   * 頂点属性のロケーションに関するセットアップを行う
   */
  setupLocation() {
    const gl = this.gl;
    // attribute location の取得
    const attPosition = gl.getAttribLocation(this.program, 'position');
    const attColor = gl.getAttribLocation(this.program, 'color');

    // attribute location の有効化
    WebGLUtility.enableAttribute(gl, this.positionVBO, attPosition, this.positionStride);
    WebGLUtility.enableAttribute(gl, this.colorVBO, attColor, this.colorStride);

    // uniform location の取得
    this.uniformLocation = {
      time: gl.getUniformLocation(this.program, 'time'),
    };
  }

  /**
   * レンダリングのためのセットアップを行う
   */
  setupRendering() {
    const gl = this.gl;
    // ビューポートを設定する
    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    // クリアする色を設定する（RGBA で 0.0 ～ 1.0 の範囲で指定する）
    gl.clearColor(0.3, 0.3, 0.3, 1.0);
    // 実際にクリアする（gl.COLOR_BUFFER_BIT で色をクリアしろ、という指定になる）
    gl.clear(gl.COLOR_BUFFER_BIT);
  }

  /**
   * 描画を開始する
   */
  start() {
    // レンダリング開始時のタイムスタンプを取得しておく
    this.startTime = Date.now();
    // レンダリングを行っているフラグを立てておく
    this.isRender = true;
    // レンダリングの開始
    this.render();
  }

  /**
   * 描画を停止する
   */
  stop() {
    this.isRender = false;
  }

  setupGUI() {
    const gui = new GUI;

    // lil-gui を使用して colorArray の色を制御するためのパラメータ
    const params = {
      red: 1.0,
      green: 0.0,
      blue: 0.0,
      alpha: 1.0,
    };

    // lil-gui でパラメータをコントロールする
    const folder = gui.addFolder('Color');
    folder.add(params, 'red', 0.0, 1.0).onChange(updateColor);
    folder.add(params, 'green', 0.0, 1.0).onChange(updateColor);
    folder.add(params, 'blue', 0.0, 1.0).onChange(updateColor);
    folder.add(params, 'alpha', 0.0, 1.0).onChange(updateColor);

    // パラメータ変更時に colorArray の値を更新する関数
    function updateColor() {
      const color = [
        params.red, params.green, params.blue, params.alpha, // ひとつ目の頂点の r, g, b, a カラー
        params.red, params.green, params.blue, params.alpha, // ふたつ目の頂点の r, g, b, a カラー
        params.red, params.green, params.blue, params.alpha, // みっつ目の頂点の r, g, b, a カラー
        params.red, params.green, params.blue, params.alpha, // ...
        params.red, params.green, params.blue, params.alpha,
        params.red, params.green, params.blue, params.alpha,
        params.red, params.green, params.blue, params.alpha,
        params.red, params.green, params.blue, params.alpha,
        params.red, params.green, params.blue, params.alpha,
        params.red, params.green, params.blue, params.alpha,
      ];

      // colorArray を更新する
      this.color = color;
      // colorVBO を再生成する
      this.colorVBO = WebGLUtility.createVBO(this.gl, this.color);
    }

  }

  /**
   * レンダリングを行う
   */
  render() {
    const gl = this.gl;

    // レンダリングのフラグの状態を見て、requestAnimationFrame を呼ぶか決める
    if (this.isRender === true) {
      requestAnimationFrame(this.render);
    }
    // ビューポートの設定やクリア処理は毎フレーム呼び出す
    this.setupRendering();
    // WebGLUtility.enableAttribute(gl, this.colorVBO, attColor, this.colorStride);
    // 現在までの経過時間を計算し、秒単位に変換する
    const nowTime = (Date.now() - this.startTime) * 0.001;
    // プログラムオブジェクトを選択
    gl.useProgram(this.program);

    // ロケーションを指定して、uniform 変数の値を更新する（GPU に送る）
    gl.uniform1f(this.uniformLocation.time, nowTime);
    // ドローコール（描画命令）
    gl.drawArrays(gl.TRIANGLES, 0, this.position.length / this.positionStride);
  }
}

