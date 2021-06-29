<template>
    <div class="matchBan" @mouseenter="active = true" @mouseleave="active = false" :style="background">
        <input class="mapLink" v-model="mapLink" v-if="edit" @input="changeMap" placeholder="insert map here (no /s/ link)">
        <a :href="setMap ? `https://osu.ppy.sh/b/${setMap.map.mapID}` : null"><div class="matchMapArtist" v-if="!edit">{{ setMap ? setMap.map.artist : ''}}</div></a>
        <a :href="setMap ? `https://osu.ppy.sh/b/${setMap.map.mapID}` : null"><div class="matchMapTitle" v-if="!edit">{{ setMap ? setMap.map.title : '' }}</div></a>
        <div class="matchMapDiff">[{{ setMap ? setMap.map.difficulty : 'N/A' }}]</div>
        <div class="matchBanHover" :style="hover">
            <div class="mapID">{{ setMap ? mods[setMap.mapMod] : '' }} MAP {{ setMap ? setMap.mapPosition + 1 : '' }}</div>
            <div class="pickBanBy" v-if="team">{{ $t('match.banned') }}</div>
            <div class="pickBanTeam">{{ team ? team.name : ''}}</div>
        </div>
    </div>
</template>

<script>
import axios from "axios";
import regeneratorRuntime from "regenerator-runtime";

export default {
    data: () => ({
        mapLink: '',
        active: false,
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
        team: Object,
        matchid: String,
        matchType: String,
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
                    transform: 'translateX(85.5%)',
                }
            }
        },
        background: function() {
            return {
                background: this.setMap ? `linear-gradient(rgba(0, 0, 0, 0.60), rgba(0, 0, 0, 0.60)), url('https://assets.ppy.sh/beatmaps/${this.setMap.map.setID}/covers/cover.jpg')` : 'linear-gradient(rgba(0, 0, 0, 0.60), rgba(0, 0, 0, 0.60))',
                'background-repeat': 'no-repeat',
                'background-size': 'cover',
                'background-position': 'center',
            }
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
                        type: this.matchType,
                        map: id,
                        mapType: "BANNED",
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
                    type: this.matchType,
                    map: "empty",
                    mapType: "BANNED",
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

</style>