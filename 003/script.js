// = 課題 ======================================================================
// 地球上を飛ぶ旅客機（を模した Box や Plane 等で可）の動きを実現してみましょう。
// 課題の実装ポイントは「旅客機のような見た目ではなく」、あくまでも「旅客機のような動き」です。
// ============================================================================

// 必要なモジュールを読み込み
import * as THREE from '../lib/three.module.js';
import { OrbitControls } from '../lib/OrbitControls.js';

// DOM がパースされたことを検出するイベントで App3 クラスを初期化
window.addEventListener('DOMContentLoaded', () => {
  const app = new App3();
    app.init();
    app.render();
}, false);

/**
 * three.js を効率よく扱うために自家製の制御クラスを定義
 */
class App3 {
  /**
   * カメラ定義のための定数
   */
  static get CAMERA_PARAM() {
    return {
      fovy: 60,
      aspect: window.innerWidth / window.innerHeight,
      near: 0.1,
      far: 200.0,
      x: -80.0,
      y: -80.0,
      z: -40.0,
      lookAt: new THREE.Vector3(0.0, 0.0, 0.0),
    };
  }
  /**
   * レンダラー定義のための定数
   */
  static get RENDERER_PARAM() {
    return {
      clearColor: 0xdfdfdf,
      clearColor: 0x212121,
      width: window.innerWidth,
      height: window.innerHeight,
    };
  }
  /**
   * ディレクショナルライト定義のための定数
   */
  static get DIRECTIONAL_LIGHT_PARAM() {
    return {
      color: 0xffffff, // 光の色
      intensity: .8,  // 光の強度
      x: 15.0,          // 光の向きを表すベクトルの X 要素
      y: 15.0,          // 光の向きを表すベクトルの Y 要素
      z: 5.0           // 光の向きを表すベクトルの Z 要素
    };
  }
  /**
   * アンビエントライト定義のための定数
   */
  static get AMBIENT_LIGHT_PARAM() {
    return {
      color: 0xffffff, // 光の色
      intensity: .6,  // 光の強度
    };
  }

  /**
   * フォグの定義のための定数
   */
  static get FOG_PARAM() {
    return {
      fogColor: 0x000000, // フォグの色
      fogNear: 200.0,      // フォグの掛かり始めるカメラからの距離
      fogFar: 200.0        // フォグが完全に掛かるカメラからの距離
    };
  }

  /**
   * 地球の定義のための定数
   */
  static get EARTH_PARAM() {
    return {
      color: 0x0074df, // マテリアルの基本色
      radius: 5.0,
      size: 100.0,
    };
  }

  /**
   * 月の定義のための定数
   */
  static get MOON_PARAM() {
    return {
      color: 0x798da4, // マテリアルの基本色
      radius: 5.0,
      size: 100.0,
    };
  }

  /**
   * 月の定義のための定数
   */
  static get TREE_PARAM() {
    return {
      color: 0x34e830, // マテリアルの基本色
      radius: .3,
      height: .9,
      radiusSegments: 5
    };
  }

  /**
   * 飛行機の定義のための定数
   */
  static get PILOT_PARAM() {
    return {
      color: 0xffffff, // マテリアルの基本色
      radius: .3,
      height: .9,
      radiusSegments: 10
    };
  }


  /**
   * 月と地球の間の距離
   */
  static get MOON_DISTANCE() {return 10.0;}

  static get PLANE_DISTANCE() {return 5.3;}
  static get MIN_PLANE_DISTANCE() {return 5.08;}
  static get PLANE_SPEED() {return 0.025;}

