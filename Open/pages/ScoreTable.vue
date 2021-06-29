<template>
    <table class="scoresTable">
        <tr>
            <th v-if="list==='players'">User</th>
            <th>Team</th>
            <th>Best</th>
            <th>Worst</th>
            <th v-if="scoringType === 'seeding'">Rank</th>
            <th v-else>Avg.</th>
            <th v-for="(beatmap, index) in beatmaps" :key="index" :style="beatmap.style ? beatmap.style : null"><a :href="beatmap.mapID ? `https://osu.ppy.sh/beatmaps/${beatmap.mapID}` : null">{{ beatmap.name }}</a></th>
        </tr>
        <tr v-for="(player, i) in (list==='players' ? userScores : teamScores)" :key="i">
            <td :style="player.style" v-if="list==='players'"><a :href="`https://osu.ppy.sh/u/${player.osuID}`">{{ player.username }}</a></td>
            <td :style="player.teamStyle ? player.teamStyle : null" v-if="list==='players'"><router-link :to="`/team/${player.teamSlug}`">{{ player.teamName }}</router-link></td>
            <td :style="player.style ? player.style : null" v-else><router-link :to="`/team/${player.slug}`">{{ player.name }}</router-link></td>
            <td class="scoresBestWorst">{{ player[player.best] ? player.best.toUpperCase() : "" }}</td>
            <td class="scoresBestWorst">{{ player[player.worst] ? player.worst.toUpperCase() : "" }}</td>
            <td class="scoresAverage">{{ player.average && player.average !== 0 ? player.average.toLocaleString('en-US').replace(/,/gi, ' ') : "" }}{{player.average && (scoringType === 'max' || scoringType === 'avg') ? "%" : ""}}</td>
            <td class="scoresBorder" v-for="(map, i) in mapIDs" :key="i" :class="{topScore: player[map] && player[map] === topScores[map]}">{{ player[map] ? player[map].toLocaleString('en-US').replace(/,/gi, ' ') : "" }}{{player[map] && (scoringType === 'max' || scoringType === 'avg') ? "%" : ""}}</td>
        </tr>
    </table>
</template>

<script>
const defaultMaps = [
    {name: "NM1"},
    {name: "NM2"},
    {name: "NM3"},
    {name: "NM4"},
    {name: "NM5"},
    {name: "NM6"},
    {name: "HD1"},
    {name: "HD2"},
    {name: "HD3"},
    {name: "HR1"},
    {name: "HR2"},
    {name: "HR3"},
    {name: "DT1"},
    {name: "DT2"},
    {name: "DT3"},
    {name: "DT4"},
    {name: "FM1"},
    {name: "FM2"},
    {name: "FM3"},
    {name: "TB"},
];
const mapIDs = ["nm1","nm2","nm3","nm4","nm5","nm6","hd1","hd2","hd3","hr1","hr2","hr3","dt1","dt2","dt3","dt4","fm1","fm2","fm3","tb",]

