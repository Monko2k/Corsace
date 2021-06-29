<template>
    <div>
        <div class="matchPageWrapper" v-if="!loading">
            <div class="matchSubheader">
                <div class="firstInfo" v-if="edit && match.teamA && match.teamB && (match.referee && match.referee.id === user.id || user.isCorsace)">
                    Team 1 is <span :class="firstA" @click="first(match.teamA.name)">{{ match.teamA.name }}</span> <span :class="firstB" @click="first(match.teamB.name)">{{ match.teamB.name }}</span>
                </div>
                <div class="staffEditMatch" v-if="!edit && (user.isScheduler || user.isStreamManager || (match.referee && match.referee.id === user.id))" @click="edit=true">
                    <img src="../../Assets/img/open/editMappool.png"> EDIT MATCH
                </div>
                <div class="staffEditMatch active" v-else-if="edit" @click="edit=false">
                    <img src="../../Assets/img/open/editSave.png"> SAVE MATCH RESULT
                </div>
            </div>
            <div class="matchHeader">
                <div class="matchTitle">{{ $t('match.info') }} <span class="matchID">{{ match.matchID }}</span></div>
                <div class="matchDateandInfo">
                    <div class="matchDateEditWrapper" v-if="edit && user.isScheduler">
                        <input class="matchDate matchDateEdit" v-model="timeInput">
                        <input class="matchDate matchDateEdit" v-model="dateInput">
                        <div class="searchResults matchSearchResults">
                            <div v-for="(time, index) in timesFiltered" :key="index">
                                <p class="searchSelection" @click="chooseTime(time)">{{ time }}</p>
                            </div>
                        </div>
                        <div class="searchResults matchSearchResults">
                            <div v-for="(date, index) in datesFiltered" :key="index">
                                <p class="searchSelection" @click="chooseDate(date)">{{ date }}</p>
                            </div>
                        </div>
                    </div>
                    <div class="matchDate" v-else>
                        <div>{{ match.date.split('T')[1].slice(0,5) }} UTC</div>
                        <div>{{ match.date.split('-')[2].split('T')[0] }} {{ month }}</div>
                    </div>
                    
                    <div v-if="edit" class="matchLinkInputWrapper">
                        <input class="matchLinkInput" :placeholder="twitch === '' ? 'enter twitch vod url' : twitch" v-if="user.isStreamManager && match.teamA && match.teamB" v-model="twitch" @input="addTwitch">
                        <input class="matchLinkInput" :placeholder="mp === '' ? 'enter osu!mp url' : mp" v-if="user.isReferee && match.teamA && match.teamB && (match.referee && match.referee.id === user.id || user.isCorsace) " v-model="mp" @input="addMP">
                    </div>
                    <div v-else class="matchLinks">
                        <a :href="match.twitch ? match.twitch : 'https://twitch.tv/corsace'"><img src="../../Assets/img/open/twitchMatch.png"></a>
                        <a :href="match.mp ? `https://osu.ppy.sh/community/matches/${match.mp}` : null"><img v-if="match.mp" src="../../Assets/img/open/osuMatch.png"></a>
                    </div>
                    <div v-if="edit && (match.referee && match.referee.id === user.id || user.isCorsace) && !match.winner" class="matchVs">
                        Forfeit? Who won?
                        <select class="demeritAmountDropdown" v-model="teamWin" @change="ff">
                            <option disabled value="">Select one</option>
                            <option :value="'A'">{{ match.teamA ? match.teamA.name : "" }}</option>
                            <option :value="'B'">{{ match.teamB ? match.teamB.name : "" }}</option>
                        </select>
                    </div>
                    <div v-if="edit && match.winner && (match.referee && match.referee.id === user.id || user.isScheduler || user.isHeadStaff)" class="disqualifyButton resetButton" @click="reset"></div>
                    <div v-if="edit && !match.winner && !match.potential && user.isScheduler" @click="potentials" class="potentials">Create potentials</div>
                </div>
                <div class="matchVs" v-if="!edit || (edit && !user.isCorsace)">
                    <router-link :to="match.teamA ? `/team/${match.teamA.slug}` : null"><span class="matchVsTeam">{{match.teamA ? match.teamA.name : 'N/A'}}</span></router-link> vs <router-link :to="match.teamB ? `/team/${match.teamB.slug}` : null"><span class="matchVsTeam">{{match.teamB ? match.teamB.name : 'N/A'}}</span></router-link>
                </div>
                <div class="matchVs" v-else-if="edit && user.isCorsace">
                    <input class="matchVsTeam" v-model="teamA"> vs <input class="matchVsTeam" v-model="teamB">
                    <div class="searchResults matchTeamSelection">
                        <div v-for="(team, index) in teamsAFiltered" :key="index">
                            <p class="searchSelection" v-if="!match.teamA || teamA !== match.teamA.name" @click="chooseTeam(team, 'A')">{{ team.name }}</p>
                        </div>
                    </div>
                    <div class="searchResults matchTeamSelection">
                        <div v-for="(team, index) in teamsBFiltered" :key="index">
                            <p class="searchSelection" v-if="!match.teamB || teamB !== match.teamB.name" @click="chooseTeam(team, 'B')">{{ team.name }}</p>
                        </div>
                    </div>
                </div>
            </div>
            <div class="matchStaffList">
                <div class="matchRef" :style="user.isReferee ? {cursor: 'pointer'} : null" @click="user.isReferee ? staffReg('referee') : null">
                    <span v-if="match.referee && user.id === match.referee.id" class="matchStaffer bold">-</span><span v-else-if="user.isReferee" class="matchStaffer bold">+</span> {{ $t('match.referees') }}: <span v-if="match.referee" class="matchStaffer">{{ match.referee.username }}</span>
                </div>
                <div class="matchStream" :style="user.isStreamer ? {cursor: 'pointer'} : null" @click="user.isStreamer ? staffReg('streamer') : null">
                    <span v-if="match.streamer && user.id === match.streamer.id" class="matchStaffer bold">-</span><span v-else-if="user.isStreamer" class="matchStaffer bold">+</span> {{ $t('match.streamers') }}: <span v-if="match.streamer" class="matchStaffer">{{ match.streamer.username }}</span>
                </div>
                <div class="matchComm" :style="user.isCommentator ? {cursor: 'pointer'} : null" v-if="!match.commentators || match.commentators.length === 0" @click="user.isCommentator ? staffReg('commentator') : null">
                    <span v-if="user.isCommentator" class="matchStaffer bold">+</span> {{ $t('match.commentators') }}: 
                </div>
                <div class="matchComm" :style="user.isCommentator ? {cursor: 'pointer'} : null" v-else @click="user.isCommentator ? staffReg('commentator') : null">
                    <span v-if="match.commentators && match.commentators.some(comm => comm.id === user.id)" class="matchStaffer bold">-</span><span v-else-if="user.isCommentator" class="matchStaffer bold">+</span> {{ $t('match.commentators') }}: <span class="matchStaffer" v-for="(commentator, index) in match.commentators" :key="index">{{ commentator.username }}<span v-if="index + 1 < match.commentators.length">, </span></span>
                </div>
            </div>
            <div v-if="!spoiler && match.winner" @click="spoiler = true" class="matchResultFinalSpoiler">
                <div>{{ $t('match.reveal') }}</div>
            </div>
            <div v-if="spoiler" class="matchResultFinal">
                <div class="filler1"></div>
                <div class="matchScoreFinal">
                    <div class="teamAMatchScoreFinal">
                        <div class="teamAMatchScoreFinal" v-for="index in (match.bestOf + 1) / 2" :key="index">
                            <img v-if="match.teamAScore >= index" src='../../Assets/img/open/full-match.png'>
                            <img v-else src='../../Assets/img/open/empty-match.png'>
                        </div>
                    </div>
                    <div class="teamBMatchScoreFinal">
                        <div class="teamBMatchScoreFinal" v-for="index in (match.bestOf + 1) / 2" :key="index">
                            <img v-if="match.teamBScore >= index" src='../../Assets/img/open/full-match.png'>
                            <img v-else src='../../Assets/img/open/empty-match.png'>
                        </div>
                    </div>
                </div>
                <div class="matchScoreFinal" v-for="(set, index) in match.sets" :key="index">
                    <div class="teamAMatchScoreFinal">
                        <div v-for="index in 4" :key="index">
                            <img v-if="set.teamAScore >= index" src='../../Assets/img/open/full-set.png'>
                            <img v-else src='../../Assets/img/open/empty-set.png'>
                        </div>
                    </div>
                    <div class="teamBMatchScoreFinal">
                        <div v-for="index in 4" :key="index">
                            <img v-if="set.teamBScore >= index" src='../../Assets/img/open/full-set.png'>
                            <img v-else src='../../Assets/img/open/empty-set.png'>
                        </div>
                    </div>
                </div>
                <div class="filler2"></div>
                <div class="matchWinnerFinal" v-if="match.winner">
                    <router-link :to="`/team/${match.winner.slug}`">{{ match.winner.name }}</router-link> {{ $t('match.wins') }}
                </div>
                <a href='#bottom' class="matchToBottom">{{ $t('match.bottom') }} <img src="../../Assets/img/open/triangle.png"></a>
            </div>
            <span class="matchBans" v-if="spoiler && match.winner">MATCH BANS</span>
            <div v-for="index in match.bestOf === 3 ? 2 : 4" :key="index">
                <match-map-ban v-if="edit || match.bans[index-1] && spoiler && ((match.winner && match.sets.length !== 0) || (match.referee && match.referee.username === user.username) || user.isCorsace)" @refresh="refresh" :matchid="match.matchID" :edit="edit" :set-num="0" :set-map="match.bans[index-1] ? match.bans[index-1] : null" :map-num="1" :team="index % 2 === 1 ? (match.first ? match.first : null) : (match.first && match.first.name === match.teamA.name ? match.teamB : (match.first ? match.teamA : null))"></match-map-ban>
            </div>
            <span class="matchBans" v-if="spoiler && match.winner">SET INFO</span>
            <div class="mainMatchSection" v-for="index in match.bestOf" :key="index">
                <match-set v-if="spoiler && (edit || match.sets[index-1])" @refresh="refresh" :edit="edit" :set="match.sets.length > 0 ? match.sets[index-1] : null" :set-num="index" :team-a="match.teamA" :team-b="match.teamB" :first="match.first" :match="match" :user="user"></match-set>
            </div>
            <div><a name="bottom"></a></div>
        </div>
        <div v-else-if="loading">
            <loading></loading>
        </div>
    </div>