  /**
   * コンストラクタ
   * @constructor
   */
  constructor() {
    this.renderer;         // レンダラ
    this.scene;            // シーン
    this.camera;           // カメラ
    this.directionalLight; // ディレクショナルライト
    this.ambientLight;     // アンビエントライト
    this.controls;         // オービットコントロール
    this.axesHelper;       // 軸ヘルパー

    this.sphereGeometry;   // スフィアジオメトリ
    this.coneGeometry;     // コーンジオメトリ
    this.earth;            // 地球
    this.earthGeometry;    // 地球用のジオメトリ
    this.earthMaterial;    // 地球用マテリアル
    this.tree;             // 木
    this.trees = [];
    this.treeGeometry;     // 木用の
    this.treeMaterial;     // 木用のマテリアル
    this.moon;             // 月
    this.moonGeometry;     // 月用のジオメトリ
    this.moonMaterial;     // 月用マテリアル
    this.plane;            // 飛行機
    this.planeDirection; // 飛行機の方向
    this.planeDistance = App3.PLANE_DISTANCE; // 飛行機の距離

    this.isStop = false;
    this.dir = 1;
    this.operate = null;

    this.isDown = false;   // キーの押下状態を保持するフラグ

    // Clock オブジェクトの生成
    this.clock = new THREE.Clock();

    // 再帰呼び出しのための this 固定
    this.render = this.render.bind(this);

    // viewChangeクリックしたら、fpsに変換する
    const viewChangeCheckbox = document.getElementById('viewChange');
    viewChangeCheckbox.addEventListener('change', () => {
      this.fps = viewChangeCheckbox.checked
    });

    // キーの押下や離す操作を検出できるようにする
    window.addEventListener('keydown', (keyEvent) => {
      switch (keyEvent.key) {
        case ' ':
          this.isDown = true;
          break;
        default:
      }
    }, false);
    window.addEventListener('keyup', (keyEvent) => {
      this.isDown = false;
    }, false);

    // リサイズイベント
    window.addEventListener('resize', () => {
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
    }, false);
  }

  /**
   * 初期化処理
   */
  init() {
    this.clock = new THREE.Clock();

    // レンダラー
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setClearColor(new THREE.Color(App3.RENDERER_PARAM.clearColor));
    this.renderer.setSize(App3.RENDERER_PARAM.width, App3.RENDERER_PARAM.height);
    const wrapper = document.querySelector('#webgl');
    wrapper.appendChild(this.renderer.domElement);

    // シーンとフォグ
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.Fog(
      App3.FOG_PARAM.fogColor,
      App3.FOG_PARAM.fogNear,
      App3.FOG_PARAM.fogFar
    );

    // カメラ
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

    // カメラをfpsCameraにコピー
    this.fpsCamera = this.camera.clone();

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

    this.createEarth(); // 地球
    this.createMoon(); // 月
    this.treeManager(); // 木
    this.createPlane(); // 飛行機
    this.createStar()

    // コントロール
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);

