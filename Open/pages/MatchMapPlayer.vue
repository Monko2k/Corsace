<template>
    <div class="matchResultTeamPlayer">
        <div class="matchTeamPlayerInfo" v-if="score && !edit">
            <a :href="score ? `https://osu.ppy.sh/u/${score.user.username}` : null" target="_blank"><div class="matchTeamPlayerName" :style="result">{{ score.user.username }}</div></a>
            <div class="matchTeamPlayerMods" v-if="score.mods && !edit">+{{ score.mods }}</div>
        </div>
        <div class="score" v-if="score && !edit">
            <div class="fullScore" :style="result">{{ score ? score.score.toLocaleString("en-EN").replace(/\,/g, ' ') : '0' }}</div>
            <div class="scoreSpecs">
                <div class="scoreCombo">{{ score.combo }}x</div>
                <div class="scoreMiss">{{ score.misses }}m</div>
                <div class="scoreAcc">{{ score.accuracy }}</div>
            </div>
        </div>
        <div class="matchTeamPlayerInfo matchTeamPlayerInfoInput" v-if="edit">
            <input class="matchTeamPlayerName matchTeamPlayerNameInput" :style="result" v-model="username" placeholder="enter name">
            <div class="searchResults matchSearchResults">
                <div v-for="(user, index) in usersFiltered" :key="index">
                    <p class="searchSelection" v-if="username !== (score ? score.user.username : true) && username !== newScore.username" @click="input(user, 'user')">{{ user.username }}</p>
                </div>
            </div>
            <input class="matchTeamPlayerMods matchTeamPlayerModsInput" v-model="modsInput" placeholder="+MODS?">
            <div class="searchResults matchSearchResults modResults" v-if="modsInput !== (score ? score.mods : true) && modsInput !== newScore.mods">
                <div v-for="(mod, index) in modsFiltered" :key="index">
                    <p class="searchSelection" @click="input(mod, 'mod')">{{ mod }}</p>
                </div>
            </div>
        </div>
        <div class="enterScore" v-if="edit && newScore.username !== '' && newScore.scoreNum !== '' && newScore.combo !== '' && newScore.misses !== '' && newScore.accuracy !== ''" @click="sendPlayer"></div>
        <div class="score" v-if="edit">
            <input class="fullScore" :style="result" v-model="scoreNum" placeholder="enter score">
            <div class="searchResults modResults scoreInput" v-if="scoreNum !== '' && (score ? scoreNum !== score.score.toLocaleString('en-EN').replace(/\,/g, ' ') : true) && scoreNum !== newScore.score">
                <div>
                    <p class="searchSelection" @click="input(scoreNum, 'score')">{{ scoreNum }}</p>
                </div>
            </div>
            <div class="scoreSpecs scoreSpecsInput">
                <input class="scoreCombo scoreComboInput" v-model="combo" placeholder="-x">
                <div class="searchResults modResults scoreInput" v-if="combo !== '' && (score ? combo !== score.combo : true) && combo !== newScore.combo">
                    <div>
                        <p class="searchSelection" @click="input(combo, 'combo')">{{ combo }}x</p>
                    </div>
                </div>
                <input class="scoreMiss scoreMissInput" v-model="misses" placeholder="-m">
                <div class="searchResults modResults scoreInput" v-if="misses !== '' && (score ? misses !== score.misses : true) && misses !== newScore.misses">
                    <div>
                        <p class="searchSelection" @click="input(misses, 'miss')">{{ misses }}m</p>
                    </div>
                </div>
                <input class="scoreAcc scoreAccInput" v-model="accuracy" placeholder="--.--%">
                <div class="searchResults modResults scoreInput" v-if="accuracy !== '' && (score ? accuracy !== score.accuracy : true) && accuracy !== newScore.accuracy">
                    <div>
                        <p class="searchSelection" @click="input(accuracy + '%', 'acc')">{{ accuracy }}%</p>
                    </div>
                </div>
            </div>
            <select class="demeritAmountDropdown" v-model="fail" @change="input(fail, 'status')">
                <option disabled value="">Fail?</option>
                <option :value="'yes'">Yes</option>
                <option :value="'no'">No</option>
            </select>
        </div>
    </div>
</template>

<script>
import axios from "axios";
import regeneratorRuntime from "regenerator-runtime";