</template>

<script>
import axios from "axios";
import regeneratorRuntime from "regenerator-runtime";
import MatchSet from "./MatchSet";
import MatchMapBan from "./MatchMapBan";
import Loading from "./Loading";

export default {
    components: {
        MatchSet,
        MatchMapBan,
        Loading,
    },
    data: () => ({
        loading: false,
        demeritComponentToggle: false,
        edit: false,
        spoiler: false,
        timeInput: '',
        dateInput: '',
        prevTime: '',
        prevDate: '',
        twitch: '',
        mp: '',
        teamWin: '',
        dates: [],
        times: [],
        match: {},
        teamA: '',
        teamB: '',
        regex: /^https:\/\/osu\.ppy\.sh\/(mp|community\/matches)\/(\d+)/,
    }),
    props: {
        user: Object,
    },
    created: async function() {
        this.loading = true;
        await this.refresh();
        this.prevTime = this.timeInput = this.match.date.split('T')[1].slice(0,5);
        this.prevDate = this.dateInput = this.match.date.split('-')[2].split('T')[0] + " " + this.month;
        for(var i = 0; i < 25; i++) {
            if(i >= 10) {
                const hour = `${i}:00`;
                const halfHour = `${i}:30`
                this.times.push(hour, halfHour);
            } else {
                const hour = `0${i}:00`;
                const halfHour = `0${i}:30`
                this.times.push(hour, halfHour);
            }
        }
        for(var i = 0; i < 31; i++) {
            if(i < 30) {
                const date = `${i+1} JAN`;
                const date1 = `${i+1} SEP`;
                const date2 = `${i+1} OCT`;
                const date3 = `${i+1} NOV`;
                this.dates.push(date, date1, date2, date3);
            } else {
                const date = `${i+1} JAN`;
                const date2 = `${i+1} OCT`;
                this.dates.push(date, date2);
            }
        }
    },
    updated: function() {
        if(this.match.date && this.prevTime !== this.match.date.split('T')[1].slice(0,5)) {
            this.prevTime = this.timeInput = this.match.date.split('T')[1].slice(0,5);
        }
        if(this.match.date && this.prevDate !== this.match.date.split('-')[2].split('T')[0] + " " + this.month) {
            this.prevDate = this.dateInput = this.match.date.split('-')[2].split('T')[0] + " " + this.month;
        }
    },
    asyncComputed: {
        async teamsAFiltered() {
            if(this.teamA !== "" && (this.match.teamA ? this.teamA !== this.match.teamA.name : true)) {
                const teamList = (await axios.get("/api/team/search?regex=" + this.teamA)).data.teams;
                return await teamList;
            } else {
                return null;
            }
        },
        async teamsBFiltered() {
            if(this.teamB !== "" && (this.match.teamB ? this.teamB !== this.match.teamB.name : true)) {
                const teamList = (await axios.get("/api/team/search?regex=" + this.teamB)).data.teams;
                return await teamList;
            } else {
                return null;
            }
        },
    },
    computed: {
        firstA: function() {
            return this.match.teamA && this.match.first && this.match.first.name === this.match.teamA.name ? 'first' : 'second';
        },
        firstB: function() {
            return this.match.teamB && this.match.first && this.match.first.name === this.match.teamB.name ? 'first' : 'second';
        },
        month: function() {
            const date = this.match.date.split('-')[1];
            switch(date) {
                case '09':
                    return 'SEP';
                    break;
                case '10':
                    return 'OCT';
                    break;
                case '11':
                    return 'NOV';
                    break;
            }
        },
        timesFiltered: function() {
            if (this.match && this.timeInput !== this.match.date.split('T')[1].slice(0,5)) {
                const regex = new RegExp(this.timeInput.split().join(".*"), 'i');
                return this.times.filter(time => time.match(regex));
            } else {
                return [];
            }
        },
        datesFiltered: function() {
            if (this.match && this.dateInput !== this.match.date.split('-')[2].split('T')[0] + " " + this.month) {
                const regex = new RegExp(this.dateInput.split().join(".*"), 'i');
                return this.dates.filter(date => date.match(regex));
            } else {
                return [];
            }
        },
    },
    methods: {
        refresh: async function() {
            this.match = (await axios.get(`/api/matches/find?id=${this.$route.params.id.toUpperCase()}`)).data.match
            if(this.match.referee && this.match.referee.id === this.user.id || !this.match.winner || this.user.isCorsace)
                this.spoiler = true;

            if(this.match.twitch)
                this.twitch = this.match.twitch;

            if(this.match.mp)
                this.mp = `https://osu.ppy.sh/community/matches/${this.match.mp}`;

            if(this.match.teamA)
                this.teamA = this.match.teamA.name

            if(this.match.teamB)
                this.teamB = this.match.teamB.name

            if(this.match.sets.length > 0) {
                this.match.sets.forEach(set => {
                    if(set) {
                        set.picks.forEach(pick => {
                            if(pick) {
                                pick.teamAScores.sort((a, b) => b.score - a.score)
                                pick.teamBScores.sort((a, b) => b.score - a.score)
                            }
                        })
                    }
                })
            }
            this.loading = false;
        },
        staffReg: async function(role) {
            const data = {
                match: this.match.matchID,
                role,
            }
            await axios.patch('/api/matches/staff', data);
            await this.refresh();
        },
        addTwitch: async function() {
            const data = {
                match: this.match.matchID,
                twitch: this.twitch,
            }
            await axios.patch('/api/matches/twitch', data);
            await this.refresh();
        },
        addMP: async function() {
            if (!this.regex.test(this.mp))
                return alert("Invalid mp link!");
            const result = this.regex.exec(this.mp)[2];
            const data = {
                match: this.match.matchID,
                mp: result,
            }
            try {
                await axios.patch('/api/matches/mp', data);
            } catch (e) {
                alert(e)
            } finally {
                await this.refresh();
            }
        },
        chooseTime: async function(time) {
            if(time === this.match.date.split('T')[1].slice(0,5)) {
                this.timeInput = this.match.date.split('T')[1].slice(0,5);
            } else {
                const data = {
                    match: this.match.matchID,
                    time,
                }
                try {
                    await axios.patch("/api/matches/time", data);
                } catch(e) {
                    alert(e);
                } finally {
                    this.timeInput = time;
                    await this.refresh();
                }
            }
        },
        chooseDate: async function(date) {
            if(date === this.match.date.split('-')[2].split('T')[0] + " " + this.month) {
                this.dateInput = this.match.date.split('-')[2].split('T')[0] + " " + this.month;
            } else {
                const data = {
                    match: this.match.matchID,
                    date,
                }
                try {
                    await axios.patch("/api/matches/date", data);
                } catch(e) {
                    alert(e);
                } finally {
                    this.dateInput = date;
                    await this.refresh();
                }
            }
        },
        chooseTeam: async function(team, pos) {
            const data = {
                match: this.match.matchID,
                team,
                pos,
            }
            await axios.patch('/api/matches/teamChange', data);
            await this.refresh();
        },
        first: async function(winner) {
            const data = {
                match: this.match.matchID,
                winner,
            }
            await axios.patch('/api/matches/first', data);
            await this.refresh();
        },
        ff: async function() {
            const data = {
                match: this.match.matchID,
                winner: this.teamWin,
            }
            await axios.patch('/api/matches/default', data);
            await this.refresh();
        },
        potentials: async function() {
            const data = {
                match: this.match.matchID,
            }
            try {
                await axios.patch('/api/matches/potentials', data);
                alert("Potentials created!")
            } catch (e) {
                alert("An error occurred check console.");
                console.log(e);
            }
            await this.refresh();
        },
        reset: async function() {
            if(confirm('Are you sure you want to reset this match?')) {
                const data = {
                    match: this.match.matchID,
                }
                await axios.patch("/api/matches/reset", data);
                await this.refresh();
            }
        }
    }
}
</script>

