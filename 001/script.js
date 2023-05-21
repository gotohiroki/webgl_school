
// = 010 ======================================================================
// 課題
// Box Geometry を利用すること
// ボックスが画面上に１００個以上描かれるようにすること
// まっすぐ並べてもいいし……ランダムでもいい（配置の仕方は自由）
// 色や大きさなどは自由
// ============================================================================

// 必要なモジュールを読み込み
import * as THREE from '../lib/three.module.js';
import { OrbitControls } from '../lib/OrbitControls.js';

window.addEventListener('DOMContentLoaded', () => {
  const app = new App('#webgl');
  app.init();
  app.render();
}, false);

class App {
   /**
   * カメラ定義のための定数
   */
  static get CAMERA_PARAM() {
    return {
      fov : 75, // 視野角
      aspect : window.innerWidth / window.innerHeight, // 描画する空間のアスペクト比
      near : 0.1, // 描画する空間のニアクリップ面（最近面）
      far : 1000, // 描画する空間のファークリップ面（最遠面）
      x: 0.0,
      y: 6.0,
      z: 5.0,
      lookAt: new THREE.Vector3(0.0, 0.0, 0.0),
    }
  }

    /**
   * レンダラー定義のための定数
   */
  static get RENDERER_PARAM() {
    return {
      clearColor: 0xf9e4ee,
      // clearColor: 0x000000,
      width: window.innerWidth,
      height: window.innerHeight,
    }
  }

  /**
   * 平行光源定義のための定数
   */
  static get DIRECTIONAL_LIGHT_PARAM() {
    return {
      color: 0xffffff, // 光の色
      intensity: 1,  // 光の強度
      x: 1.0,          // 光の向きを表すベクトルの X 要素
      y: 1.0,          // 光の向きを表すベクトルの Y 要素
      z: 1.0           // 光の向きを表すベクトルの Z 要素
    };
  }

   /**
   * アンビエントライト定義のための定数 @@@
   */
  static get POINT_LIGHT_PARAM() {
    return {
      color: 0xffffff, // 光の色
      intensity: 2,  // 光の強度
      far: 1000,
    };
  }
  /**

  /**
   * マテリアル定義のための定数
   */
  static get MATERIAL_PARAM() {
    return {
      color: 0x6699FF, // マテリアルの基本色
    }
  }

  /**
   * フォグ定義のための定数
   */
  static get FOG_PARAM() {
    return {
      color: 0xf9e4ee,
      near: 0,
      far: 15
    }
  }

  constructor(canvas) {
    this.WRAPPER = document.querySelector(canvas);
    this.scene;
    this.camera;
    this.directionalLight;
    this.pointLight;
    this.renderer;
    this.geometry;
    this.material;
    this.mesh;
    this.scene;
    this.controls;
    this.BOXES = [];
    this.group;
    this.render = this.render.bind(this);
    this.clock = new THREE.Clock();

    window.addEventListener('resize', this.resize.bind(this));
  }

