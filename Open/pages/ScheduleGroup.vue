<template>
    <div class="groupTeam">
        <div class="groupTeamInfo">
            <img class="groupTeamAva" v-if="team && team.team.teamAvatarUrl" v-bind:src="team.team.teamAvatarUrl">
            <img class="groupTeamAva" v-else src="../../Assets/img/open/defaultTeamAvatar.png">
            <input class="groupInput" v-if="(user.isCorsace || user.isScheduler) && !team" placeholder="N/A" v-model="targetTeam">
            <div class="groupTeamName" v-else-if="team"><router-link :to="`/team/${team.team.slug}`">{{team.team.name}}</router-link></div>
            <div class="groupTeamName" v-else>N/A</div>
            <div class="searchResults groupSearchResults">
                <div v-for="(teamlist, index) in teamsFiltered" :key="index">
                    <p class="searchSelection" @click="chooseTeam(teamlist)">{{ teamlist.name }}</p>
                </div>
            </div>
        </div>
        <div class="groupTeamWin" :style="wins">{{ team && team.wins ? team.wins : 0 }}</div>
        <div class="groupTeamLose" :style="loss">{{ team && team.losses ? team.losses : 0 }}</div>
        <div class="verifyButton qualifyButton" v-if="team && !team.qualified && user.isCorsace" @click="qualify(team)"></div>
    </div>
</template>

<script>
import axios from "axios";
import regeneratorRuntime from "regenerator-runtime";

export default {
    data: () => ({
        targetTeam: "",
    }),
    props: {
        team: Object,
        group: Object,
        user: Object,
    },
    asyncComputed: {
        async teamsFiltered() {
            if(this.targetTeam !== "") {
                const teamList = (await axios.get("/api/team/search?regex=" + this.targetTeam)).data.teams;
                return await teamList;
            } else {
                return null;
            }
        },
    },
    computed: {
        wins: function() {
            return !this.team || this.team.wins === 0 ? {color: '#5f5f5f'} : null
        },
        loss: function() {
            return !this.team || this.team.losses === 0 ? {color: '#5f5f5f'} : null
        },
    },
    methods: {
        chooseTeam: async function(team) {
            const data = {
                team,
                group: this.group,
            }
            try {
                await axios.post("/api/groups/add", data);
            } catch (e) {
                alert(e);
            } finally {
                this.targetTeam = "";
                this.$emit('refresh');
            }
        },
        qualify: async function(team) {
            const data = {
                team,
                group: this.group,
            }
            try {
                await axios.patch("/api/groups/qualify", data);
            } catch (e) {
                alert(e);
            } finally {
                this.$emit('refresh');
            }
        }
    }
}
</script>

<style>
.qualifyButton {
    cursor: pointer;
}
</style>