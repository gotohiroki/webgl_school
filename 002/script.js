
// = 017 ======================================================================
// Group を駆使して「首振り機能つきの扇風機」を実現
// ============================================================================
import * as THREE from '../lib/three.module.js';
import { OrbitControls } from '../lib/OrbitControls.js';


window.addEventListener('DOMContentLoaded', () => {
  const app = new App3();
  app.init();
  app.render();

  const stop = 0;
  const speed_0 = 0.05;
  const speed_1 = 0.1;
  const speed_2 = 0.15;
  const speed_swing = 0.5;

  let isPowerOn = false;
  let isSwingOn = false;

  const POWER_BTN = document.querySelector('.power');
  const SWING_BTN = document.querySelector('.swing');
  const HIGH_BTN = document.querySelector('.high');
  const MID_BTN = document.querySelector('.mid');
  const LOW_BTN = document.querySelector('.low');

  POWER_BTN.addEventListener('click', (e) => {
    e.preventDefault();
    if(!isPowerOn) {
      app.setSpeed(speed_0);
      isPowerOn = true;
    } else {
      app.setSpeed(stop);
      app.setSwing(stop);
      isPowerOn = false;
    }
  });

  SWING_BTN.addEventListener('click', (e) => {
    e.preventDefault();
    if(!isSwingOn && isPowerOn) {
      app.setSwing(speed_swing);
      isSwingOn = true;
    } else {
      app.setSwing(stop);
      isSwingOn = false;
    }
  });

  LOW_BTN.addEventListener('click', (e) => {
    e.preventDefault();
    if(isPowerOn) {
      app.setSpeed(speed_0);
    }
  });

  MID_BTN.addEventListener('click', (e) => {
    e.preventDefault();
    if(isPowerOn) {
      app.setSpeed(speed_1);
    }
  });

  HIGH_BTN.addEventListener('click', (e) => {
    e.preventDefault();
    if(isPowerOn) {
      app.setSpeed(speed_2);
    }
  });

}, false);



class App3 {

  static get CAMERA_PARAM() {
    return {
      fovy: 60,
      aspect: window.innerWidth / window.innerHeight,
      near: 0.1,
      far: 200.0,
      x: 15.0,
      y: 12.0,
      z: 0.0,
      lookAt: new THREE.Vector3(0.0, 0.0, 0.0),
    };
  }

  static get CAMERA_ORTHO_SCALE() { return 10.0; }

  static get CAMERA_ORTHO_PARAM() {
    const aspect = window.innerWidth / window.innerHeight;
    const scale = App3.CAMERA_ORTHO_SCALE;
    const horizonatal = scale * aspect;
    const vertical = scale;
    return {
      left: -horizonatal,
      right: horizonatal,
      top: vertical,
      bottom: -vertical,
      near: 0.1,
      far: 100.0,
      x: 15.0,
      y: 15.0,
      z: 15.0,
      lookAt: new THREE.Vector3(0.0,0.0,0.0),
    };
  }

  static get RENDERER_PARAM() {
    return {
      clearColor: 0xd2f9e3,
      width: window.innerWidth,
      height: window.innerHeight,
    };
  }

  static get DIRECTIONAL_LIGHT_PARAM() {
    return {
      color: 0xffffff, // 光の色
      intensity: 1.0,  // 光の強度
      x: 1.0,          // 光の向きを表すベクトルの X 要素
      y: 1.0,          // 光の向きを表すベクトルの Y 要素
      z: 1.0           // 光の向きを表すベクトルの Z 要素
    };
  }

  static get AMBIENT_LIGHT_PARAM() {
    return {
      color: 0x8ea182, // 光の色
      intensity: .1,  // 光の強度
    };
  }

  static get MATERIAL_PARAM() {
    return {
      color: 0x3399ff, // マテリアルの基本色
    };
  }

