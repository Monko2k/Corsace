<template>
    <div class="localeSwitch">
        <div class="localeCurrent" @click="localeToggle">
            <div class="localeLeft">{{ $i18n.locale }}</div>
            <div class="localeRight"><img class="localeFlag" v-bind:src="$t('flag')"></div>
            <div class="triangle">
                <img v-if="!localeChange" src="../../Assets/img/open/triangle.png">
                <img class="upsideDown" v-if="localeChange" src="../../Assets/img/open/triangle.png">
            </div>
        </div>
        <ul class="dropdown" v-if="localeChange">
            <li class="localeLanguage" v-for="(lang, i) in langs" :key="`Lang${i}`" :value="lang" @click="$i18n.locale = lang; localeChange = false; setLanguage(lang);">
                <div class="localeLeft">
                    {{ lang }}
                </div>
                <div class="localeRight">
                    <img class="localeFlag" v-bind:src="$i18n.messages[lang].flag">
                </div>
            </li>
        </ul>
    </div>
</template>

<script>
import Locale from "../assets/locale";
//import ClickOutside from 'vue-click-outside';

export default {
    data: () => ({
        langs: Object.keys(Locale),
        localeChange: false,
    }),
    methods: {
        setLanguage: (lang) => {
            localStorage.setItem('lang', lang);
        },
        localeClose: function() {
            this.localeChange = false;
        },
        localeToggle: function() {
            this.localeChange = !this.localeChange;
        }
    },
    directives: {
        //ClickOutside,
    },
}
</script>

<style>
.localeSwitch {
    display:flex;
    justify-content: center;
    align-items: center;
    text-transform: uppercase;
    padding: 0 10px;
}

.localeLanguage, .localeCurrent {
    font-size: 19px;
    color: #73797e;
    font-weight: bold;
    cursor: pointer;
}

.localeCurrent {
    display: flex;
    align-items: center;	
}

.localeFlag {
    padding: 0 3px;
    height: 17px;
}

.localeLeft {
    position: relative;
    right: 2px;
    float: left;
    width: 50%;
}

.localeRight {
    position: relative;
    left: 2px;
    float: right;
    width: 50%;
    text-align: left;
}

.triangle {
    display: flex;
    padding-left: 4px;
}

.upsideDown {
    transform: rotate(180deg);
}

.dropdown {
    background-color: #101010;
    background-image: none;
    border-radius: 0 0 20px 20px;
    display: flex;
    align-items: center;
    flex-direction: column;
    position: absolute;
    top: 84px;
    padding: 17px 17px 0 17px;
    z-index: 99;
    flex-wrap: wrap;
    margin: 0;
}

.dropdown .localeLanguage {
    list-style: none;
    margin: 0 0 20px 0;
}
</style>
