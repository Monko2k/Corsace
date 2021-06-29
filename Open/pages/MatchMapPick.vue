<template>
    <div class="matchPickWrapper" @mouseenter="active = true" @mouseleave="active = false" :style="background">
        <div class="matchPick">
            <input class="mapLink" v-model="mapLink" v-if="edit" @input="changeMap()" placeholder="nsert map here (no /s/ link)">
            <a :href="setMap ? `https://osu.ppy.sh/b/${setMap.map.mapID}` : null"><div v-if="!edit" class="matchMapArtist">{{ setMap ? setMap.map.artist : ''}}</div></a>
            <a :href="setMap ? `https://osu.ppy.sh/b/${setMap.map.mapID}` : null"><div v-if="!edit" class="matchMapTitle">{{ setMap ? setMap.map.title : '' }}</div></a>
            <a class="matchMapDiff" :href="setMap ? `https://osu.ppy.sh/b/${setMap.map.mapID}` : null"><div class="matchMapDiff">[{{ setMap ? setMap.map.difficulty : 'N/A' }}]</div></a>
            <div class="matchMapWinner">{{ setMap && setMap.winner ? setMap.winner.name + ' ' + $t('match.wins') : '' }}</div>
            <div class="matchPickHover" :style="hover">
                <div class="filler1"></div>
                <div class="pickBanShow" v-if="!showMatchDetails && ((setMap && setMap.teamAScores.length > 0) || (setMap && setMap.teamBScores.length > 0) || edit)" @click="showMatchDetails = true">&#9660; {{ $t('match.expand') }}</div>
                <div class="pickBanShow" v-else-if="showMatchDetails" @click="showMatchDetails = false">&#9650; {{ $t('match.collapse') }}</div>
                <div class="mapID">{{ setMap ? mods[setMap.mapMod] : '' }} MAP {{ setMap ? setMap.mapPosition + 1 : '' }}</div>
                <div class="pickBanBy" v-if="team">
                    {{ $t('match.picked') }}
                    <router-link class="matchResultTeamName" :to="`/team/${team.slug}`"><div class="pickBanTeam">{{ team.name }}</div></router-link>
                </div>
            </div>
        </div>
        <transition name="show">
            <div v-if="showMatchDetails && setMap">
                <div class="matchResult">
                    <div class="matchTeams">
                        <div class="matchTeam">
                            <router-link class="matchResultTeamName" :to="`/team/${teamA.slug}`"><div class="matchResultTeamName" :class="{Winner: setMap.winner.name === teamA.name}">{{ teamA.name }}</div></router-link>
                            <match-map-player v-for="index in 4" :key="index" :score="setMap.teamAScores[index-1]" :edit="edit" :matchid="matchid" :set-num="setNum" :map-num="mapNum" :team="'A'" @refresh="$emit('refresh')"></match-map-player>
                        </div>
                        <div class="matchTeamAScore" :class="{Winner: setMap.winner.name === teamA.name}">{{ teamAScore }}</div>
                        <div class="matchTeam">
                            <router-link class="matchResultTeamName" :to="`/team/${teamB.slug}`"><div class="matchResultTeamName" :class="{Winner: setMap.winner.name === teamB.name}">{{ teamB.name }}</div></router-link>
                            <match-map-player v-for="index in 4" :key="index" :score="setMap.teamBScores[index-1]" :edit="edit" :matchid="matchid" :set-num="setNum" :map-num="mapNum" :team="'B'" @refresh="$emit('refresh')"></match-map-player>
                        </div>
                        <div class="matchTeamAScore" :class="{Winner: setMap.winner.name === teamB.name}">{{ teamBScore }}</div>
                    </div>
                </div>
            </div>
        </transition>
    </div>
</template>

<script>
import MatchMapPlayer from "./MatchMapPlayer";
import axios from "axios";
import regeneratorRuntime from "regenerator-runtime";