  /**
   * コンストラクタ
   * @constructor
   */
  constructor() {
    this.renderer;         // レンダラー
    this.scene;            // シーン

    this.camera;           // カメラ

    this.directionalLight; // ディレクショナルライト
    this.ambientLight;     // アンビエントライト

    this.controls;         // オービットコントロール
    this.axesHelper;       // 軸ヘルパー

    this.isPowerOn = false;
    this.isSwingOn = false;

    this.speed = 0;
    this.speed_swing = 0;
    this.degree = 0;

    this.group;            // グループ
    this.blade;
    this.fan;

    this.render = this.render.bind(this); // 再帰呼び出しのための this 固定

    // リサイズイベント
    window.addEventListener('resize', () => {
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
    }, false);
  }

  setSpeed(speed) {
    this.speed = speed;
  }

  setSwing(speed) {
    this.speed_swing = speed;
  }

  render() {
    requestAnimationFrame(this.render);

    // ブレード
    this.blade.rotation.x -= this.speed;

    // 首ふり
    this.degree += this.speed_swing;
    this.group.rotation.y = 1.3 * Math.sin(this.degree * Math.PI / 180);
    // this.speed++;

    this.camera.lookAt(App3.CAMERA_PARAM.lookAt);

    this.renderer.render(this.scene, this.camera);
  }

  init() {
    // renderer 初期化
    this.initRenderer();

    // シーン
    this.scene = new THREE.Scene();

    // カメラ
    this.initCamera('perspect');

    // ライト
    this.initLight();

    // ヘルパー
    this.initHelper();

    // コントロール
    // this.initControls();

    this.initStage();
    this.initObject();
  }

  initRenderer() {
    // レンダラー
    this.renderer = new THREE.WebGLRenderer({antialias: true});
    this.renderer.setClearColor(new THREE.Color(App3.RENDERER_PARAM.clearColor));
    this.renderer.setSize(App3.RENDERER_PARAM.width, App3.RENDERER_PARAM.height);
    const wrapper = document.querySelector('#webgl');
    wrapper.appendChild(this.renderer.domElement);
  }

  initCamera(param="perspect"){
    if (param=="perspect") {
      this.camera = new THREE.PerspectiveCamera(
        App3.CAMERA_PARAM.fovy,
        App3.CAMERA_PARAM.aspect,
        App3.CAMERA_PARAM.near,
        App3.CAMERA_PARAM.far,
      );
      this.camera.position.set(
        App3.CAMERA_PARAM.x,
        App3.CAMERA_PARAM.y,
        App3.CAMERA_PARAM.z,
      );
      this.camera.lookAt(App3.CAMERA_PARAM.lookAt);
    } else if (param=="ortho") {
      // orthogonal camera
      this.camera = new THREE.OrthographicCamera(
        App3.CAMERA_ORTHO_PARAM.left,
        App3.CAMERA_ORTHO_PARAM.right,
        App3.CAMERA_ORTHO_PARAM.top,
        App3.CAMERA_ORTHO_PARAM.bottom,
        App3.CAMERA_ORTHO_PARAM.near,
        App3.CAMERA_ORTHO_PARAM.far,
      );
      this.camera.position.set(
        App3.CAMERA_ORTHO_PARAM.x,
        App3.CAMERA_ORTHO_PARAM.y,
        App3.CAMERA_ORTHO_PARAM.z,
      );
      this.camera.lookAt(App3.CAMERA_ORTHO_PARAM.lookAt);
    }
  }

  initLight() {
    // ディレクショナルライト（平行光源）
    this.directionalLight = new THREE.DirectionalLight(
      App3.DIRECTIONAL_LIGHT_PARAM.color,
      App3.DIRECTIONAL_LIGHT_PARAM.intensity
    );
    this.directionalLight.position.set(
      App3.DIRECTIONAL_LIGHT_PARAM.x,
      App3.DIRECTIONAL_LIGHT_PARAM.y,
      App3.DIRECTIONAL_LIGHT_PARAM.z,
    );
    this.scene.add(this.directionalLight);

    // アンビエントライト（環境光）
    this.ambientLight = new THREE.AmbientLight(
      App3.AMBIENT_LIGHT_PARAM.color,
      App3.AMBIENT_LIGHT_PARAM.intensity,
    );
    this.scene.add(this.ambientLight);
  }

