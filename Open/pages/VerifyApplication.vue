<template>
    <div class="verifyAppWrapper">
        <div class="verifyApp" v-if="!applicationToggle && !application">
            <div class="verifyAppTitle">{{ $t('info.header9') }}</div>
            <p class="verifyAppDesc" v-html="$t('teams.team.applyPop.desc')"></p>
            <p class="verifyAppDesc"><a href="/info#verify" class="verifyAppInfoLink">{{ $t('teams.team.applyPop.read') }}</a></p>
            <div v-if="user.id === team.captain" class="teamVerifiedText verifyApply" @click="applicationToggler">{{ $t('teams.team.applyPop.apply') }}</div>
        </div>
        <div class="verifyApp questions" v-else-if="applicationToggle && (!application || application.status === 'PENDING')">
            <div class="verifyAppTitle">{{ $t('info.header9') }}</div>
            <p class="verifyAppDesc">{{ $t('verification.sure') }}</p>
            <div class="prevCorsaceQ">
                <p class="verifyAppDesc">{{ $t('verification.prevCorsace') }}</p>
                <input class="prevCorsaceInput" type="radio" id="yes" value="Yes" v-model="prevCorsace">
                <label class="prevCorsaceLabel" for="yes">{{ $t('verification.Yes') }}</label>
                <input class="prevCorsaceInput" type="radio" id="no" value="No" v-model="prevCorsace">
                <label class="prevCorsaceLabel" for="no">{{ $t('verification.No') }}</label>
            </div>
            <div class="prevTourneysQ">
                <p class="verifyAppDesc">{{ $t('verification.prevTourneys') }}</p>
                <input class="verifyAppInput" v-model="prevTourney1" v-bind:placeholder="$t('verification.firstTourney')">
                <input class="verifyAppInput" v-model="prevTourney2" v-bind:placeholder="$t('verification.secondTourney')">
                <input class="verifyAppInput" v-model="prevTourney3" v-bind:placeholder="$t('verification.thirdTourney')">
            </div>
            <div class="extraInfo">
                <p class="verifyAppDesc extra">{{ $t('verification.extraInfo') }}</p>
                <textarea class="verifyAppInput extraInput" v-model="extraInfo" v-bind:placeholder="$t('verification.extraInfoInput')" maxlength="200"></textarea>
                <div class="remainingChar" :style="textLimit">{{ extraInfo.length }}/200</div>
            </div>
            <div class="prevNamesQ">
                <p class="verifyAppDesc">{{ $t('verification.prevNames') }}</p>
                <input class="verifyAppInput" v-model="prevName1" v-bind:placeholder="$t('verification.firstName')">
                <input class="verifyAppInput" v-model="prevName2" v-bind:placeholder="$t('verification.secondName')">
                <input class="verifyAppInput" v-model="prevName3" v-bind:placeholder="$t('verification.thirdName')">
            </div>
            <div v-if="user.id === team.captain && !application" class="teamVerifiedText verifyApply" @click="sendApplication">{{ $t('verification.submit') }}</div>
            <div v-else-if="user.id === team.captain && application.status === 'PENDING'" class="teamVerifiedText verifyApply" @click="editApplication">{{ $t('verification.edit') }}</div>
        </div>
    </div>
</template>

<script>
import axios from "axios";
import regeneratorRuntime from "regenerator-runtime";

