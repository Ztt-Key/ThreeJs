<template>
  <div id="container">
    <div id="info">Magotan</div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
let width, height, container, scene, render;
let camera, controls, font;
let model; // 添加模型变量

onMounted(() => {
  container = document.getElementById('container')
  console.log(container);
  width = container.clientWidth;
  height = container.clientHeight;
  initScene()
  initCamera()
  initRender()
  initControls()
  cube()
  animate()
  console.log("结束");
})

// 添加控制器初始化函数
const initControls = () => {
  controls = new OrbitControls(camera, render.domElement);
  controls.enableDamping = true; // 启用阻尼效果
  controls.dampingFactor = 0.05;
  controls.enableZoom = true;    // 允许缩放
  controls.enablePan = false;    // 禁用平移
  controls.autoRotate = true;    // 自动旋转
  controls.autoRotateSpeed = 2.0; // 自动旋转速度
  controls.minDistance = 300;    // 最小距离
  controls.maxDistance = 1000;   // 最大距离
}


//初始化场景
const initScene = () => {
  scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x000000, 1, 30000);
  scene.background = new THREE.Color(0x000000);

  // 增强光源效果
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
  directionalLight.position.set(1, 1, 1);
  scene.add(directionalLight);

  // 添加点光源以增强车身细节
  const pointLight1 = new THREE.PointLight(0xffffff, 1);
  pointLight1.position.set(200, 200, 200);
  scene.add(pointLight1);

  const pointLight2 = new THREE.PointLight(0xffffff, 1);
  pointLight2.position.set(-200, -200, -200);
  scene.add(pointLight2);
}

//初始化相机
const initCamera = () => {
  camera = new THREE.PerspectiveCamera(45, width / height, 1, 30000);
  camera.position.set(200, 200, 800); 
  camera.lookAt(0, 0, 0);
}

//网格
const cube = () => {
  //加载glb模型
  const loader = new GLTFLoader(); 
  const dracoLoader = new DRACOLoader();//因为glb压缩方式不被three识别，所以需要使用工具加工
  dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');
  loader.setDRACOLoader(dracoLoader)
  loader.load('/model/magotan.glb', function (gltf) {
    model = gltf.scene;
    model.position.set(0,-50,0);
    model.scale.set(150,150,150);
    //在下方添加阴影
    model.traverse((e)=>{
      if (e.isMesh) {
        e.castShadow = true;
        e.receiveShadow = true;
      }
    })
    scene.add(model);
    
    // 添加一个原型作为阴影的接收表面
    const planeGeometry = new THREE.CircleGeometry(400, 520); // 平面的尺寸
    const planeMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 }); // 平面的材质
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.rotation.x = -Math.PI / 2;
    plane.position.set(0, -120, 0); // 根据汽车模型的位置调整 Y 值
    plane.receiveShadow = true;
    scene.add(plane);

  }, undefined, function (error) {
    console.error(error);
  });
}

//渲染
const initRender = () => {
  render = new THREE.WebGLRenderer();
  render.setSize(width, height);
  container.appendChild(render.domElement);
}

const animate = () => {
  requestAnimationFrame(animate);
  if (controls) {
    controls.update();
  }
  if (model) {
     model.rotation.y += 0.005; 
  }
  render.render(scene, camera);
}

// 添加清理函数
onUnmounted(() => {
  if (controls) controls.dispose();
  if (render) {
    render.dispose();
    render.forceContextLoss();
  }
  // 清理场景
  while (scene.children.length > 0) {
    scene.remove(scene.children[0]);
  }
})
</script>

<style scoped>
#container {
  width: 100%;
  height: 100vh;
}

#info {
  position: absolute;
  top: 30px;
  width: 100%;
  color: #ffffff;
  /* 更明亮的颜色 */
  font-family: 'Poppins', sans-serif;
  /* 使用更现代的字体 */
  font-size: 24px;
  /* 更大的字体 */
  font-weight: 600;
  /* 加粗字体 */
  text-align: center;
  z-index: 100;
  display: block;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  /* 添加文字阴影 */
  letter-spacing: 1px;
  /* 调整字间距 */
  line-height: 1.6;
  /* 调整行高 */
  animation: fadeIn 2s ease-in-out;
  /* 添加淡入动画 */
}

/* 淡入动画 */
@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}
</style>
