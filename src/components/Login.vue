<template>
    <div id="container"></div>
</template>

<script setup>
import { onMounted } from 'vue';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import _ from 'lodash'
//容器
var container;
//加载图片
const Image_Bg = new URL('../assets/images/sky.png', import.meta.url).href
//球体纹理
const Image_Sphere = new URL('../assets/images/earth_bg.png', import.meta.url).href
const Image_Start = new URL('../assets/images/starflake1.png', import.meta.url).href
const Image_Start1 = new URL('../assets/images/starflake2.png', import.meta.url).href
// 添加星云纹理
const Image_Nebula1 = new URL('../assets/images/cloud.png', import.meta.url).href
const Image_Nebula2 = new URL('../assets/images/cloud.png', import.meta.url).href
//添加宇航员
const PeopleAstronaut = new URL('../assets/images/login_human.png', import.meta.url).href
let width;
let height;
//深度
let depth = 1400;
//场景
let scene;
//相机z轴位置
let z;
let camera;
//初始化渲染器
let render;
//球体网格
let spheres;
//点的出是参数
let points;
//点的材质
let pointsMaterial = [];
let pointsMaterial_init;
let moveSpeed = 5; // 添加星星移动速度变量
let pointGeo = [] // 添加星星几何体数组
let nebulaMeshes = []; // 存储星云网格
let BgmMain =new URL('../assets/bgm/mixkit-love-letter-221.mp3', import.meta.url).href
onMounted(() => {
    container = document.getElementById('container')
    width = container.clientWidth;
    height = container.clientHeight;
    initScene()
    initSceneBg()
    initCamera()
    initRender()
    getCacheGeometry()
    initLight()
    initOrbitControls()
    //初始位置
    pointsMaterial_init = -z - depth / 2
    initScenStart(pointsMaterial_init)
    // 初始化星云
    initNebulas()
    initAstronaut()
    BGM()
    animate()
})

