<template>
    <div class="pickems" >
        <a class="pickemsHead" href="https://pickem.hwc.hr/info">Derived from <span class="pickemsHallo">Hallowatcher's pickem method</span></a>
        <br><router-link :to="'/info#Pickems'">See info page for details</router-link>
        <br>You must log in with your osu! account to access pickems!
        <div class="pickemsSubHeaders">
            <div @click="section='pickems'" class="pickemsSubHeader" :class="{ pickemsSubHeaderActive: section==='pickems' }">PICKEMS</div>
            <div @click="section='leaderboard'; getLeaderboard()" class="pickemsSubHeader" :class="{ pickemsSubHeaderActive: section==='leaderboard' }">LEADERBOARD</div>
        </div>
        <loading v-if="loading"></loading>
        <div class="pickemsMain" v-else-if="section==='pickems'">
            <div class="pickemsPoints">
                Your points: {{user.pickemPoints}}
            </div>
            <loading v-if="teamLoading" style="position: relative;"></loading>
            <div class="pickemTeamContainer" v-else-if="team1 && team2">
                <div class="pickemTeamInfo">
                    <router-link class="teamHeader" :style="team1.style ? team1.style : ''" :to="`/team/${team1.slug}`">
                        {{team1.name}}
                        <div class="teamBottom">
                            <div class="teamBottomInfo" :style="team1.bestStyle ? team1.bestStyle : ''">
                                BEST QUALIFIER MAP<br><span class="teamBottomBold">{{team1.best.toUpperCase()}}</span>
                            </div>
                            <div class="teamBottomInfo" :style="team1.bestStyle ? team1.bestStyle : ''">
                                WORST QUALIFIER MAP<br><span class="teamBottomBold">{{team1.worst.toUpperCase()}}</span>
                            </div>
                            <div class="teamBottomInfo" :style="team1.bestStyle ? team1.bestStyle : ''">
                                AVG. QUALIFIER TEAM SCORE<br><span class="teamBottomBold">{{team1.average}}</span>
                            </div>
                        </div>
                    </router-link>
                    <div class="teamMembers">
                        <div class="teamMember teamMember1" v-for="(member, index) in team1.members" :key="index">
                            <img :src="`https://a.ppy.sh/${member.osuID}?${Math.random()*1000000}`">
                            {{member.username}} (#{{Math.round(Math.pow(member.rank, Math.pow(0.9937, Math.pow(member.badges, 2))))}})
                        </div>
                    </div>
                </div>
                <img src="../../Assets/img/open/vs.png">
                <div class="pickemTeamInfo" >
                    <div class="teamMembers">
                        <div class="teamMember teamMember2" v-for="(member, index) in team2.members" :key="index">
                            {{member.username}} (#{{Math.round(Math.pow(member.rank, Math.pow(0.9937, Math.pow(member.badges, 2))))}})
                            <img :src="`https://a.ppy.sh/${member.osuID}?${Math.random()*1000000}`">
                        </div>
                    </div>
                    <router-link class="teamHeader" :style="team2.style ? team2.style : ''" :to="`/team/${team2.slug}`">
                        {{team2.name}}
                        <div class="teamBottom">
                            <div class="teamBottomInfo" :style="team2.bestStyle ? team2.bestStyle : ''">
                                BEST QUALIFIER MAP<br><span class="teamBottomBold">{{team2.best.toUpperCase()}}</span>
                            </div>
                            <div class="teamBottomInfo" :style="team2.bestStyle ? team2.bestStyle : ''">
                                WORST QUALIFIER MAP<br><span class="teamBottomBold">{{team2.worst.toUpperCase()}}</span>
                            </div>
                            <div class="teamBottomInfo" :style="team2.bestStyle ? team2.bestStyle : ''">
                                AVG. QUALIFIER TEAM SCORE<br><span class="teamBottomBold">{{team2.average}}</span>
                            </div>
                        </div>
                    </router-link>
                </div>
            </div>
            <div class="pickemsMatches">
                <pickem-match v-for="(match, index) in matches" :key="index" :match="match" :pickem="pickems.find((pickem) => pickem.matchID === match.matchID)" @refresh="refresh" @pickem="pickemInfo"></pickem-match>
            </div>
        </div>
        <div v-else class="pickemsLeaderboard">
            <input class="pickemsUserSearch" v-model="search" placeholder="search for a user here">
            <div class="pickemsLeaderboardHead">
                <div class="pickemsTable1">User
                </div>

                <div class="pickemsTable2">Points
                </div>
            </div>
            <div class="pickemsLeaderboardPerson" v-for="(user, index) in filteredLeaderboard" :key="index">
                <a :href="`https://osu.ppy.sh/u/${user.userID}`" class="pickemsLeaderboardUsername pickemsTable1">
                    <img :src="`https://a.ppy.sh/${user.userID}?${Math.random()*100000}`"> {{user.username}}
                </a>
                <div class="pickemsLeaderboardPoints pickemsTable2"> {{user.points}}
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import axios from 'axios';
import PickemMatch from "./PickemMatch";
import Loading from "./Loading";

export default {
    components: {
        PickemMatch,
        Loading
    },
    data: () => ({
        matches: [],
        pickems: [],
        leaderboard: [],
        team1: null,
        team2: null,
        section: 'pickems',
        search: '',
        loading: true,
        teamLoading: false,
    }),
    props: {
        user: Object,
    },
    created: async function() {
        this.loading = true;
        await this.refresh();
        this.loading = false;
    },
    computed: {
        filteredLeaderboard: function() {
            if (!this.search || this.search==="")
                return this.leaderboard;
            return this.leaderboard.filter(user => user.username.toLowerCase().includes(this.search.toLowerCase()))
        },
    },
    methods: {
        refresh: async function() {
            try {
                const { data } = await axios.get("api/pickems");
                if (data.error) {
                    console.error(data.error);
                    return alert("An error occured. Check the console for details.");
                }
                this.matches = data.matches;
                this.pickems = data.pickems;
            } catch (e) {
                alert("Please link your osu! account to access pickems! If it is already linked, then there may be an internal issue! Please let VINXIS know!");
            }
        },
        getLeaderboard: async function() {
            if (!this.leaderboard || this.leaderboard.length === 0) {
                this.loading = true;
                const { data } = await axios.get("/api/pickems/leaderboard");
                if (data.error)
                    return alert(data.error.name + ": " + data.error.message);
                this.leaderboard = data.users;
                this.loading = false;
            }
        },
        pickemInfo: async function(match) {
            this.teamLoading = true;
            try {
                let [team1, team2] = await Promise.all([(await axios.get('/api/team?teamSlug=' + match.teamASlug)).data.team, (await axios.get('/api/team?teamSlug=' + match.teamBSlug)).data.team]);
                const { data } = await axios.get(`/api/streamer/${match.teamASlug}/${match.teamBSlug}`);
                const mappool = data.mappool;
                const scores = data.scores;
                if (team1 && team1.teamAvatarUrl)
                    team1.style = `background: linear-gradient(rgba(0, 0, 0, 0.50), rgba(0, 0, 0, 0.50)), url(${team1.teamAvatarUrl}); background-position: center; background-size: cover;`
                if (team2 && team2.teamAvatarUrl)
                    team2.style = `background: linear-gradient(rgba(0, 0, 0, 0.50), rgba(0, 0, 0, 0.50)), url(${team2.teamAvatarUrl}); background-position: center; background-size: cover;`

                let beatmaps = [];
                if (mappool && mappool.length !== 0) {
                    let maps = mappool.modGroups.map((modGroup) => {
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
                for (const score of scores) {
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

                team2.best = "nm1";
                team2.worst = "nm1";
                team2.average = 0;
                team2.count = 0;
                team2.scores = {};
                for (const score of scores) {
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
                this.team1 = team1;
                this.team2 = team2;
            } catch (e) {
                alert("An error occured in obtaining team information!");
                console.log(e);
            }
            this.teamLoading = false;
        }
    }
}
</script>

<style>
.pickemsHallo {
    font-weight: bold;
}

.pickems, .pickemsMain, .pickemsMatches, .pickemsLeaderboard, .pickemsLeaderboardHead, .pickemsLeaderboardPerson, .pickemsLeaderboardUsername {
    display: flex;
    align-items: center;
    justify-content: center;
}

.pickems, .pickemsMain, .pickemsLeaderboard {
    flex-direction: column;    
    margin: 40px 0;
}

.pickemsSubHeaders {
    display: flex;
    font-size: 20px;
    letter-spacing: 6.8px;
    text-shadow: 0 0 10px rgba(95,95,95,.75);
    margin-top: 40px;
}

.pickemsSubHeaders > a, .pickemsSubHeaders > div {
    padding: 0 17px;
}

.pickemsSubHeader {
    cursor: pointer;
    color: #5f5f5f;
}

.pickemsSubHeaderActive {
    color: #b64c4c;
    text-shadow: 0 0 10px rgba(182,76,76,.75);
}

.pickemsMatches {
    margin-top: 30px;
    flex-wrap: wrap;
}

.pickemsLeaderboard {
    width: 15%;
}

.pickemsUserSearch {
    font: inherit;
    background-color: #202020;
    color: white;
    border: 0;
    outline: 0;
    margin: 20px;
    padding: 10px;
    text-align: center;
}

.pickemsLeaderboardHead, .pickemsLeaderboardPerson {
    width: 100%;
    padding: 20px;
    background-color: #202020;
    border: 1px solid #5f5f5f;
}

.pickemsTable1 {
    flex: 4;
    justify-content: flex-start;
}

.pickemsTable2 {
    flex: 1;
}

.pickemsLeaderboardUsername > img {
    height: 50px;
    width: 50px;
    border-radius: 50%;
    margin-right: 20px;
}

.pickemTeamContainer, .pickemTeamInfo {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
}

.teamHeader {
    height: 400px;
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
    height: 400px;
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