  init() {
    // レンダラー
    this.renderer =  new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(
      App.RENDERER_PARAM.width,
      App.RENDERER_PARAM.height
    );
    this.renderer.setPixelRatio( window.devicePixelRatio );
    this.renderer.setClearColor( new THREE.Color(App.RENDERER_PARAM.clearColor));
    this.WRAPPER.appendChild( this.renderer.domElement );


    // シーン
    this.scene = new THREE.Scene();

    // カメラ
    this.camera = new THREE.PerspectiveCamera(
      App.CAMERA_PARAM.fov,
      App.CAMERA_PARAM.aspect,
      App.CAMERA_PARAM.near,
      App.CAMERA_PARAM.far
    );

    this.camera.position.set(
      App.CAMERA_PARAM.x,
      App.CAMERA_PARAM.y,
      App.CAMERA_PARAM.z,
    );

    this.camera.lookAt(App.CAMERA_PARAM.lookAt);


    // ジオメトリとマテリアルの初期化
    this.geometry = new THREE.BoxGeometry(0.5,0.5,0.5);
    this.material = new THREE.MeshToonMaterial({ color: App.MATERIAL_PARAM.color });
    this.group = new THREE.Group();
    this.scene.add(this.group);
    const BOX_COUNT = 300;
    const BOX_SCALE = 4.0; // ボックスの最大スケール
    const BOX_SCALE_MIN = 0.5; // ボックスの最小スケール
    const BOX_SCALE_MAX = 1.0; // ボックスの最大スケール

    const DISTANCE = App.CAMERA_PARAM.far / 3;
	  const DISTANCE_DOUBLE = DISTANCE * 2;
    const ONE_TURN = 2 * Math.PI; // One turn
    let isInit = true;

    // メッシュの初期化
    // 100個Box Geometry
    for( let i = 0; i < BOX_COUNT; i++) {
      this.mesh = new THREE.Mesh(this.geometry, this.material);
      this.group.add(this.mesh);

      this.mesh.position.x = (Math.random() * 3.0 - 1.5) * BOX_SCALE;
      this.mesh.position.y = (Math.random() * 3.0 - 1.5) * BOX_SCALE;
      this.mesh.position.z = (Math.random() * 3.0 - 1.5) * BOX_SCALE;

      this.mesh.rotation.x = Math.random() * ONE_TURN;
      this.mesh.rotation.y = Math.random() * ONE_TURN;
      this.mesh.rotation.z = Math.random() * ONE_TURN;

      let boxScale = Math.random() * (BOX_SCALE_MAX - BOX_SCALE_MIN) + BOX_SCALE_MIN;
      boxScale = isInit ? Math.round(boxScale) : boxScale;
      this.mesh.scale.set(boxScale, boxScale, boxScale);

      this.BOXES.push(this.mesh);
    }

    // ライト
    this.directionalLight = new THREE.DirectionalLight(
      App.DIRECTIONAL_LIGHT_PARAM.color,
      App.DIRECTIONAL_LIGHT_PARAM.intensity
    );
    this.directionalLight.position.set(
      App.DIRECTIONAL_LIGHT_PARAM.x,
      App.DIRECTIONAL_LIGHT_PARAM.y,
      App.DIRECTIONAL_LIGHT_PARAM.z,
    );
    this.scene.add(this.directionalLight);

    this.pointLight = new THREE.PointLight(
      App.POINT_LIGHT_PARAM.color,
      App.POINT_LIGHT_PARAM.intensity,
      App.POINT_LIGHT_PARAM.far
    );
    this.scene.add(this.pointLight);

    // フォグ
    this.scene.fog = new THREE.Fog(
      App.FOG_PARAM.color,
      App.FOG_PARAM.near,
      App.FOG_PARAM.far,
    )


    // コントロール
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    // 自動でカメラを回してくれる
    // this.controls.autoRotate = true;
  }

  resize() {
    // レンダラーのサイズを調整する
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(App.RENDERER_PARAM.width, App.RENDERER_PARAM.height);

    // カメラのアスペクト比を正す
    this.camera.aspect = App.CAMERA_PARAM.aspect;
    this.camera.updateProjectionMatrix();
  }

  render() {
    this.controls.update();

    const elapsedTime = this.clock.getElapsedTime();

    this.BOXES.forEach((BOX) => {
      BOX.rotation.x += 0.03;
      BOX.rotation.y += 0.03;

      BOX.position.z += 0.01;
      if (BOX.position.z > App.CAMERA_PARAM.z) {
        BOX.position.z = - App.CAMERA_PARAM.z;
      }
    });

    this.pointLight.position.set(
      500 * Math.sin(elapsedTime / 500),
      500 * Math.sin(elapsedTime / 1000),
      500 * Math.cos(elapsedTime / 500)
    )
    // this.mesh.position.y = Math.cos(elapsedTime);
    // this.camera.lookAt(this.mesh.position);


    // this.camera.position.x = 6 * Math.sin((elapsedTime * 10) * Math.PI / 180);
    // this.camera.position.z = 6 * Math.cos((elapsedTime * 10) * Math.PI / 180);
    // this.camera.lookAt(new THREE.Vector3(0, 0, 0));

    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(this.render.bind(this));
  }
}




