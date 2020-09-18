<template>
    <div class="init">
        <div class="init-wrap">
            <div class="initLogo" >
                <img src="../assets/logoInit.png">
            </div>
            <div class="state">
                <div class="state-text">
                    {{ProgressState}}
                </div>
                <div class="state-ring">
                    <div class="lds-ring"><div></div><div></div><div></div><div></div></div>
                </div>
            </div>

        </div>
    </div>
</template>

<script>
    import {mapGetters, mapActions} from "vuex"

    export default {
        name: "InitPage",
        data: function () {
            return {
                header: "MTA Vice City",
            }
        },
        computed: {
            ...mapGetters(["ProgressValue", "ProgressState"])
        },
        mounted () {
            this.$electron.ipcRenderer.on('navigate', (e, routePath) => {
                this.$router.push(routePath)
            })
        }
    }

</script>

<style scoped>
    .state{
        color: white;
        display: block;
        text-align: center;
        font-size: 0.9rem;
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
</style>
