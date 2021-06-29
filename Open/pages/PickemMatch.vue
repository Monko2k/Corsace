<template>
    <div class="pickemMatch" :class="{pickemFinished: match.winnerName}">
        <div class="pickemMatchHeader">
            <router-link class="pickemMatchID" :to="`/match/${match.matchID}`">
                {{match.matchID}}
            </router-link>
            <div class="pickemMatchVs" @click="pickemInfo">
                <span class="pickemTeam" :class="{pickemWinner: match.winnerName && match.teamAName === match.winnerName}" >{{match.teamAName}}</span> vs <span class="pickemTeam" :class="{pickemWinner: match.winnerName && match.teamBName === match.winnerName}">{{match.teamBName}}</span>
            </div>
        </div>
        <loading v-if="loading" style="position: relative;"></loading>
        <select class="pickemMatchDropdown" v-model="winner" @change="sendWinner" :disabled="done" v-if="!loading"
        :class="{
            pickemCorrect: match.winnerName && match.winnerName === winner,
            pickemIncorrect: match.winnerName && !(match.winnerName === winner)
        }">
            <option disabled value="">Please select a winner</option>
            <option :value="match.teamAName">{{match.teamAName}}</option>
            <option :value="match.teamBName">{{match.teamBName}}</option>
        </select>
        <div class="pickemMatchPoints pickemMatchSet" v-if="winner && !loading">
            Match point: 
            {{reqToWin}} -
            <select class="pickemPointsDropdown" v-model="matchPoint" @change="updatePoints('match')" :disabled="done"
            :class="{
                pickemCorrect: match.winnerName && matchPoint === Math.min(match.teamAScore, match.teamBScore),
                pickemIncorrect: match.winnerName && !(matchPoint === Math.min(match.teamAScore, match.teamBScore))
            }">
                <option v-for="j in reqToWin" :key="j" :value="j-1">{{j-1}}</option>
            </select>
        </div>
        <div class="pickemMatchPoints" v-if="winner && !loading">
            <div class="pickemMatchSet" v-for="i in numberOfSets" :key="i">
                Set {{i}}: 4 -
                <select class="pickemPointsDropdown" v-model="setPoints[i-1]" @change="updatePoints('set')" :disabled="done" 
                :class="{
                    pickemCorrect: match.winnerName && setPoints[i-1] === Math.min(match.teamASetScores[i-1], match.teamBSetScores[i-1]),
                    pickemIncorrect: match.winnerName && !(setPoints[i-1] === Math.min(match.teamASetScores[i-1], match.teamBSetScores[i-1]))
                }">
                    <option v-for="j in 4" :key="j" :value="j-1">{{j-1}}</option>
                </select>
            </div>
        </div>
        Points Received: {{ pickem ? pickem.pickemPoints : 0 }}
        <div class="pickemTrashCan" v-if="id && !match.winnerName">
            <img @click="remove" src="../../Assets/img/open/delete.png">
        </div>
    </div>
</template>

<script>
import axios from 'axios';
import Loading from "./Loading";

export default {
    components: {
        Loading,
    },
    data: () => ({
        id: "",
        winner: "",
        setPoints: [],
        matchPoint: null,
        loading: false,
    }),
    props: {
        match: Object,
        pickem: Object,
    },
    created: async function() {
        if (this.pickem) {
            this.id = this.pickem.id;
            this.winner = this.pickem.winner === this.match.teamAName ? this.match.teamAName : this.match.teamBName;
            this.setPoints = this.pickem.setPoints;
            this.matchPoint = this.pickem.matchPoint;
        }
    },
    computed: {
        done: function() {
            return Date.now() > Date.parse(this.match.date) || this.match.winnerName;
        },
        numberOfSets: function() {
            return (this.matchPoint ?? 0) + (this.match.bestOf+1)/2;
        },
        reqToWin: function() {
            return (this.match.bestOf+1)/2;
        },
    },
    methods: {
        pickemInfo: function() {
            this.$emit('pickem', this.match);
        },
        sendWinner: async function() {
            const data = {
                id: this.match.matchID,
                winner: this.winner,
                pickem: this.id ? this.id : undefined,
            }
            this.loading = true;
            try {
                const errCheck = (await axios.patch('/api/pickems/winner', data)).data;
                if (errCheck.error)
                    alert(errCheck.error.name + ": " + errCheck.error.message);
                else {
                    const pickem = errCheck.pickem;
                    this.id = pickem.id;
                    this.winner = pickem.winner === this.match.teamAName ? this.match.teamAName : this.match.teamBName;
                    this.setPoints = pickem.setPoints;
                    this.matchPoint = pickem.matchPoint;
                }
            } catch (e) {
                alert(e)
            }
            this.loading = false;
        },
        updatePoints: async function(type) {
            const data = {
                id: this.match.matchID,
                score: type === 'set' ? this.setPoints : this.matchPoint,
                pickem: this.id,
                type
            }
            this.loading = true;
            try {
                const errCheck = (await axios.patch('/api/pickems/score', data)).data;
                if (errCheck.error)
                    alert(errCheck.error.name + ": " + errCheck.error.message);
                else {
                    const pickem = errCheck.pickem;
                    this.id = pickem.id;
                    this.winner = pickem.winner === this.match.teamAName ? this.match.teamAName : this.match.teamBName;
                    this.setPoints = pickem.setPoints;
                    this.matchPoint = pickem.matchPoint;
                }
                
            } catch (e) {
                alert(e)
            }
            this.loading = false;
        },
        remove: async function() {
            if (!this.winner)
                return alert("this doesn't have a pickem yet!")
            this.loading = true;
            try {
                await axios.delete("/api/pickems/delete?pickem=" + this.id);
                this.id = "";
                this.winner = "";
                this.setPoints = [];
                this.matchPoint = null;
            } catch (e) {
                alert(e)
            }
            this.loading = false;
            this.$emit('refresh');
        },
    },
}
</script>

<style>
.pickemMatch {
    background-color: #202020;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    padding: 10px;
    margin: 10px;
    width: 350px;
}

.pickemMatchHeader {
    display: flex;
    align-items: center;
    justify-content: center;
}

.pickemMatchID {
    padding-right: 10px;
    font-weight: bold;
    color: #b64c4c;
    font-size: 1.5rem;
}

.pickemMatchVs {
    cursor: pointer;
}

.pickemTeam {
    font-weight: bold;
}

.pickemMatchDropdown, .pickemPointsDropdown {
    border: 0;
    font: inherit;
    background-color: black;
    color: white;
    outline: none;
    cursor: pointer;
    position: relative;
    left: -4px;
}

.pickemMatchDropdown {
    margin: 10px;
}

.pickemMatchDropdown > option {
    text-align: center;
}

.pickemMatchSet {
    text-align: start;
    background-color: black;
    margin: 0 10px 10px;
    padding: 10px;
}

.pickemFinished {
    background-color: black;
}

.pickemWinner {
    color: #ffe075;
    text-shadow: 0px 0px 10px rgba(255,224,117, 0.75);
}

.pickemCorrect {
    color: #5ec949;
}

.pickemIncorrect {
    color: #b64c4c;
}

.pickemTrashCan {
    margin-top: 10px;
    cursor: pointer;
}
</style>