<style>
.matchPageWrapper {
    position: relative;
    display: grid;
    grid-gap: 15px;
    margin-top: 40px;
    padding: 40px 80px;
    justify-self: center;
    background-color: #202020;
    left: 0;
    right: 0;
    margin-left: auto;
    margin-right: auto;
    width: 800px;
}

.matchSubheader {
    display: grid;
    grid-auto-flow: column;
    align-items: center;
}

.firstInfo {
    font-size: 18px;
    font-style: italic;
}

.second, .first {
    cursor: pointer;
    font-weight: bold;
}

.second {
    color: #5f5f5f;
}

.first {
    color: #b64c4c;
}

.staffEditMatch {
    color: #866662;
    cursor: pointer;
    font-size: 24px;
    display: grid;
    grid-column-gap: 5px;
    grid-auto-flow: column;
    justify-self: end;
}

.active {
    color: #2fc45c;
}

.matchHeader {
    display: grid;
    position: relative;
    grid-column-gap: 20px;
}

.matchDemerits {
    right: 0;
    top: 53%;
}

.matchTitle {
    font-size: 64px;
    font-weight: bold;
    white-space: nowrap;
}

.matchID {
    color: #b64c4c;
}

.matchDateandInfo {
    grid-column: 2/3;
    grid-row: 1/3;
    justify-self: end;
    text-align: right;
}

