<template>
  <div id="container"></div>
</template>

<script setup >
import { onMounted } from 'vue';
import * as THREE from 'three';
//容器
var container; 
onMounted(() => {
     container=document.getElementById('container')
     initScene()
})
//初始化场景
const initScene = ()=>{
    const scene = new THREE.Scene();
    const fog = new THREE.Fog(0x000000, 1, 10000);
}
//添加背景
const initSceneBg = ()=>{
    //纹理
    new THREE.TextureLoader().load();
}
</script>

<style scoped lang="less">
#container {
    width: 100%;
    height: 100vh;
}

</style>