export default {
    data: () => ({
        applicationData: {},
        applicationToggle: false,
        application: {},
        prevCorsace: "",
        prevTourney1: "",
        prevTourney2: "",
        prevTourney3: "",
        prevName1: "",
        prevName2: "",
        prevName3: "",
        extraInfo: "",
    }),
    props: {
        team: Object,
        user: Object,
    },
    created: async function() {
        this.application = (await axios.get("/api/team/verification/application")).data.application;
        if(this.application && this.application.status === "PENDING") {
            this.applicationToggle = true;
            if(this.application.prevCorsace) {
                this.prevCorsace = "Yes";
            } else {
                this.prevCorsace = "No";
            }
            if(this.application.prevTourneys[0]) {
                this.prevTourney1 = this.application.prevTourneys[0]
            }
            if(this.application.prevTourneys[1]) {
                this.prevTourney2 = this.application.prevTourneys[1]
            }
            if(this.application.prevTourneys[2]) {
                this.prevTourney3 = this.application.prevTourneys[2]
            }
            if(this.application.prevNames[0]) {
                this.prevName1 = this.application.prevNames[0]
            }
            if(this.application.prevNames[1]) {
                this.prevName2 = this.application.prevNames[1]
            }
            if(this.application.prevNames[2]) {
                this.prevName3 = this.application.prevNames[2]
            }
            if(this.application.extraInfo) {
                this.extraInfo = this.application.extraInfo;
            } else {
                this.extraInfo = "";
            }
        }
    },
    computed: {
        textLimit: function() {
            if(this.extraInfo.length === 200) {
                return {
                    color: '#ff7d6d',
                }
            } else if(this.extraInfo.length >= 150){
                return {
                    color: '#fff17e',
                }
            }
        }
    },
    methods: {
        applicationToggler: function() {
            if(this.team.isEligible) {
                this.applicationToggle = true;
            } else {
                alert(this.$i18n.messages[this.$i18n.locale].verification.alert);
                this.$emit('toggle');
            }
        },
        sendApplication: async function() {
            await this.createData();
            try {
                await axios.post("/api/team/verification/apply", this.applicationData);
            } catch(e) {
                alert("An error occurred! " + e);
            }
            this.applicationToggle = false;
            this.application = (await axios.get("/api/team/verification/application")).data.application;
            this.$emit('toggle');
        },
        editApplication: async function() {
            await this.createData();
            try {
                await axios.patch("/api/team/verification/edit", this.applicationData);
            } catch(e) {
                alert("An error occurred! " + e);
            }
            this.applicationToggle = false;
            this.application = (await axios.get("/api/team/verification/application")).data.application;
            this.$emit('toggle');
        },
        createData: async function() {
            this.applicationData = {
                prevCorsace: this.prevCorsace,
                prevTourneys: [
                    this.prevTourney1.length > 0 ? this.prevTourney1 : null,
                    this.prevTourney2.length > 0 ? this.prevTourney2 : null,
                    this.prevTourney3.length > 0 ? this.prevTourney3 : null
                ],
                prevNames: [
                    this.prevName1.length > 0 ? this.prevName1 : null,
                    this.prevName2.length > 0 ? this.prevName2 : null,
                    this.prevName3.length > 0 ? this.prevName3 : null
                ],
                extraInfo: this.extraInfo.length > 0 ? this.extraInfo : null,
            }
        }
    }
}
</script>

<style>

.verifyAppWrapper {
    position: absolute;
    top: 0;
}

.verifyApp {
    position: absolute;
    top: 280px;
    left: 280px;
    display: grid;
    justify-items: center;
    background-image: url(../../Assets/img/open/textbg.png);
    padding: 13px;
    color: #0090ff;
    z-index: 2;
}

.verifyAppTitle, .verifyAppDesc, .verifyApply {
    grid-column: 1/3;
}

.verifyAppTitle {
    font-size: 18px;
    font-weight: bold;
}

.verifyAppDesc {
    text-align: center;
    font-size: 10px;
}

.verifyAppInfoLink {
    color: #0090ff;
}

.verifyApply {
    cursor: pointer;
}

.questions {
    grid-gap: 6px;
}

.prevCorsaceQ,.prevTourneysQ, .prevNamesQ, .extraInfo {
    position: relative;
    display: grid;
    white-space: normal;
}

.prevTourneysQ {
    grid-row: 3/5;
}

.prevCorsaceQ {
    grid-row: 3/4;
}

.prevNamesQ {
    grid-row: 5/6;
}

.extraInfo {
    grid-row: 4/6;
}

.prevCorsaceInput {
    grid-row: 2/3;
    justify-self: center;
    align-self: center;
    margin: 0;
    margin-bottom: 5px;
    height: 15px;
    width: 15px;
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    display: inline-block;
    position: relative;
    border: 0;
    border-radius: 50px;
    outline: 0;
    background-color: #443e3e;
    color: #8f8f8f;
}

.prevCorsaceInput:checked::before {
    position: absolute;
    content: '\02143';
    transform: rotate(40deg);
    left: 4px;
    font-size: 11px;
}

.prevCorsaceLabel {
    grid-row: 3/4;
    justify-self: center;
    font-size: 14px;
}

.verifyAppInput {
    grid-column: 1/3;
    background-color: #443e3e;
    outline: 0;
    border: 0;
    text-align: center;
    color: #8f8f8f;
    font: inherit;
    font-size: 12px;
    margin: 5px;
}

.verifyAppInput::placeholder {
    font-style: italic;
}

.remainingChar {
    cursor: default;
    font-size: 10px;
    text-align: right;
    grid-column: 1/2;
    grid-row: 3/4;
    bottom: 6px;
    left: 6px;
    position: absolute;
}

.extra {
    height: 10px;
}

.extraInput {
    grid-row: 2/4;
}
</style>
