<template>
    <div class="init">
        <div class="init-wrap">
            <img src="../assets/install-icon.png" alt="" id="install-icon">
            <div class="NotFound">
                <h2>Выбор директории:</h2>
                <p>Выберите директорию с MTA Vice City</p>
            </div>
            <div class="folder-path">
                <div class="path"> <p>{{installPath}}</p></div>
                <button @click="select" class="select-folder"><span id="first">Выбрать</span><span id="second"> > </span></button>
            </div>
            <button @click="selectDone" class="main-btn launch-btn"> ВЫБРАТЬ </button>
            <div class="havegta">
                <router-link to="notfound"><span id="suricen">*</span><span id="nadp"> у меня нет установленной MTA Vice City</span></router-link>
            </div>
        </div>
    </div>
</template>

<script>
    import {mapGetters} from "vuex"

    export default {
        name: "InitPage",
        data: function () {
            return {
                header: "MTA Vice City",
                installPath: ""
            }
        },
        computed: {
            ...mapGetters(["ProgressValue", "ProgressState"])
        },
        mounted () {
            this.$electron.ipcRenderer.on('navigate', (e, routePath) => {
                this.$router.push(routePath)
            })
            this.installPath = "Выберите директорию с игрой"
        },
        methods:{
            select: function () {
                const {dialog} = require('electron').remote;
                this.installPath = dialog.showOpenDialog({properties: ['openDirectory']})[0]
            },
            selectDone: function () {
                let _path = this.installPath;
                if (_path === null)
                    return null;
                // TODO add handle in case of path wrong
                console.log((_path));
                this.$store.dispatch('haveGtaSelect', _path);
            }
        }
    }

</script>


<style scoped>
    @font-face {
        font-family: averta;
        src: url("../assets/averta.otf") format("opentype");
    }
    @font-face {
        font-family: averta-bold-italic;
        src: url("../assets/averta-bold-italic.otf") format("opentype");
    }
    @font-face {
        font-family: averta-regular;
        src: url("../assets/averta-regular.otf") format("opentype");
    }
    @font-face {
        font-family: averta-bold;
        src: url("../assets/averta-bold.otf") format("opentype");
    }
    @font-face {
        font-family: averta-regulr-italic;
        src: url("../assets/averta-regular-italic.otf") format("opentype");
    }

    #install-icon{
        position: absolute;
        left: 480px;
        top: -8px;
    }

    .NotFound{
        font-family: averta, serif;
        margin: 20px;
        color: white;
        display: block;
        font-size: 0.9rem;
    }

    .NotFound h2{
        font-family: averta-bold-italic, serif;
        font-size: 24px;
    }

    .NotFound p{
        font-family: averta-regular,serif;
        position: relative;
        bottom: 10px;
        font-size: 14px;
    }

    .folder-path{
        margin: 20px;
        -webkit-app-region: no-drag;
    }

    .path {
        border: #452B53 solid 1px;
        background-color: #452B53;
        color: #c2c2c2;
        border-radius: 3px;
        justify-content: space-around;
        font-family: averta-regular, serif;
    }

    .path p{
        padding: 0 10px;
        font-size: 0.8rem;
    }

    .select-folder{
        font-family: averta-bold, serif;
        font-size: 19px;
        justify-content: space-between;
        color: white;
        border: none;
        border-radius:8px;
        box-shadow: blue 1px 1px;
        width:180px;
        height: 30px;
        background-color: rgba(129, 26, 183, 1);
        margin: 20px auto;
        opacity: 0.9;
    }

    .select-folder:hover{
        opacity: 1;
    }

    .state-ring{
        padding: 10px;
    }

    .init{
        width: 595px;
        height: 300px;
    }

    .initLogo {
        height: 190px;
        width: 260px;
        display: block;
        margin: 10px auto;
    }
    .initLogo img{
        height: 100%;
        width: auto;
    }
    .init-wrap{
        width: 400px;
        height: 300px;
        float: right;
        background-color: rgba(43,43,43, 1);
        -webkit-app-region: drag;
    }

    .lds-ring {
        display: inline-block;
        position: relative;
        width: 30px;
        height: 30px;
    }
    .lds-ring div {
        box-sizing: border-box;
        display: block;
        position: absolute;
        width: 30px;
        height: 30px;
        margin: 6px;
        border: 6px solid #fff;
        border-radius: 50%;
        animation: lds-ring 2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
        border-color: #fff transparent transparent transparent;
    }
    .lds-ring div:nth-child(1) {
        animation-delay: -0.45s;
    }
    .lds-ring div:nth-child(2) {
        animation-delay: -0.3s;
    }
    .lds-ring div:nth-child(3) {
        animation-delay: -0.15s;
    }
    @keyframes lds-ring {
        0% {
            transform: rotate(0deg);
        }
        100% {
            transform: rotate(360deg);
        }
    }
    .main-btn
    {
        font-family: averta-bold, serif;
        -webkit-app-region: no-drag;
        background-image: url("../assets/shesterenki.png");
        background-repeat: no-repeat;
        background-size: 100px;
        background-position: left;
        background-position-x: -30px;
        position: absolute;
        top: 210px;
        width:160px;
        height: 55px;
        border: none;
        border-radius:3px;
        color: white;
        font-size:20px;
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
        background-color: rgba(97, 48, 215, 1);
    }
    .havegta {
        font-family: averta-regulr-italic, serif;
        font-size: 12px;
        -webkit-app-region: no-drag;
        position: absolute;
        top: 288px;
        left: 210px;
        color: white;
        text-decoration: none;
    }

    .havegta span{
        font-family: averta-bold-italic, serif;
        font-style: normal;
    }

    .havegta #suricen{
        color: red;
    }

    a {
        color: white;
        text-decoration: none;
    }
    a:hover{
        color: #c2c2c2;
    }
</style>
