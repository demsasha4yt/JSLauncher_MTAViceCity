<template>
    <button class="main-btn launch-btn">{{ text }}</button>
</template>

<script>
    export default {
        props:['text'],
        name: "LaunchButton"
    }
</script>

<style scoped>
    .launch-btn{
        left: 430px;
        background-color: rgba(104,53,232, 1);
    }
</style>