export default {
    data: () => ({
        mods: [],
        newScore: {
            username: '',
            mods: '',
            score: '',
            combo: '',
            misses: '',
            accuracy: '',
            FC: false,
            fail: false,
        },
        modsInput: '',
        username: '',
        scoreNum: '',
        combo: '',
        misses: '',
        accuracy: '',
        fail: '',
    }),
    props: {
        score: Object,
        edit: Boolean,
        setNum: Number,
        mapNum: Number,
        matchid: String,
        team: String,
    },
    created: function() {
        const basicMods = [ "HD", "HR" ];
        this.mods = this.combinations(basicMods);
        this.mods.push("NM");
        if(this.score) {
            this.newScore = {
                username: this.score.user.username,
                mods: this.score.mods ? this.score.mods : '',
                score: this.score.score,
                scoreID: this.score.id,
                combo: this.score.combo,
                misses: this.score.misses,
                accuracy: this.score.accuracy,
                FC: this.score.FC,
                fail: this.score.fail,
            }
            this.username = this.score.user.username;
            this.scoreNum = this.score.score.toLocaleString("en-EN").replace(/\,/g, ' ');
            this.combo = this.score.combo;
            this.misses = this.score.misses;
            this.accuracy = this.score.accuracy;
            if(this.score.mods) this.modsInput = `+${this.score.mods}`;
        };
    },
    asyncComputed: {
        async usersFiltered() {
            if(this.username !== "" && (this.score ? this.username !== this.score.user.username : true)) {
                const userList = (await axios.get("/api/user/search?regex=" + this.username)).data.users;
                return await userList;
            } else {
                return null;
            }
        },
    },
    computed: {
        result: function() {
            if(this.score) {
                if(this.score.fail) {
                    return {
                        color: '#b64c4c',
                        'text-shadow': '0px 0px 10px rgba(182,76,76, 0.75)'
                    }
                } else if (this.score.FC) {
                    return {
                        color: '#ffe075',
                        'text-shadow': '0px 0px 10px rgba(255,224,117, 0.75)'
                    }
                }
            }
        },
        modsFiltered: function() {
            if(!this.score || !this.score.mods || this.modsInput !== `+${this.score.mods}`) {
                const regex = new RegExp(this.modsInput.split().join(".*"), 'i');
                return this.mods.filter(mod => mod.match(regex));
            } else {
                return null;
            }
        }
    },
    methods: {
        combinations: function(chars) {
            var result = [];
            var f = function(prefix, chars) {
                for (var i = 0; i < chars.length; i++) {
                result.push(prefix + chars[i]);
                f(prefix + chars[i], chars.slice(i + 1));
                }
            }
            f('', chars);
            return result;
        },
        input: function(value, type) {
            switch(type) {
                case "user":
                    this.newScore.username = value.username;
                    this.username = value.username;
                    break;
                case "score":
                    this.newScore.score = parseInt(value, 10);
                    if(parseInt(value, 10) > 1000000) {
                        this.newScore.FC = true;
                    }
                    this.scoreNum = parseInt(value, 10);
                    break;
                case "mod": 
                    this.newScore.mods = value;
                    this.modsInput = value;
                    break;
                case "combo":
                    this.newScore.combo = parseInt(value, 10);
                    this.combo = parseInt(value, 10);
                    break;
                case "miss":
                    this.newScore.misses = parseInt(value, 10);
                    this.misses = parseInt(value, 10);
                    break;
                case "acc":
                    this.newScore.accuracy = value;
                    this.accuracy = value;
                    break;
                case "status":
                    if(value === "yes") {
                        this.newScore.fail = true;
                    } else {
                        this.newScore.fail = false;
                    }
                    break;
            }
        },
        sendPlayer: async function() {
            const data = {
                score: this.newScore,
                match: this.matchid,
                team: this.team,
                mapNum: this.mapNum - 1,
                setNum: this.setNum - 1,
            }
            try {
                await axios.patch("/api/matches/score", data);
                alert("Saved!");
            } catch (e) {
                alert(e);
            } finally {
                this.$emit("refresh");
            }
        }
    }
}
</script>

<style>
.matchResultTeamPlayer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: relative;
}

.matchTeamPlayerInfo {
    display: grid;
    align-items: center;
    grid-auto-flow: column;
    grid-gap: 6px;
    position: relative;
}

.matchTeamPlayerInfoInput {
    width: 6em;
}

.matchTeamPlayerName, .matchTeamPlayerName::placeholder {
    font-size: 22px;
    white-space: nowrap;
}

.matchTeamPlayerNameInput {
    width: 6em;
}

.matchTeamPlayerMods, .matchTeamPlayerMods::placeholder {
    font-size: 13px;
    background: 0;
    outline: 0;
    border: 0;
    font-family: inherit;
}

.matchTeamPlayerModsInput {
    width: 5em;
}

.score {
    display: flex;
    align-items: flex-end;
    flex-direction: column;
}

.fullScore {
    font-size: 16px;
    text-align: right;
}

.scoreSpecs {
    font-size: 12px;
    display: grid;
    grid-auto-flow: column;
    grid-gap: 6px;
}

.scoreSpecsInput {
    width: 8em;
}

.matchTeamPlayerMods, .matchTeamPlayerMods::placeholder,  .scoreSpecs {
    color: #866662;
    font-weight: bold;
}

.matchTeamPlayerName, .matchTeamPlayerName::placeholder, .fullScore, .fullScore::placeholder {
    letter-spacing: 0.3px;
    color: #c8cfd5;
    text-shadow: 0px 0px 10px rgba(200,207,213, 0.75);
    border: 0;
    outline: 0;
    background: 0;
    font-family: inherit;
}

.modResults {
    left: 0;
    top: 115%;
}

.scoreCombo, .scoreMiss, .scoreAcc, .scoreCombo::placeholder, .scoreMiss::placeholder, .scoreAcc::placeholder {
    background: 0;
    border: 0;
    outline: 0;
    font: inherit;
    color: inherit;
}

.scoreComboInput {
    width: 2em;
}

.scoreAccInput {
    width: 3em;
}

.scoreMissInput {
    width: 1.5em;
    padding: 0 3px
}

.enterScore {
    cursor: pointer;
    margin: auto;
    left: 0;
    top: 0;
    right: 0;
    position: relative;
    width: 7px;
    height: 7px;
    border-radius: 5px;
    background-color: #0090ff;
}

.scoreInput {
    z-index: 2;
}
</style>