export default {
    components: {
        MatchMapPlayer,
    },
    data: () => ({
        mapLink: '',
        active: false,
        showMatchDetails: false,
        mods: {
            "NM": "NOMOD",
            "HD": "HIDDEN",
            "HR": "HARD ROCK",
            "DT": "DOUBLE TIME",
            "FM": "FREEMOD",
            "TB": "TIEBREAKER",
        },
        regex: /^https:\/\/osu\.ppy\.sh\/(b|beatmapsets|beatmaps)\/(\d+)(#osu\/(\d+))?/
    }),
    props: {
        setMap: Object,
        edit: Boolean,
        setNum: Number,
        mapNum: Number,
        teamA: Object,
        teamB: Object,
        team: Object,
        matchid: String,
    },
    created: function() {
        this.mapLink = this.setMap ? `https://osu.ppy.sh/b/${this.setMap.map.mapID}` : '';
    },
    computed: {
        hover: function() {
            if(this.active) {
                return {
                    transform: 'translateX(0)',
                };
            } else {
                return {
                    transform: 'translateX(92%)',
                }
            }
        },
        background: function() {
            return {
                background: this.setMap ? `linear-gradient(rgba(0, 0, 0, 0.60), rgba(0, 0, 0, 0.60)), url('https://assets.ppy.sh/beatmaps/${this.setMap.map.setID}/covers/cover.jpg')` : 'linear-gradient(rgba(0, 0, 0, 0.60), rgba(0, 0, 0, 0.60))',
                'background-repeat': 'no-repeat',
                'background-size': 'cover',
                'background-position': 'top center',
            }
        },
        teamAScore: function() {
            return this.setMap.teamAScores.reduce(((acc, curr) => curr.fail ? acc + 0 : acc + curr.score), 0).toLocaleString("en-EN").replace(/\,/g, ' ');
        },
        teamBScore: function() {
            return this.setMap.teamBScores.reduce(((acc, curr) => curr.fail ? acc + 0 : acc + curr.score), 0).toLocaleString("en-EN").replace(/\,/g, ' ');
        }
    },
    methods: {
        changeMap: async function() {
            if(this.mapLink !== '') {
                const result = this.regex.exec(this.mapLink);
                if(result) {
                    let id = 0;
                    if (result[1] === "b" || result[1] === "beatmaps")
                        id = result[2];
                    else if (result[1] === "beatmapsets")
                        id = result[4]
                    const data = {
                        match: this.matchid,
                        map: id,
                        mapType: "PICKED",
                        mapNum: this.mapNum - 1,
                        setNum: this.setNum - 1,
                    }
                    await axios.patch("/api/matches/map", data);
                    this.$emit("refresh");
                } else {
                    alert("Map does not exist/your link is bad! Only /b/ links!");
                    this.mapNewURL = "";
                }
            } else {
                const data = {
                    match: this.matchid,
                    map: "empty",
                    mapType: "PICKED",
                    mapNum: this.mapNum - 1,
                    setNum: this.setNum - 1,
                }
                await axios.patch("/api/matches/map", data);
                this.$emit("refresh");
            }
        }
    }
}
</script>

<style>

.matchPickWrapper {
    padding-left: 9px;
    grid-column: 1/3;
    grid-row: span 5;
    background-size: cover;
}

.matchResult {
    padding-top: 9px;
    padding-right: 9px;
    padding-bottom: 20px;
}

.matchTeams {
    display: grid;
    grid-auto-flow: column;
    grid-gap: 20px;
    font-style: italic;
    grid-template-columns: 1fr 1fr;
}

.matchTeam {
    display: grid;
    grid-gap: 6px;
    background-color: rgba(0, 0, 0, 0.5);
    border: 0;
    border-radius: 10px;
    padding: 12px;
}

.matchTeamAScore {
    grid-row: 2/3;
    justify-self: center;
    font-size: 20px;
    font-style: normal;
}

.matchResultTeamName {
    justify-self: center;
    font-size: 24px;
    letter-spacing: 0.3px;
    font-style: normal;
}

.Winner {
    font-weight: bold;
}

.setResult {
    display: grid;
    flex-direction: column;
    justify-items: center;
    grid-gap: 10px;
}

.setScore, .matchTotalScore {
    display: grid;
    grid-auto-flow: column;
    grid-gap: 20px;
}

.show-enter-active {
    max-height: 100%;
    transition: 0.3s cubic-bezier(0,0,.25,1);
}

.show-leave-active {
    transition: 0.3s cubic-bezier(0,0,.25,1);
}

.show-enter, .show-leave-to {
    opacity: 0;
    max-height: 0px;
    overflow: hidden;
}

.show-leave, .show-enter-to {
    opacity: 100;
    overflow: hidden;
}
</style>