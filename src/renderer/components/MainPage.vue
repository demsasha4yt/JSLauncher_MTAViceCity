<template>
    <div class="main-page">
        <div class="drag"></div>
        <button @click="closeClick" class="header-btn active-header close-btn"></button>
        <button class="header-btn quad-btn"></button>
        <button @click="minimizeClick" class="header-btn active-header minimize-btn"></button>
        <input class="nickname-input" placeholder="Player_Name" :value="PlayerName">
        <button @click="launchClick" class="main-btn launch-btn" :disabled="!LaunchButtonEnabled">{{ LaunchButtonText }}</button>
        <div class="version-launcher">launcher v.{{LauncherVersion}} | client v. {{ClientVersion}}</div>
        <button @click="settingsClick" class="main-btn settings-btn">{{ SettingsButtonText }}</button>
        <div class="app-name">{{ header }}</div>
        <div class="progress">
            <div class="progress-state">{{ProgressState}}   </div>
            <div class="progress-bar">
                <div class="percentage" :style="{'width' : ProgressValue + '%'}"></div>
            </div>
        </div>
    </div>
</template>

<script>
    import LaunchButton from "./MainPage/LaunchButton"

    import {mapGetters, mapActions} from "vuex"
    const config = require('../../config');

    export default {
        name: "main-page",
        components: {LaunchButton},
        computed: {
            ...mapGetters(["PlayerName",
                "ProgressValue",
                "ProgressState",
                "LauncherVersion",
                "ClientVersion",
                "SettingsButtonText",
                "LaunchButtonEnabled",
                "LaunchButtonText",
                "SettingsButtonEnabled"
            ]),

            percent: function () {
                return this.ProgressValue
            }
        },
        data: function () {
            return{
                header: "MTA Vice City",
            }
        },
        methods:{
            ...mapActions(['LaunchButtonHandle', 'SettingsButtonHandle', 'CloseBtnHandle', 'MinimizeBtnHandle']),
            closeClick: function () {
                console.log('click on close')
                this.CloseBtnHandle()
            },
            minimizeClick: function () {
                console.log('click on minimize')
                    this.MinimizeBtnHandle()
            },
            launchClick: function () {
                console.log('launch click')
                var input = document.querySelector('.nickname-input');
                let nickname = input.value;
                this.$store.dispatch('LaunchButtonHandle', nickname)
            },
            settingsClick: function () {
                this.$store.dispatch('SettingsButtonHandle');
            }
        },
        mounted() {
            this.$electron.ipcRenderer.on('navigate', (e, routePath) => {
                this.$router.push(routePath)
            });

            if (config.develop === true){
                this.header = "MTA Vice City [DEVELOP]";
            }
        }
    }
</script>

<style scoped>
    .version-launcher{
        color: white;
        position: absolute;
        top: 335px;
        left: 440px;
        font-size: 0.6rem;
    }
    .progress{
        height: 55px;
        width: 500px;
        position: absolute;
        top:291px;
        left: 102px;
        color: white;
        font-family: Arial;
        font-size: 0.75rem;
    }
    .progress-state{
        margin: 3px 10px;
    }

    .progress-bar{
        position: relative;
        margin: 5px auto;
        width: 490px;
        height: 20px;
        background-color: #452B53;
        border-radius: 3px;
        overflow: hidden;
        border: 1px solid black;
    }

    .percentage{
        position: absolute;
        top: 1px; left: 1px; right: 1px;
        display: block;
        height: 100%;
        border-radius: 3px;
        background-color: blueviolet;
        background-size: 20px 20px;
        background-image: linear-gradient(135deg, rgba(255,255,255, 0.15) 25%, transparent 25%,
                        transparent 50%, rgba(255,255,255, 0.15) 50%,
                        rgba(255, 255, 255, 0.15) 75%, transparent 75%,
                        transparent);
    }

    .app-name{
        color: white;
        position: absolute;
        top: 15px;
        left: 120px;
        font-family: Arial,sans-serif;
        font-size: 14px;
    }

    .main-btn
    {
        position: absolute;
        top: 230px;
        width:148px;
        height: 52px;
        border: none;
        border-radius:3px;
        color: white;
        font-size:21px;
        opacity: 0.9;
    }

    .main-btn:hover{
        opacity: 1;
        cursor: pointer;
    }

    .main-btn:focus
    {
        outline: none;
    }

    .launch-btn{
        left: 430px;
        background-color: rgba(104,53,232, 1);
    }

    .settings-btn{
        left: 260px;
        background-color: rgba(53, 106, 231, 1);
    }

    .nickname-input{
        position: absolute;
        top:75px;
        left: 400px;
        width:165px;
        height: 23px;
        background-color: #452B53;
        border: 1px solid black;
        color: white;
        border-radius: 3px;
        -webkit-border-radius: 3px;
        -moz-border-radius: 3px;
        -khtml-border-radius: 3px;
        padding: 2px 2px 2px 5px;
    }

    .nickname-input::placeholder{
        color:whitesmoke;
    }

    .main-page{
        width: 595px;
        height: 338px;
        background-image:  url("../assets/logobackground.png");
        -moz-background-size: 100%;
        -webkit-background-size: 100%; /* Safari 3.1+ и Chrome 4.0+ */
        -o-background-size: 100%; /* Opera 9.6+ */
        background-size: 100%; /* Современные браузеры */
    }

    .drag{
        position: absolute;
        width: 501px;
        height: 30px;
        left:102px;
        -webkit-app-region: drag;
    }

    .header-btn{
        width: 12px;
        height: 12px;
        position: absolute;
        top: 16px;
        -webkit-filter: invert(100%);
        -moz-background-size: 100%;
        -webkit-background-size: 100%; /* Safari 3.1+ и Chrome 4.0+ */
        -o-background-size: 100%; /* Opera 9.6+ */
        background-size: 100%; /* Современные браузеры */
        background-color: rgba(0,0,0,0);
        border: none;
        -webkit-app-region: no-drag;
    }

    .header-btn:focus{
        outline: none;
    }

    .active-header:hover{
        cursor: pointer;
    }

    .active-header:active{
        border: none;
    }

    .close-btn{
        background-image: url("../assets/icons/iconfinder_exit-delete-remove-close-x_2931151.png");
        left:576px;
    }

    .minimize-btn{
        background-image: url("../assets/icons/iconfinder_minus-remove-delete-minimize_2931142.png");
        left:524px;
    }

    .quad-btn{
        background-image: url("../assets/icons/iconfinder_box-square-form-uncheck-rectangle_3209268.png");
        left:550px;
    }

    h3 {
        margin: 40px 0 0;
    }
    ul {
        list-style-type: none;
        padding: 0;
    }
    li {
        display: inline-block;
        margin: 0 10px;
    }
    a {
        color: #42b983;
    }
</style>