export default {
    data: () => ({
        topScores: {},
        avgScores: {},
        countScores: {},
    }),
    props: {
        list: String,
        scoringType: String,
        scores: Array,
        teams: Array,
        mappool: Object,
    },
    computed: {
        beatmaps: function() {
            if (!this.mappool || this.mappool.length === 0)
                return defaultMaps;

            let maps = this.mappool.modGroups.map((modGroup) => {
                return modGroup.beatmaps.map((beatmap, i) => {
                    const url = `'https://assets.ppy.sh/beatmaps/${beatmap.setID}/covers/cover.jpg'`;
                    beatmap.mod = modGroup.mod;
                    beatmap.name = modGroup.mod + (i+1);
                    beatmap.style = {
                        background: 'linear-gradient(rgba(0, 0, 0, 0.60), rgba(0, 0, 0, 0.60)), url(' + url + ')',
                    }
                    return beatmap;
                });
            });
            maps = [].concat.apply([], maps);
            if (maps.length === 0)
                return defaultMaps;
            return maps;
        },
        userScores: function() {
            if (!this.teams || this.teams.length === 0)
                return [];
            
            let userScores = [].concat.apply([], this.teams.map((team) => {
                return team.members.map((member) => {
                    const url = `https://a.ppy.sh/${member.osuID}?${Math.random()*1000000}`
                    member.teamSlug = team.slug;
                    member.teamName = team.name;
                    member.style = {
                        background: 'linear-gradient(rgba(0, 0, 0, 0.60), rgba(0, 0, 0, 0.60)), url(' + url + ')',
                    }
                    if (team.teamAvatarUrl) {
                        member.teamStyle = {
                            background: 'linear-gradient(rgba(0, 0, 0, 0.60), rgba(0, 0, 0, 0.60)), url(' + team.teamAvatarUrl + ')',
                        }
                    }
                    return member;
                });
            }));
            this.topScores = {};
            this.avgScores = {};
            const tempTop = {};
            if (this.mappool && this.scores) {
                userScores = userScores.map((user) => {
                    user.best = "nm1";
                    user.worst = "nm1";
                    user.average = 0;
                    user.count = 0;
                    for (const score of this.scores) {
                        if (score.userOsuID === user.osuID) {
                            user.qualifier = score.qualifier;
                            user.time = score.time;
                            const name = this.beatmaps.find((beatmap) => beatmap.mapID === score.mapID).name.toLowerCase();
                            user[name] = score.score;
                            user.average += score.score;
                            user.count++;
                            user.best = !user[user.best] || user[user.best] < score.score ? name : user.best;
                            user.worst = !user[user.worst] || user[user.worst] > score.score ? name : user.worst;
                            this.topScores[name] = Math.max(this.topScores[name] ? this.topScores[name] : 0, score.score);
                            if (this.avgScores[name]) {
                                this.avgScores[name] += score.score;
                                this.countScores[name]++;
                            } else {
                                this.avgScores[name] = score.score;
                                this.countScores[name] = 1;
                            }
                        }
                    }
                    if (user.count !== 0)
                        user.average = Math.round(user.average/user.count);

                    return user;
                });
                userScores.sort((a, b) => b.average - a.average);
                switch (this.scoringType) {
                    case "max":
                        userScores = userScores.map((user) => {
                            user.average = user.count = 0;
                            for (const name of Object.keys(this.topScores)) {
                                if (user[name]) {
                                    user[name] = 100 * user[name] / this.topScores[name];
                                    tempTop[name] = Math.max(tempTop[name] ? tempTop[name] : 0, user[name]);
                                    user.average += user[name];
                                    user.count++;
                                }
                            }
                            user.average /= user.count;
                            return user;
                        });
                        break;
                    case "avg":
                        for (const name of Object.keys(this.avgScores))
                            this.avgScores[name] /= this.countScores[name];

                        userScores = userScores.map((user) => {
                            user.average = user.count = 0;
                            for (const name of Object.keys(this.avgScores)) {
                                if (user[name]) {
                                    user[name] = 100 * user[name] / this.avgScores[name];
                                    tempTop[name] = Math.max(tempTop[name] ? tempTop[name] : 0, user[name]);
                                    user.average += user[name];
                                    user.count++;
                                }
                            }
                            user.average /= user.count;
                            return user;
                        });
                        break;
                    case "costs":
                        if (this.teamScores) {
                            userScores = userScores.map((user) => {
                                const participationBonus = 1.0 + 0.3 * (user.count / 10);
                                user.average = user.count = 0;
                                for (const name of Object.keys(this.topScores)) {
                                    if (user[name]) {
                                        const team = this.teamScores.find((team) => team.members.some((member) => member.id === user.id));
                                        user[name] /= team[name];
                                        tempTop[name] = Math.max(tempTop[name] ? tempTop[name] : 0, user[name]);
                                        user.average += user[name];
                                        user.count++;
                                    }
                                }
                                user.average /= user.count;
                                user.average = participationBonus * user.average;
                                return user;
                            });
                        }
                        break;
                }
                userScores.sort((a, b) => b.average - a.average);
                if (this.scoringType !== "sum")
                    this.topScores = tempTop;
            }
            return userScores;
        },
        teamScores: function() {
            if (!this.teams || this.teams.length === 0)
                return [];

            let teamScores = this.teams.map((team) => {
                if (team.teamAvatarUrl) {
                    team.style = {
                        background: 'linear-gradient(rgba(0, 0, 0, 0.60), rgba(0, 0, 0, 0.60)), url(' + team.teamAvatarUrl + ')',
                        'background-position': 'bottom',
                        'background-size': 'cover',
                    }
                }
                team.scores = {};
                return team;
            });
            this.topScores = {};
            this.avgScores = {};
            const tempTop = {};
            if (this.mappool && this.scores) {
                teamScores = teamScores.map((team) => {
                    team.best = "nm1";
                    team.worst = "nm1";
                    team.average = 0;
                    team.count = 0;
                    for (const score of this.scores) {
                        if (score.team === team.id) {
                            team.qualifier = score.qualifier;
                            team.time = score.time;
                            const name = this.beatmaps.find((beatmap) => beatmap.mapID === score.mapID).name.toLowerCase();
                            if (!team.scores[name])
                                team.scores[name] = [score.score]
                            else
                                team.scores[name].push(score.score);
                        }
                    }
                    for (const name of Object.keys(team.scores)) {
                        team[name] = team.scores[name].reduce((a, b) => a + b, 0);
                        team.average += team[name];
                        team.count++;
                        team.best = team[team.best] < team[name] ? name : team.best
                        team.worst = team[team.worst] > team[name] ? name : team.worst
                        this.topScores[name] = Math.max(this.topScores[name] ? this.topScores[name] : 0, team[name]);
                        if (this.avgScores[name]) {
                            this.avgScores[name] += team[name];
                            this.countScores[name]++;
                        } else {
                            this.avgScores[name] = team[name];
                            this.countScores[name] = 1;
                        }
                    }
                    if (team.count !== 0)
                        team.average = Math.round(team.average/team.count);
                    return team;
                });
                switch (this.scoringType) {
                    case "average":
                        teamScores.map((team) => {
                            team.average = team.count = 0;
                            for (const name of Object.keys(team.scores)) {
                                team[name] = Math.round(team[name]/team.scores[name].length);
                                tempTop[name] = Math.max(tempTop[name] ? tempTop[name] : 0, team[name]);
                                team.average += team[name];
                                team.count++;
                            };
                            team.average = Math.round(team.average/team.count);
                            return team;
                        });
                        teamScores.sort((a, b) => b.average - a.average);
                        break;
                    case "max":
                        teamScores.map((team) => {
                            team.average = team.count = 0;
                            for (const name of Object.keys(this.topScores)) {
                                if (team[name]) {
                                    team[name] = 100 * team[name] / this.topScores[name];
                                    tempTop[name] = Math.max(tempTop[name] ? tempTop[name] : 0, team[name]);
                                    team.average += team[name];
                                    team.count++;
                                }
                            }
                            team.average /= team.count;
                            return team;
                        });
                        teamScores.sort((a, b) => b.average - a.average);
                        break;
                    case "avg":
                        for (const name of Object.keys(this.avgScores)) {
                            this.avgScores[name] /= this.countScores[name];
                            teamScores.map((team) => {
                                team.average = team.count = 0;
                                if (team[name]) {
                                    team[name] = 100 * team[name] / this.avgScores[name];
                                    tempTop[name] = Math.max(tempTop[name] ? tempTop[name] : 0, team[name]);
                                    team.average += team[name];
                                    team.count++;
                                }
                                team.average /= team.count;
                                return team;
                            });
                        }
                        teamScores.sort((a, b) => b.average - a.average);
                        break;
                    case "seeding":
                        for (const name of Object.keys(this.topScores)) {
                            this.topScores[name] = 1;
                            teamScores.sort((a, b) => b[name]-a[name]);
                            teamScores = teamScores.map((team, i) => {
                                team[name] = i+1;
                                return team;
                            });;
                        }
                        teamScores = teamScores.map((team) => {
                            let avgPlacement = 0;
                            for (const name of Object.keys(this.topScores)) {
                                avgPlacement += team[name];
                            }
                            avgPlacement /= 10;
                            team.average = avgPlacement;
                            return team;
                        });
                        teamScores.sort((a, b) => a.average - b.average);
                        teamScores = teamScores.map((team, i) => {
                            team.average = i+1;
                            return team;
                        });
                }
            }
            if (this.scoringType !== "sum" && this.scoringType !== "seeding" && this.scoringType !== "costs")
                    this.topScores = tempTop;
            return teamScores;
        }
    }
}
</script>

<style>
.scoresTable {
    background-color: rgba(0,0,0,0.7);
    margin-top: 20px;
    border-spacing: 0;
    text-align: center;
}

.scoresTable > tr > th, .scoresTable > tr > td {
    padding: 20px;
}

.scoresTable > tr > th {
    font-size: 2rem;
}

.scoresBorder {
    border: rgba(182, 76, 76, 0.25) solid 2px;
    border-right: none;
    border-bottom: none;
    white-space: nowrap;
}

.scoresBestWorst {
    font-weight: bold;
    font-size: 2rem;
}

.scoresAverage {
    font-weight: bold;
    text-shadow: 0px 0px 10px white;
}

.topScore {
    color: #ffe075;
    text-shadow: 0px 0px 10px rgba(255,224,117, 0.75);
}
</style>