.matchDate, .matchDate::placeholder {
    font-size: 24px;
    font-weight: bold;
    background: none;
    border: 0;
    outline: 0;
    font-family: inherit;
    color: white;
}

.matchDateEdit {
    font-style: italic;
    width: 4em;
    height: 1em;
    text-align: start;
}

.matchDateEditWrapper {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
}

.matchSearchResults {
    width: 200px;
    z-index: 100;
    margin: auto;
    left: 80%;
    top: 9%;
}

.matchLinks, .matchLinkInputWrapper {
    margin-top: 9px;
}

.matchLinkInputWrapper {
    display: flex;
    flex-direction: column;
}

.matchBans {
    text-align: center;
    font-weight: bold;
    font-size: 30px;
}

.matchLinkInput, .matchLinkInput::placeholder {
    text-align: right;
    padding: 0 2px;
    font-size: 12px;
    color: #b64c4c;
    line-height: 15px;
    font-style: italic;
    background: 0;
    border: 0;
    outline: 0;
    font-family: inherit;
}

.matchVs {
    font-size: 28px;
    font-weight: bold;
}

.matchVsTeam {
    color: #b64c4c;
    background: 0;
    border: 0;
    outline: 0;
    font: inherit;
    width: 296px;
}

.matchStaffList {
    background-color: rgba(0, 0, 0, 0.5);
    font-size: 20px;
    font-weight: bold;
    padding: 15px;
    display: grid;
    grid-template-areas:
    'matchRef matchRef matchStream matchStream'
    'matchComm matchComm matchComm matchComm';
    grid-auto-flow: row;
    grid-row-gap: 8px;
    grid-template: 1fr 1fr 1fr 1fr;
    min-width: 0;
    min-height: 0;
}