//初始化场景
const initScene = () => {
    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x000000, 1, 30000);
}
//添加背景
const initSceneBg = () => {
    //纹理
    new THREE.TextureLoader().load(Image_Bg, (texture) => {
        //创建立方体
        const geo = new THREE.BoxGeometry(width, height, depth)
        //材质
        const mat = new THREE.MeshBasicMaterial({
            map: texture,
            side: THREE.BackSide
        })
        //网格
        const mesh = new THREE.Mesh(geo, mat);
        //添加到场景
        scene.add(mesh);
    });
}
//相机
const initCamera = () => {
    //视野夹角
    const fov = 15;
    //相机距离物体距离
    const dis = width / 2 / Math.tan(Math.PI / 12)
    z = Math.floor(dis - 1400 / 2)
    camera = new THREE.PerspectiveCamera(fov, width / height, 1, 10000);
    //相机所在位置
    camera.position.set(0, 0, z);
    //看向原点
    camera.lookAt(0, 0, 0);
}
//球缓存几何体
const getCacheGeometry = () => {
    const geometry = new THREE.SphereGeometry(50, 64, 32);
    const sphere = new THREE.MeshPhongMaterial()
    sphere.map = new THREE.TextureLoader().load(Image_Sphere)
    //网格（物体，材质）
    spheres = new THREE.Mesh(geometry, sphere)
    spheres.position.set(-400, 200, -200);
    scene.add(spheres)
}
//光源
const initLight = () => {
    //环境光
    const ambientLight = new THREE.AmbientLight(0xffffff, 1);
    scene.add(ambientLight);
    //点光源
    const pointLight = new THREE.PointLight(0x0655fd, 5, 0);
    pointLight.position.set(0, 100, -200);
    scene.add(pointLight);
}
//星球的自转
const renderSpherRotate = () => {
    //材质自转
    spheres.rotation.y += 0.01;
}
//背景音乐
const BGM = () => {

const listener = new THREE.AudioListener();
camera.add(listener);

// 2. 创建全局 Audio 对象
const sound = new THREE.Audio(listener);

// 3. 加载音频文件
const audioLoader = new THREE.AudioLoader();
audioLoader.load(BgmMain, function (buffer) {
    sound.setBuffer( buffer );
	sound.setLoop( true );
	sound.setVolume( 0.5 );
});
sound.autoplay = true;
sound.play();
document.addEventListener('click', () => {
    console.log("bgm");
    console.log(listener.context.state);
    if (listener.context.state === 'suspended') {
        sound.stop()
    }
    sound.play(); // 播放
});
}
//初始化场景的星星效果
const initScenStart = (initZ) => {
    const geometry = new THREE.BufferGeometry();
    //星星位置坐标
    const vertices = [];
    //创建纹理
    const texture = new THREE.TextureLoader();
    const one = texture.load(Image_Start)
    const two = texture.load(Image_Start1)
    //星星的数据


    //声明点的参数
    points = [
        [[0.5, 100, 0.75], one, 50],
        [[0, 0, 1], two, 20],
    ]
    //创建1500星星
    for (let i = 0; i < 1500; i++) {
        const x = THREE.MathUtils.randFloatSpread(width)
        const y = _.random(0, height / 2)
        const z = _.random(-depth / 2, depth / 2)
        vertices.push(x, y, z);
    }
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    //材质
    for (let i = 0; i < points.length; i++) {
        const color = points[i][0];//颜色
        const sprite = points[i][1]; //纹理
        const size = points[i][2];//大小
        pointsMaterial[i] = new THREE.PointsMaterial({
            size: size,
            map: sprite,
            transparent: true,
            depthWrite: false,
            depthTest: false,
            blending: THREE.AdditiveBlending
        });
        //设置颜色
        pointsMaterial[i].color.setHSL(color[0], color[1], color[2]);
        //创建物体
        const partcles = new THREE.Points(geometry, pointsMaterial[i]);
        partcles.rotation.x = Math.random() * 0.2 - 0.15;
        partcles.rotation.y = Math.random() * 0.2 - 0.15;
        partcles.rotation.z = Math.random() * 0.2 - 0.15;
        partcles.position.setZ(-depth);
        partcles.renderOrder = -1;
        pointGeo.push(partcles)
        scene.add(partcles)
    }
    return pointGeo
}
//渲染
const initRender = () => {
    render = new THREE.WebGLRenderer();
    //渲染尺寸
    render.setSize(width, height);
    container.appendChild(render.domElement);
}
let orb;
//轨道控制器
const initOrbitControls = () => {
    orb = new OrbitControls(camera, render.domElement)
    orb.enabled = true
    orb.enableDamping = true;
    orb.dampingFactor = 0.01;
    orb.update()
}
//创建一个固定的宇航员位置
const initAstronaut = () => {
    //宇航员图片 == 材质
    const cubeGeometry = new THREE.PlaneGeometry(200, 200, 200);
    const texture = new THREE.TextureLoader().load(PeopleAstronaut) // 导入纹理
    const material = new THREE.MeshBasicMaterial({
        map: texture,// 颜色贴图
        opacity: 1,
        transparent: true, //// 启用透明
    }); // 基础网格材质

    const cube = new THREE.Mesh(cubeGeometry, material,)
    cube.position.set(260, -140, 220);
    scene.add(cube)
}
// 创建星云效果
const initNebulas = () => {
    const textureLoader = new THREE.TextureLoader();
    const nebulaMaterials = [
        textureLoader.load(Image_Nebula1),
        textureLoader.load(Image_Nebula2)
    ];

    // 创建5-8个随机星云
    const nebulaCount = Math.floor(Math.random() * 4) + 5;

    for (let i = 0; i < nebulaCount; i++) {
        const size = Math.random() * 300 + 200; // 随机大小200-500
        const geometry = new THREE.PlaneGeometry(size, size);
        const material = new THREE.MeshBasicMaterial({
            map: nebulaMaterials[Math.floor(Math.random() * nebulaMaterials.length)],
            transparent: true,
            opacity: Math.random() * 0.5 + 0.2, // 随机透明度0.2-0.7
            depthWrite: false,
            blending: THREE.AdditiveBlending
        });

        const nebula = new THREE.Mesh(geometry, material);

        // 随机位置
        nebula.position.set(
            THREE.MathUtils.randFloatSpread(width * 1.5),
            THREE.MathUtils.randFloatSpread(height),
            _.random(-depth, -depth / 2)
        );

        // 随机旋转
        nebula.rotation.z = Math.random() * Math.PI * 2;

        // 随机缩放
        const scale = Math.random() * 1 + 0.5;
        nebula.scale.set(scale, scale, 1);

        nebulaMeshes.push(nebula);
        scene.add(nebula);
    }
}

//动画刷新
const animate = () => {
    requestAnimationFrame(animate);
    renderSpherRotate();

    // 星星移动逻辑
    pointGeo.forEach(particles => {
        particles.position.z += moveSpeed;
        if (particles.position.z > z + 1000) {
            particles.position.z = -depth;
        }
    });

    // 星云移动和旋转效果
    nebulaMeshes.forEach(nebula => {
        nebula.position.z += moveSpeed * 0.5; // 星云移动速度为星星的一半
        nebula.rotation.z += 0.001; // 缓慢旋转

        // 当星云移动到摄像机前方时，重置回远处
        if (nebula.position.z > z + 1000) {
            nebula.position.z = -depth;
            // 重新随机位置
            nebula.position.x = THREE.MathUtils.randFloatSpread(width * 1.5);
            nebula.position.y = THREE.MathUtils.randFloatSpread(height);
            // 重新随机透明度
            nebula.material.opacity = Math.random() * 0.5 + 0.2;
        }
    });

    orb.update();
    render.render(scene, camera);
}

// 添加速度控制函数（可选）
const setMoveSpeed = (speed) => {
    moveSpeed = speed;
}

</script>

<style scoped lang="less">
#container {
    width: 100%;
    height: 100vh;
}
</style>
