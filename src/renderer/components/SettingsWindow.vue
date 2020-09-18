<template>
    <div class="settings">
        <div class="settings-wrap">
            <div class="drag"></div>
            <div class="app-name">{{ header }}</div>
            <router-link to="/main"><button @click="closeClick" class="header-btn active-header close-btn"></button></router-link>
            <button class="header-btn quad-btn"></button>
            <button @click="minimizeClick" class="header-btn active-header minimize-btn"></button>
            <div class='settings-s'>
                <div class="one-setting">
                    <span>ENB:</span>
                    <select v-model="selected">
                        <option v-for="option in EnbList" v-bind:value="option._id">
                            {{ option.name }} ({{ option.description }})
                        </option>
                    </select>
                </div>
            </div>
            <button @click="saveSettings" class="main-btn save-btn">{{ saveBtnText }}</button>
        </div>
    </div>
</template>

<script>
    import {mapGetters, mapActions} from "vuex"

    export default {
        name: "SettingsWindow",
        data: function () {
            return {
                header: "Настройки MTA Vice City",
                saveBtnText: "Сохранить",
                items: ['Foo', 'Bar', 'Fizz', 'Buzz'],
                selected: '',
            }
        },
        methods: {
            ...mapActions(['MinimizeBtnHandle']),
            minimizeClick: function () {
                this.MinimizeBtnHandle()
            },
            saveSettings(){
                let toApplySettings = [];
                this.$store.dispatch('setToApplySettings', []);
                let selectedEnb = this.EnbList[this.EnbList.findIndex(x => x._id === this.selected)];
                let currentEnb = this.EnbList[this.EnbList.findIndex(x => x.name === this.$store.getters.Enb)];
                if (this.$store.getters.Enb !== selectedEnb.name){
                    let setting = {
                        type: "installEnb",
                        enb: selectedEnb,
                        oldEnb: currentEnb
                    };
                    toApplySettings.push(setting);
                    this.$store.dispatch('pushToApplySettings', setting);
                }
                if (toApplySettings.length !== 0)
                    this.$store.dispatch('setProgramState', 'apply-settings');
                else { this.$store.dispatch('setProgramState', 'ready'); }
                this.$router.push('/main');
            },
            closeClick(){
                this.$store.dispatch('setProgramState', 'ready');
            }
        },
        computed: {
            EnbList(){
                return this.$store.getters.EnbList;
            }
        },
        mounted() {
            let currentEnbName = this.$store.getters.Enb;

            const index = this.EnbList.findIndex(x => x.name === currentEnbName)
            let currentEnb = this.EnbList[index];
            console.log(currentEnb);
            this.selected = currentEnb._id;

            this.$electron.ipcRenderer.on('navigate', (e, routePath) => {
                this.$router.push(routePath)
            })
        }
    }
</script>

<style scoped>
    .settings-s{
        position: absolute;
        display: flex;
        flex-direction: column;
        top:50px;
        color: white;
        width: 500px;
        height: 180px;
    }
    .one-setting{
        display: flex;
        flex-direction: row;
        justify-content: space-around;
    }
    .one-setting select{
        display: block;
        justify-content: space-around;
        width: 200px;
        height: 20px;
    }
    .settings{

        width: 595px;
        height: 300px;
    }
    .settings-wrap{
        width: 500px;
        height: 300px;
        float: right;
        background-color: rgba(43,43,43, 1);
    }
    .app-name{
        color: white;
        position: absolute;
        top: 15px;
        left: 120px;
        font-family: Arial,sans-serif;
        font-size: 14px;
    }
    .drag{
        position: absolute;
        width: 500px;
        height: 30px;
        left:103px;
        top:8px;
        -webkit-app-region: drag;
        background-color: #452B53;
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

    .main-btn
    {
        position: absolute;
        top: 240px;
        width:130px;
        height: 48px;
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

    .save-btn{
        left: 430px;
        background-color: rgba(104,53,232, 1);
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
</style>