.matchRef {
    grid-area: matchRef;
}

.matchStream {
    grid-area: matchStream;
}

.matchComm {
    grid-area: matchComm;
}

.matchStaffer {
    font-weight: normal;
    color: #b64c4c;
}

.bold {
    font-weight: bold;
}

.matchResultFinalSpoiler {
    background: rgba(0, 0, 0, 0.5);
    display: grid;
    cursor: pointer;
    justify-items: center;
    align-items: center;
    height: 4em;
    padding: 9px;
}

.matchResultFinal {
    background: rgba(0, 0, 0, 0.5);
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    grid-template-rows: auto;
    grid-row-gap: 10px;
    padding: 9px;
}

.matchScoreFinal {
    display: grid;
    grid-auto-flow: column;
    grid-gap: 20px;
    justify-self: center;
    grid-column: 2/3;
}

.matchWinnerFinal {
    font-size: 18px;
    font-weight: bold;
    letter-spacing: 0.2px;
    text-align: center;
    grid-column: 2/3;
}

.matchToBottom {
    justify-self: end;
    text-align: right;
    color: #5f5f5f;
    font-size: 12px;
    cursor: pointer;
    grid-row: 1/2;
    grid-column: 3/4;
}

.filler1 {
    grid-area: filler1;
}

.filler2 {
    grid-area: filler2;
}

.mainMatchSection {
    display: grid;
    grid-gap: 75px;
}

.refDemerit {
    cursor: pointer;
}

.matchTeamSelection {
    bottom: -60px;
}

.resetButton {
    position: absolute;
    cursor: pointer;
    height: 10px;
    width: 10px;
    background-color: red;
    border-radius: 50%;
}

.teamAMatchScoreFinal, .teamBMatchScoreFinal {
    display: grid;
    grid-auto-flow: column;
    grid-gap: 5px;
}

.demeritAmountDropdown {
    border: 0;
    outline: 0;
    background-color: black;
    color: white;
    font: inherit;
    font-size: 20px;
}

.potentials {
    padding: 10px 0;
    margin: 10px 0;
    border-radius: 10px;
    background-color: black;
    text-align: center;
    cursor: pointer;
}
</style>