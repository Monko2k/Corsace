<template>
    <div v-if="$route.path === '/streamer/pairings'">
        <div class="pairingContainer">
            <div class="pairing" v-for="(pairing, index) in pairings" :key="index">
                <div class="pairingTeam pairingTeamA" :style="pairing.teamA ? pairing.teamA.style : ''">
                    {{pairing.teamA ? pairing.teamA.name : "N/A"}}
                </div>
                <img class="pairingVs" src="../../Assets/img/open/vs.png">
                <div class="pairingTeam pairingTeamB" :style="pairing.teamB ? pairing.teamB.style : ''">
                    {{pairing.teamB ? pairing.teamB.name : "N/A"}}
                </div>
            </div>
        </div>
    </div>
    <div v-else-if="team2">
        <div v-if="$route.query.table">
            <qualifier-scores-table :scores="scores" :mappool="mappool" :teams="team2 ? [team1, team2] : [team1]" :list="'players'" :scoringType="'sum'"></qualifier-scores-table>
        </div>
        <div v-else class="teamContainer">
            <div class="team">
                <div class="teamHeader" :style="team1.style ? team1.style : ''">
                    {{team1.name}}
                    <div class="teamBottom">
                        <div class="teamBottomInfo" :style="team1.bestStyle ? team1.bestStyle : ''">
                            BEST<br><span class="teamBottomBold">{{team1.best.toUpperCase()}}</span>
                        </div>
                        <div class="teamBottomInfo" :style="team1.bestStyle ? team1.bestStyle : ''">
                            WORST<br><span class="teamBottomBold">{{team1.worst.toUpperCase()}}</span>
                        </div>
                        <div class="teamBottomInfo" :style="team1.bestStyle ? team1.bestStyle : ''">
                            AVG. TEAM SCORE<br><span class="teamBottomBold">{{team1.average}}</span>
                        </div>
                    </div>
                </div>
                <div class="teamMembers">
                    <div class="teamMember teamMember1" v-for="(member, index) in team1.members" :key="index">
                        <img :src="`https://a.ppy.sh/${member.osuID}?${Math.random()*1000000}`">
                        {{member.username}} (#{{Math.round(Math.pow(member.rank, Math.pow(0.9937, Math.pow(member.badges, 2))))}})
                    </div>
                </div>
            </div>
            <img src="../../Assets/img/open/vs.png">
            <div class="team">
                <div class="teamMembers">
                    <div class="teamMember teamMember2" v-for="(member, index) in team2.members" :key="index">
                        {{member.username}} (#{{Math.round(Math.pow(member.rank, Math.pow(0.9937, Math.pow(member.badges, 2))))}})
                        <img :src="`https://a.ppy.sh/${member.osuID}?${Math.random()*1000000}`">
                    </div>
                </div>
                <div class="teamHeader" :style="team2.style ? team2.style : ''">
                    {{team2.name}}
                    <div class="teamBottom">
                        <div class="teamBottomInfo" :style="team2.bestStyle ? team2.bestStyle : ''">
                            BEST<br><span class="teamBottomBold">{{team2.best.toUpperCase()}}</span>
                        </div>
                        <div class="teamBottomInfo" :style="team2.bestStyle ? team2.bestStyle : ''">
                            WORST<br><span class="teamBottomBold">{{team2.worst.toUpperCase()}}</span>
                        </div>
                        <div class="teamBottomInfo" :style="team2.bestStyle ? team2.bestStyle : ''">
                            AVG. TEAM SCORE<br><span class="teamBottomBold">{{team2.average}}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div v-else>
    </div>
</template>

<script>
import axios from "axios";
import QualifierScoresTable from "./QualifierScoresTable";

export default {
    components: {
        QualifierScoresTable,
    },
    data: () => ({
        team1: null,
        team2: null,
        mappool: null,
        pairings: [],
        scores: [],
    }),
    created: async function() {
        await this.refresh();
    },
    methods: {
        refresh: async function() {
            let team1 = {};
            let team2 = {};
            if (this.$route.path === "/streamer/pairings") {
                this.pairings = (await axios.get("/api/matches?round=grand-finals")).data.matches;
                this.pairings = this.pairings.map((pairing) => {
                    if (pairing.teamA && pairing.teamA.teamAvatarUrl)
                        pairing.teamA.style = `background: linear-gradient(rgba(0, 0, 0, 0.50), rgba(0, 0, 0, 0.50)), url(${pairing.teamA.teamAvatarUrl}); background-position: center; background-size: cover;`
                    if (pairing.teamB && pairing.teamB.teamAvatarUrl)
                        pairing.teamB.style = `background: linear-gradient(rgba(0, 0, 0, 0.50), rgba(0, 0, 0, 0.50)), url(${pairing.teamB.teamAvatarUrl}); background-position: center; background-size: cover;`
                    return pairing;
                })
            } else if (this.$route.params.team2)
                [team1, team2] = await Promise.all([(await axios.get('/api/team?teamSlug=' + this.$route.params.team1)).data.team, (await axios.get('/api/team?teamSlug=' + this.$route.params.team2)).data.team]);
            else if (this.$route.params.team1)
                team1 = (await axios.get('/api/team?teamSlug=' + this.$route.params.team1)).data.team;
            if (team1 && team1.teamAvatarUrl)
                team1.style = `background: linear-gradient(rgba(0, 0, 0, 0.50), rgba(0, 0, 0, 0.50)), url(${team1.teamAvatarUrl}); background-position: center; background-size: cover;`
            if (team2 && team2.teamAvatarUrl)
                team2.style = `background: linear-gradient(rgba(0, 0, 0, 0.50), rgba(0, 0, 0, 0.50)), url(${team2.teamAvatarUrl}); background-position: center; background-size: cover;`
            
            let data;
            if (this.$route.params.team2)
                data = (await axios.get(`/api/streamer/${this.$route.params.team1}/${this.$route.params.team2}`)).data
            else 
                data = (await axios.get(`/api/streamer/${this.$route.params.team1}`)).data
            if (data.error)
                return alert(data.error)
            this.mappool = data.mappool;
            this.scores = data.scores;

            let beatmaps = [];
            if (this.mappool && this.mappool.length !== 0) {
                let maps = this.mappool.modGroups.map((modGroup) => {
                    return modGroup.beatmaps.map((beatmap, i) => {
                        const url = `'https://assets.ppy.sh/beatmaps/${beatmap.setID}/covers/cover.jpg'`;
                        beatmap.mod = modGroup.mod;
                        beatmap.name = modGroup.mod + (i+1);
                        beatmap.style = {
                            background: 'linear-gradient(rgba(0, 0, 0, 0.50), rgba(0, 0, 0, 0.50)), url(' + url + ')',
                        }
                        return beatmap;
                    });
                });
                maps = [].concat.apply([], maps);
                if (maps.length !== 0)
                    beatmaps = maps;
            }

            team1.best = "nm1";
            team1.worst = "nm1";
            team1.average = 0;
            team1.count = 0;
            team1.scores = {};
            for (const score of this.scores) {
                if (score.team === team1.id) {
                    team1.qualifier = score.qualifier;
                    team1.time = score.time;
                    const name = beatmaps.find((beatmap) => beatmap.mapID === score.mapID).name.toLowerCase();
                    if (!team1.scores[name])
                        team1.scores[name] = [score.score]
                    else
                        team1.scores[name].push(score.score);
                }
            }
            for (const name of Object.keys(team1.scores)) {
                team1[name] = team1.scores[name].reduce((a, b) => a + b, 0);
                team1.average += team1[name];
                team1.count++;
                team1.best = team1[team1.best] < team1[name] ? name : team1.best;
                team1.worst = team1[team1.worst] > team1[name] ? name : team1.worst;
            }
            if (team1.count !== 0)
                team1.average = Math.round(team1.average/team1.count);

            if (team2) {
                team2.best = "nm1";
                team2.worst = "nm1";
                team2.average = 0;
                team2.count = 0;
                team2.scores = {};
                for (const score of this.scores) {
                    if (score.team === team2.id) {
                        team2.qualifier = score.qualifier;
                        team2.time = score.time;
                        const name = beatmaps.find((beatmap) => beatmap.mapID === score.mapID).name.toLowerCase();
                        if (!team2.scores[name])
                            team2.scores[name] = [score.score]
                        else
                            team2.scores[name].push(score.score);
                    }
                }
                for (const name of Object.keys(team2.scores)) {
                    team2[name] = team2.scores[name].reduce((a, b) => a + b, 0);
                    team2.average += team2[name];
                    team2.count++;
                    team2.best = team2[team2.best] < team2[name] ? name : team2.best;
                    team2.worst = team2[team2.worst] > team2[name] ? name : team2.worst;
                }
                if (team2.count !== 0)
                    team2.average = Math.round(team2.average/team2.count);
            }
            this.team1 = team1;
            this.team2 = team2;
        }
    }
}
</script>

<style>
body {
    background: black;
}

.pairingContainer {
    display: flex;
    flex-wrap: wrap;
    flex-direction: column;
    height: 576px;
    justify-content: center;
    position: relative;
    top: 10px;
}

.pairing {
    display: flex;
    flex-direction: column;
    position: relative;
    justify-content: center;
    align-items: center;
    padding-bottom: 10px;
}

.pairingTeam {
    background: linear-gradient(rgba(0, 0, 0, 0.50), rgba(0, 0, 0, 0.50)), url("../../Assets/img/open/defaultTeamAvatar.png");
    background-position: center;
    background-size: cover;
    width: 160px;
    height: 45px;
    border-radius: 10px;
    margin-bottom: 10px;
    text-align: center;
    font-weight: bold;
    font-size: 14px;
}

.pairingTeamA {
    padding-top: 10px;
}

.pairingTeamB {
    padding-bottom: 10px;
    display: flex;
    justify-content: center;
    align-items: flex-end;
}

.pairingVs {
    position: absolute;
    top: 38px;
    width: 90px;
}

.teamContainer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 1200px;
    height: 576px;
    padding: 0px 40px;
    font-size: 24px;
}

.team {
    display: flex;
    justify-content: center;
    align-items: center;
}

.teamHeader {
    height: 490px;
    width: 240px;
    padding: 10px 0;
    text-align: center;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    background: linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url("../../Assets/img/open/defaultTeamAvatar.png");
    background-position: center;
    background-size: cover;
    border-radius: 25px;
}

.teamBottom {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-around;
}

.teamBottomInfo {
    padding: 10px;
}

.teamBottomBold {
    font-weight: bold;
}

.teamMembers {
    height: 500px;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
}

.teamMember {
    display: flex;
    justify-content: center;
    align-items: center;
}

.teamMember1 {
    justify-content: start;
}

.teamMember2 {
    justify-content: flex-end;
    text-align: end;
    line-height: 1.3;
}

.teamMember > img {
    height: 50px;
    width: 50px;
    padding: 0 10px;
    border-radius: 50%;
}
</style>