    gsap.to(this.camera.position, {
      x: 10,
      y: 10,
      z: -10,
      duration: 3,
      ease: 'expo.inOut',
    });

  }

  createEarth() {
    // 地球のメッシュを生成
    // this.earthMaterial = new THREE.MeshPhongMaterial({color:App3.EARTH_PARAM.color, wireframe: true});
    this.earthMaterial = new THREE.MeshPhongMaterial({color:App3.EARTH_PARAM.color, flatShading: true,});
    this.earthGeometry = new THREE.IcosahedronGeometry(App3.EARTH_PARAM.radius, 2);
    this.earth = new THREE.Mesh(this.earthGeometry, this.earthMaterial);
    this.scene.add(this.earth);
  };

  createMoon() {
    // 月のメッシュを生成
    this.moonMaterial = new THREE.MeshPhongMaterial({color:App3.MOON_PARAM.color, flatShading: true});
    this.moonGeometry = new THREE.IcosahedronGeometry(App3.MOON_PARAM.radius, 2);
    this.moon = new THREE.Mesh(this.moonGeometry, this.moonMaterial);
    this.scene.add(this.moon);
    this.moon.scale.setScalar(0.3);
    this.moon.position.set(App3.MOON_DISTANCE, 0.0, 0.0);
  };

  createTree(latitudeDeg, longitudeDeg) {
    this.treeMaterial = new THREE.MeshPhongMaterial({color:App3.TREE_PARAM.color, flatShading: true})
    this.treeGeometry = new THREE.ConeGeometry(
      App3.TREE_PARAM.radius,
      App3.TREE_PARAM.height,
      App3.TREE_PARAM.radiusSegments
    );
    this.tree = new THREE.Mesh(this.treeGeometry, this.treeMaterial);
    this.scene.add(this.tree);
    this.tree.position.set(0, 5.0, 0);

    // 向き
    this.tree.rotation.x = Math.PI / 2;
    this.tree.rotation.y = (Math.random() * Math.PI) / 2;

    const latitudeRad = (Math.PI * latitudeDeg) / 180;
    const longitudeRad = (2 * Math.PI * longitudeDeg) / 360;

    const x = App3.EARTH_PARAM.radius * Math.sin(latitudeRad) * Math.cos(longitudeRad);
    const y = App3.EARTH_PARAM.radius * Math.sin(latitudeRad) * Math.sin(longitudeRad);
    const z = App3.EARTH_PARAM.radius * Math.cos(latitudeRad);

    const tree = this.tree;
    tree.position.set(x, y, z);

    // 原点に向ける
    const direction = tree.position.clone().normalize()
    // 外側に向けたいのでZに1を入れる
    const initialDirection = new THREE.Vector3(0, 0, 1);
    const gtn = new THREE.Quaternion().setFromUnitVectors(
      initialDirection,
      direction
    )
    tree.quaternion.premultiply(gtn)

    this.trees.push(tree);
    this.earth.add(tree);
  }

  treeManager() {
    this.createTree(30, 140)
    this.createTree(40, 140)

    this.createTree(60, 40)
    this.createTree(60, 50)
    this.createTree(70, 40)

    this.createTree(70, -10)
    this.createTree(75, -20)

    this.createTree(-80, 40)
    this.createTree(-80, 50)
    this.createTree(-60, 50)

    this.createTree(160, 160)
    this.createTree(170, 180)
    this.createTree(180, 160)
    this.createTree(160, 180)

    this.createTree(90, 180)
    this.createTree(100, 180)

    this.createTree(230, 230)
    this.createTree(240, 220)
    this.createTree(240, 250)
  }

  createPlane() {
    // // 旅客機
    this.planeGroup = new THREE.Group();

    // ボディー
    this.planeMaterial = new THREE.MeshPhongMaterial({color:App3.PILOT_PARAM.color, flatShading: true});
    this.planeBodyGeometry = new THREE.CapsuleGeometry(
      .3,
      .9,
      9,
      6
    );
    this.planeBody = new THREE.Mesh(this.planeBodyGeometry, this.planeMaterial);
    // this.planeBody.rotation.z = Math.PI / 2;
    this.planeGroup.add(this.planeBody);

    // 羽
    this.planeWingMaterial = new THREE.MeshPhongMaterial( {color:App3.PILOT_PARAM.color, side: THREE.DoubleSide, flatShading: true} );
    this.planeWingGeometry = new THREE.PlaneGeometry(
      .5,
      1.5,
    );
    this.planeWing = new THREE.Mesh(this.planeWingGeometry, this.planeWingMaterial);
    this.planeWing.rotation.x = Math.PI / 2;
    this.planeWing.rotation.y = Math.PI / 2;
    this.planeGroup.add(this.planeWing);

    // 後ろの羽
    this.planeWingBackGeometry = new THREE.BoxGeometry(
      .5,
      .2,
      .3
    );
    this.planeBackWing = new THREE.Mesh(this.planeWingBackGeometry, this.planeWingMaterial);
    this.planeBackWing.scale.setScalar(.5);
    this.planeBackWing.position.set(-.3, -.3, 0.0);
    this.planeGroup.add(this.planeBackWing);

    this.planeWingBackRightGeometry = new THREE.BoxGeometry(
      .8,
      .2,
      .3
    );
    this.planeBackRightWing = new THREE.Mesh(this.planeWingBackRightGeometry, this.planeWingMaterial);
    this.planeBackRightWing.position.set(-.18, -.35, -.2);
    this.planeBackRightWing.rotation.y = Math.PI / 2 + .5;
    this.planeBackRightWing.scale.setScalar(.5);
    this.planeGroup.add(this.planeBackRightWing);

    this.planeBackLeftWing = this.planeBackRightWing.clone();
    this.planeBackLeftWing.position.set(-.18, -.35, .2);
    this.planeBackLeftWing.rotation.y = Math.PI / 2 - 2.5;
    this.planeGroup.add(this.planeBackLeftWing);

    this.plane = new THREE.Group();
    this.plane.add(this.planeGroup);
    this.scene.add(this.plane);
    this.plane.rotation.set(0,0,-Math.PI * 2 - 1);
    // this.plane.rotation.set(0, 0, Math.PI * 2 -1.6);
    this.plane.scale.setScalar(.8);

    this.plane.position.set(0, App3.PLANE_DISTANCE, 0);

    // 進行方向の初期値も +Y 方向に
    this.planeDirection = new THREE.Vector3(1.0, 1.0, 0.0).normalize();

  };

  createStar() {
    // Particles
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 1500;

    const vertices = new Float32Array(particlesCount);

    for (let i = 0; i < particlesCount; i++) {
      vertices[i] = (Math.random() - 0.5) * 100;
    }

    particlesGeometry.setAttribute(
      'position',
      new THREE.BufferAttribute(vertices, 3)
    );
    const particleSize = .15;
    const particlesMaterial = new THREE.PointsMaterial({
      size: particleSize,
      color: 0xffffff,
    });

    const stars = new THREE.Points(particlesGeometry, particlesMaterial);
    this.scene.add(stars);
  }

  /**
   * 描画処理
   */
  render() {
    // 恒常ループ
    requestAnimationFrame(this.render);

    // コントロールを更新
    this.controls.update();

    // 経過時間の取得
    const time = this.clock.getElapsedTime();
    this.updateEarth(time);
    this.updateMoon(time);
    this.updatePlane(time);

    // レンダラーで描画
    // this.renderer.render(this.scene, this.camera);

    if(this.fps) {
      this.fpsCamera.position.copy(this.plane.position);
      const lookAtPosition = new THREE.Vector3().copy(this.plane.position).add(this.planeDirection);
      this.fpsCamera.up.copy(this.plane.position); // vector3(0,1,0);
      this.fpsCamera.lookAt(lookAtPosition); // カメラを常に飛行機の向きにする
      this.renderer.render(this.scene, this.fpsCamera);
    } else {
      this.renderer.render(this.scene, this.camera);
    }
  }



  updateEarth(time) {
    // 地球の自転
    this.earth.rotation.y += 0.005
  }

  updateMoon(time) {
    const delayCount = time / 3;

    // 月の公転
    this.moon.position.x = Math.sin(delayCount) * App3.MOON_DISTANCE;
    this.moon.position.z = Math.cos(delayCount) * App3.MOON_DISTANCE;

    // 月の自転
    this.moon.rotation.y = THREE.MathUtils.degToRad(360 * (delayCount % (2 * Math.PI)) / (2 * Math.PI)) + Math.PI / 2;
  }

  updatePlane() {
    // 現在（前のフレームまで）の飛行機の進行方向を変数に保持しておく
    const prevDirection = this.planeDirection.clone();

    // 現在（前のフレームまで）の飛行機の距離を変数に保持しておく
    const prevPlanePos = this.plane.position.clone();

    // ①飛行機の進行方向ベクトルに、向きベクトルを小さくスケールして加算する
    // ②加算したことでベクトルの長さが変化するので、単位化してから飛行機の座標に加算する
    const newPos = prevPlanePos.add(this.planeDirection.multiplyScalar(App3.PLANE_SPEED)).normalize().multiplyScalar(this.planeDistance);

    // (終点 - 視点) という計算を行うことで、２点間を結ぶベクトルを定義
    this.planeDirection = new THREE.Vector3().subVectors(newPos, this.plane.position);
    // 飛行機の長さに依存せず、向き（進行方向）だけを考えたい場合はベクトルを単位化する
    this.planeDirection.normalize();

    // 飛行機の座標に代入する（向きはまだ）
    this.plane.position.set(newPos.x, newPos.y, newPos.z);

    // 変換前と変換後の２つのベクトルから外積で法線ベクトル（三次元ベクトル）を求める（回転軸）
    const normalAxis = new THREE.Vector3().crossVectors(prevDirection, this.planeDirection);
    normalAxis.normalize();

    // 変換前と変換後のふたつのベクトルから内積でコサインを取り出す（回転量）
    const cos = prevDirection.dot(this.planeDirection);

    // コサインをラジアンに戻す
    const radians = Math.acos(cos);

    // 求めた法線ベクトル（外積/回転軸）とラジアン（内積/回転量）からクォータニオンを定義
    const qtn = new THREE.Quaternion().setFromAxisAngle(normalAxis, radians);

    // 飛行機の現在のクォータニオンに乗算する
    // 回転させたいObjectのQuaternionを取得してから回転を加えるためのQuaternionを乗算する
    this.plane.quaternion.multiply(qtn);

  }


}

