import * as THREE from '../lib/three.module.js';

// 舞台やステージ、空間みたいなものです。
const scene = new THREE.Scene();

// 舞台やステージ上のものをカメラで映します。
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

// 撮影したものを皆さんのPCのブラウザに表示させます。
const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

// 形状（立方体、円錐）など（今回は箱の形状）
const geometry = new THREE.BoxGeometry( 1, 1, 1 );

// 素材（色、質感）など（今回は緑色）
const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );

// GeometryとMaterialを足したもの
const cube = new THREE.Mesh( geometry, material );

// 箱をステージに追加
scene.add( cube );

// カメラを少し手前に引く
camera.position.z = 5;

// ステージとカメラをブラウザに表示！
renderer.render( scene, camera );

// アニメーションさせたいもの
function animate() {
  // 毎秒60回レンダリング（60FPS）
	requestAnimationFrame( animate );

  // 箱を回転
	cube.rotation.x += 0.01;
	cube.rotation.y += 0.01;

  // ステージとカメラをブラウザに表示！
	renderer.render( scene, camera );
}

// アニメーションをスタート！
animate();