  initHelper() {
    const axesBarLength = 5.0;
    this.axesHelper = new THREE.AxesHelper(axesBarLength);
    this.scene.add(this.axesHelper);
  }

  initControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
  }

  initStage() {
    // const stageGeometry = new THREE.PlaneGeometry(50, 50, 10, 10);
    // const stageMaterial = new THREE.MeshToonMaterial({color: 0xffffff, wireframe: true});
    // const stage = new THREE.Mesh(stageGeometry, stageMaterial);
    // stage.rotation.set(-Math.PI/2,0,0);
    // stage.receiveShadow = true;
    // this.scene.add(stage);

    const plane = new THREE.GridHelper(300, 20, 0x888888, 0x888888);
    // plane.position.x = -100;
    // plane.position.y = -0;
    // plane.position.y = -40;
    this.scene.add(plane);
  }

  initObject() {
    this.fan = new THREE.Group();

    // 支柱
    const poleGeometry = new THREE.CylinderGeometry( .1, .8, 6, 18, 3 );
    const poleMaterial = new THREE.MeshToonMaterial({color : 0x296a3a});
    const pole = new THREE.Mesh(poleGeometry, poleMaterial);
    pole.position.set(-.5,-2.5,0);
    pole.castShadow = true;
    this.fan.add(pole);


    // モーター
    const morterGeometry = new THREE.SphereGeometry(1, 18, 18);
    const morterMaterial = new THREE.MeshToonMaterial({color : 0x296a3a});
    const morter = new THREE.Mesh(morterGeometry, morterMaterial);
    morter.rotation.set(0, -Math.PI/2, 0);
    this.fan.add(morter);

    // ファン
    const fanGeometry = new THREE.CylinderGeometry( 3, 3, .5, 18, 3 );
    const fanMaterial = new THREE.MeshToonMaterial({ color : 0x296a3a, wireframe: true });
    const fan = new THREE.Mesh(fanGeometry, fanMaterial);
    fan.position.set(.6, .2, 0);
    fan.rotation.set(0, 0, Math.PI / 2 + .3);
    fan.castShadow = true;
    this.fan.add(fan);

    // ブレード
    this.blade = new THREE.Group();
    const boxGeometry = new THREE.BoxGeometry(.5, 2, .05);
    const boxMaterial = new THREE.MeshToonMaterial({
      color : 0x296a3a,
      transparent: true,
      opacity: 0.5,
      side: THREE.DoubleSide
    });
    const num = 18;

    for (let i = 0; i < num; i++) {
      const boxMesh = new THREE.Mesh(boxGeometry, boxMaterial);
      boxMesh.position.set(.4, Math.cos(Math.PI * 2 / num * i) * 2, Math.sin(Math.PI * 2 / num * i) * 2);
      boxMesh.rotation.set(Math.PI * 2 / num * i, 1, -.1);
      boxMesh.castShadow = true;
      this.blade.add(boxMesh);
    }

    // this.blade.position.set(.5,5.5,0);
    // this.blade.rotation.set(0,0,.3);



    this.group = new THREE.Group();

    this.bladePosition = new THREE.Group();
    this.bladePosition.add(this.blade);
    this.bladePosition.position.set( .5, 5.5, 0 );
    this.bladePosition.rotation.set(0, 0, .3);
    this.group.add(this.bladePosition);

    this.fan.position.set( .5, 5.5, 0 );
    this.group.add(this.fan);
    this.group.rotation.set(0, 0, 0);

    this.scene.add(this.group);
    // this.group.rotation.set(0, -Math.PI / 4, 0);

  }
}

