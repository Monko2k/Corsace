<template>
    <div class="scheduleWrapper">
        <div class="scheduleHeaders">
            <router-link to="/brackets"><div class="scheduleHeader" :style="brackets">{{ $t('header.brackets') }}</div></router-link>
            <router-link to="/schedule"><div class="scheduleHeader" :style="schedule">{{ $t('header.schedule') }}</div></router-link>
        </div>
        <div v-if="$route.path === '/brackets'  && !loading" class="brackets">
            <iframe src="https://challonge.com/corsaceopen2020/module?theme=2&show_voting=0" width="100%" height="1000%" frameborder="0" scrolling="auto"></iframe>
        </div>
        <div v-else-if="!loading" class="schedule">
            <div class="roundHeader">
                <div class="currentRound" v-if="currentRound === latestRound">{{ $t('schedule.currStage') }}</div>
                <div class="scheduleRound">
                    <router-link :to="`/schedule/${prevRound}`" v-if="prevRound">
                        <div class="prev">&lt;&lt;</div>
                    </router-link>
                    <div class="scheduleRoundName">{{ $i18n.messages[$i18n.locale].rounds[currentRound] }}</div>
                    <router-link class="next" :to="`/schedule/${nextRound}`" v-if="nextRound">
                        <div>>></div>
                    </router-link>
                </div>
                <div class="scheduleEdit">
                    <div v-if="user.isScheduler && !edit" @click="edit = true">
                        <img src="../../Assets/img/open/editMappool.png">
                        EDIT
                    </div>
                    <div class="scheduleEditActive" v-else-if="user.isScheduler && edit" @click="edit = false">
                        <img src="../../Assets/img/open/editSave.png">
                        CLOSE EDIT
                    </div>
                </div>
            </div>
            <div class="mainSchedule">
                <div class="scheduleHeadArea">
                    <div class="scheduleSearch">
                        <div class="scheduleHeadAreaHeader">{{ $t('schedule.search') }}</div> 
                        <input class="scheduleSearchInput" v-model="teamSearch" @input="search()" :placeholder="$t('schedule.placehold')">
                    </div>
                    <div class="scheduleToggle">
                        <div class="scheduleHeadAreaHeader">{{ $t('schedule.view') }}</div>
                        <div class="scheduleToggleChoice" v-if="scheduleList.filter((match) => Date.parse(match.date) - Date.now() >= 0).length > 0" :style="upcoming" @click="filter('upcoming')">{{ $t('schedule.upcoming') }}</div>
                        <div class="scheduleToggleChoice" v-if="scheduleList.filter((match) => Date.parse(match.date) - Date.now() < 0 && !match.winner).length > 0" :style="current" @click="filter('current')">{{ $t('schedule.current') }}</div>
                        <div class="scheduleToggleChoice" v-if="scheduleList.filter((match) => Date.parse(match.date) - Date.now() < 0 && match.winner).length > 0" :style="past" @click="activeToggle('past'); filter('past')">{{ $t('schedule.past') }}</div>
                        <div class="scheduleToggleChoice" v-if="scheduleList.filter((match) => match.potential).length > 0" :style="potentials" @click="activeToggle('potentials'); filter('potentials')">POTENTIALS</div>
                    </div>
                    <div class="scheduleFilters">
                        <div class="groupsFilter">
                            <div class="scheduleHeadAreaHeader">{{ $t('schedule.filter') }}</div>
                            <div class="scheduleFilter myTeam" v-if="team.id" @click="filter('team')">{{ $t('schedule.myTeam') }}</div>
                            <div class="scheduleFilter" v-if="currentRound === 'group-stage'" @click="filter('A')">A</div>
                            <div class="scheduleFilter" v-if="currentRound === 'group-stage'" @click="filter('B')">B</div>
                            <div class="scheduleFilter" v-if="currentRound === 'group-stage'" @click="filter('C')">C</div>
                            <div class="scheduleFilter" v-if="currentRound === 'group-stage'" @click="filter('D')">D</div>
                            <div class="scheduleFilter" v-if="currentRound === 'group-stage'" @click="filter('E')">E</div>
                            <div class="scheduleFilter" v-if="currentRound === 'group-stage'" @click="filter('F')">F</div>
                            <div class="scheduleFilter" v-if="currentRound === 'group-stage'" @click="filter('G')">G</div>
                            <div class="scheduleFilter" v-if="currentRound === 'group-stage'" @click="filter('H')">H</div>
                            <div class="scheduleFilter" v-if="currentRound === 'group-stage'" @click="filter('I')">I</div>
                            <div class="scheduleFilter" v-if="currentRound === 'group-stage'" @click="filter('J')">J</div>
                            <div class="scheduleFilter" v-if="currentRound === 'group-stage'" @click="filter('K')">K</div>
                            <div class="scheduleFilter" v-if="currentRound === 'group-stage'" @click="filter('L')">L</div>
                            <div class="scheduleFilter" v-if="currentRound === 'group-stage'" @click="filter('M')">M</div>
                            <div class="scheduleFilter" v-if="currentRound === 'group-stage'" @click="filter('N')">N</div>
                            <div class="scheduleFilter" v-if="currentRound === 'group-stage'" @click="filter('O')">O</div>
                            <div class="scheduleFilter" v-if="currentRound === 'group-stage'" @click="filter('P')">P</div>
                            <div class="scheduleFilter scheduleFilterReset" v-if="user.isReferee || user.isCommentator || user.isCorsace || user.isStreamer" @click="filter('mine')">!</div>
                            <div class="scheduleFilter scheduleFilterReset" v-if="user.isStaff" @click="filter('noComm')">?C</div>
                            <div class="scheduleFilter scheduleFilterReset" v-if="user.isStaff" @click="filter('noRef')">?R</div>
                            <div class="scheduleFilter scheduleFilterReset" v-if="user.isStaff" @click="filter('noStream')">?S</div>
                            <div class="scheduleFilter scheduleFilterReset" @click="filter('reset')">X</div>
                            <div class="filler"></div>
                        </div>
                    </div>
                </div>
                <div class="mainScheduleWrapper" v-if="filterActive">
                    <schedule-match v-for="(match, index) in scheduleFiltered" :key="index" :match="match" :index="index" :edit="edit" :round="currentRound" @refresh="refresh"></schedule-match>
                </div>
                <div class="mainScheduleWrapper" v-else>
                    <schedule-match v-for="(match, index) in scheduleList" :key="index" :match="match" :index="index" :edit="edit" :round="currentRound" @refresh="refresh"></schedule-match>
                </div>
            </div>
        </div>
        <div v-else-if="loading">
            <loading></loading>
        </div>
    </div>
</template>

<script>
import ScheduleMatch from "./ScheduleMatch";
import ScheduleGroup from "./ScheduleGroup";
import Construction from "./Construction";
import Loading from "./Loading";
import axios from "axios";
import _ from "lodash";
import regeneratorRuntime from "regenerator-runtime";

export default {
    components: {
        ScheduleMatch,
        ScheduleGroup,
        Construction,
        Loading,
    },
    data: () => ({
        roundNames: [
            "round-of-32",
            "round-of-16",
            "quarter-finals",
            "semi-finals",
            "finals",
            "grand-finals",
        ],
        teamSearch: '',
        req: '',
        nextRound: "",
        currentRound: "",
        latestRound: "grand-finals",
        prevRound: "",
        loading: false,
        edit: false,
        filterActive: false,
        groupsList: [],
        scheduleList: [],
        scheduleFiltered: [],
        groupsActive: false,
        bracketsActive: false,
        scheduleActive: false,
        upcomingActive: true,
        currentActive: false,
        pastActive: false,
        potentialActive: false,
    }),
    props: {
        user: Object,
        team: Object,
    },
    created: async function() {
        this.loading = true;
        this.refresh();
    },
    computed: {
        upcoming: function() {
            if(this.upcomingActive) {
                return {
                    color: '#b64c4c',
                }
            }
        },
        past: function() {
            if(this.pastActive) {
                return {
                    color: '#b64c4c',
                }
            }
        },
        current: function() {
            if(this.currentActive) {
                return {
                    color: '#b64c4c',
                }
            }
        },
        potentials: function() {
            if (this.potentialActive) {
                return {
                    color: '#b64c4c',
                }
            }
        },
        groups: function() {
            if(this.groupsActive) {
                return {
                    color: '#b64c4c',
                    'text-shadow': '0 0 10px rgba(182,76,76,.75)',
                }
            }
        },
        brackets: function() {
            if(this.bracketsActive) {
                return {
                    color: '#b64c4c',
                    'text-shadow': '0 0 10px rgba(182,76,76,.75)',
                }
            }
        },
        schedule: function() {
            if(this.scheduleActive) {
                return {
                    color: '#b64c4c',
                    'text-shadow': '0 0 10px rgba(182,76,76,.75)',
                }
            }
        }
    },
    methods: {
        refresh: async function() {
            this.loading = true;
            if(this.$route.path === '/brackets') {
                this.groupsActive = false;
                this.bracketsActive = true;
                this.scheduleActive = false;
            } else {
                this.groupsActive = false;
                this.bracketsActive = false;
                this.scheduleActive = true;
                if(this.$route.params.round === 'grand-finals') {
                    this.scheduleList = (await axios.get("/api/matches?round=" + this.$route.params.round)).data.matches;
                    this.currentRound = this.$route.params.round;
                    this.prevRound = 'finals';
                } else {
                    const round = this.$route.params.round || this.latestRound;
                    const check = this.roundNames.findIndex((element) => element === round);
                    if(check === -1)
                        this.$router.push({ path: '/404' });
                    else {
                        this.currentRound = round;
                        this.prevRound = this.roundNames[check-1];
                        this.nextRound = this.roundNames[check+1];
                        this.scheduleList = (await axios.get("/api/matches?round=" + round)).data.matches;
                    }
                }
                if(this.req === '') {
                    if(this.scheduleList.filter((match) => Date.parse(match.date) - Date.now() >= 0).length > 0)
                        this.req = 'upcoming';
                    else if (this.scheduleList.filter((match) => Date.parse(match.date) - Date.now() < 0 && !match.winner).length > 0)
                        this.req = 'current';
                    else
                        this.req = 'past';
                }
                this.filter(this.req);
            }
            this.loading = false;
        },
        activeToggle: function(mode) {
            switch(mode) {
                case "upcoming":
                    this.upcomingActive = true;
                    this.currentActive = false;
                    this.pastActive = false;
                    this.potentialActive = false;
                    break;
                case "current":
                    this.upcomingActive = false;
                    this.currentActive = true;
                    this.pastActive = false;
                    this.potentialActive = false;
                    break;
                case "past":
                    this.upcomingActive = false;
                    this.currentActive = false;
                    this.pastActive = true;
                    this.potentialActive = false;
                    break;
                case "potentials":
                    this.upcomingActive = false;
                    this.currentActive = false;
                    this.pastActive = false;
                    this.potentialActive = true;
                    break;
                case "groups":
                    this.groupsActive = true;
                    this.bracketsActive = false;
                    this.scheduleActive = false;
                    this.potentialActive = false;
                    break;
                case "brackets":
                    this.groupsActive = false;
                    this.bracketsActive = true;
                    this.scheduleActive = false;
                    this.potentialActive = false;
                    break;
                case "schedule":
                    this.groupsActive = false;
                    this.bracketsActive = false;
                    this.scheduleActive = true;
                    this.potentialActive = false;
                    break;
                case "none":
                    this.upcomingActive = false;
                    this.currentActive = false;
                    this.pastActive = false;
                    this.potentialActive = false;
                    break;
            }
        },
        filter: function(req) {
            this.req = req;
            if (req === 'team') {
                this.activeToggle('none');
                this.filterActive = true;
                this.scheduleFiltered = this.scheduleList.filter((match) => (match.teamA && match.teamA.id === this.team.id) || (match.teamB && match.teamB.id === this.team.id));
            } else if (req === 'reset') {
                this.filterActive = false;
                this.activeToggle('none');
            } else if (req === 'upcoming') {
                this.activeToggle('upcoming');
                this.filterActive = true;
                this.scheduleFiltered = this.scheduleList.filter((match) => Date.parse(match.date) - Date.now() >= 0)
            } else if(req === 'current') {
                this.activeToggle('current');
                this.filterActive = true;
                this.scheduleFiltered = this.scheduleList.filter((match) => Date.parse(match.date) - Date.now() < 0 && !match.winner)
            } else if(req === 'past') {
                this.activeToggle('past');
                this.filterActive = true;
                this.scheduleFiltered = this.scheduleList.filter((match) => Date.parse(match.date) - Date.now() < 0 && match.winner)
            } else if (req === 'potentials') {
                this.activeToggle('potentials');
                this.filterActive = true;
                this.scheduleFiltered = this.scheduleList.filter((match) => match.potential)
            } else if(req === 'mine') {
                this.activeToggle('none');
                this.filterActive = true;
                this.scheduleFiltered = this.scheduleList.filter((match) => (match.referee && this.user.username === match.referee.username) || (match.streamer && this.user.username === match.streamer.username) || (match.commentators.length > 0 && match.commentators.some((comm) => comm.username === this.user.username)))
            } else if (req === 'noComm') {
                this.activeToggle('none');
                this.filterActive = true;
                this.scheduleFiltered = this.scheduleList.filter((match) => match.commentators.length === 0 );
            } else if (req === 'noRef') {
                this.activeToggle('none');
                this.filterActive = true;
                this.scheduleFiltered = this.scheduleList.filter((match) => !match.referee);
            } else if (req === 'noStream') {
                this.activeToggle('none');
                this.filterActive = true;
                this.scheduleFiltered = this.scheduleList.filter((match) => !match.streamer)
            } else {
                this.activeToggle('none');
                this.filterActive = true;
                this.scheduleFiltered = this.scheduleList.filter((match) => match.matchID === `${req}1` || match.matchID === `${req}2` || match.matchID === `${req}3` || match.matchID === `${req}4` || match.matchID === `${req}5` || match.matchID === `${req}6`);
            }
        },
        search: function() {
            if(this.teamSearch !== '') {
                const regex = new RegExp(this.teamSearch.split().join(".*"), "i")
                this.filterActive = true;
                this.scheduleFiltered = this.scheduleList.filter((match) => (match.teamA && match.teamA.name.match(regex)) || (match.teamB && match.teamB.name.match(regex)) || match.matchID.match(regex));
            } else
                this.filter(this.req);
        }
    }
}
</script>

<style>
.scheduleEdit {
    cursor: pointer;
    color: #866662;
    display: grid;
    grid-row-gap: 10px;
    justify-content: space-around;
    font-size: 24px;
}

.scheduleEditActive {
    color: #2dbf59;
}

.scheduleWrapper {
    justify-self: center;
    margin-top: 40px;
    width: 80%;
    height: 100%;
}

.schedule, .brackets {
    display: grid;
    grid-row-gap: 30px;
    margin: 40px 0;
    justify-self: center;
    height: 100%;
}

.scheduleHeaders {
    display: grid;
    grid-auto-flow: column;
    grid-gap: 34px;
    font-size: 20px;
    letter-spacing: 6.8px;
    text-shadow: 0 0 10px rgba(95,95,95,.75);
    justify-content: center;
}

.scheduleHeader {
    cursor: pointer;
    color: #5f5f5f;
}

.roundHeader {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.currentRound {
    font-size: 16px;
    color: #b64c4c;
    font-weight: bold;
}

.scheduleRound {
    justify-self: center;
    display: grid;
    grid-auto-flow: column;
    grid-template-columns: 1fr 7fr 1fr;
    justify-items: center;
    align-items: center;
    color: #ffffff;
    font-size: 60px;
    font-weight: bold;
    text-shadow: 3.5px 3.5px 5px rgba(24, 7, 0, 0.75);
    justify-items: top;
}

.scheduleRoundName {
    grid-column: 2/3;
}

.next, .prev {
    cursor: pointer;
    color: #b64c4c;
    padding: 10px;
}

.next {
    grid-column: 3/4;
}

.mainSchedule {
    display: grid;
    grid-auto-flow: row;
    grid-gap: 20px;
    padding: 40px;
    background-color: #202020;
    justify-self: center;
}

.scheduleHeadArea {
    display: grid;
    grid-template-rows: 1fr 1fr;
    align-items: start;
    grid-column-gap: 32px;
}

.scheduleHeadAreaHeader {
    letter-spacing: 1.6px;
    color: #b64c4c;
    align-self: center;
    justify-self: center;
    grid-column: 1/3;
}

.scheduleSearch, .scheduleToggle, .scheduleFilters {
    display: grid;
    grid-auto-flow: column;
    align-items: center;
    width: max-content;
    grid-gap: 10px;
}

.scheduleSearch, .scheduleToggle {
    grid-column-start: 1;
    align-self: center;
}

.scheduleFilters {
    grid-column-start: 2;
    grid-row: 1/3;
}

.scheduleSearchInput, .scheduleSearchInput::placeholder {
    background-color: black;
    border: 0;
    outline: 0;
    font: inherit;
    font-size: 14px;
    color: #515151;
}

.scheduleSearchInput::placeholder {
    font-style: italic;
}

.scheduleSearchInput {
    padding: 4.5px;
}

.scheduleToggleChoice {
    font-weight: bold;
    color: #5f5f5f;
    cursor: pointer;
}

.groupsFilter {
    display: grid;
    grid-auto-flow: row;
    grid-gap: 10px;
    grid-template-rows: 1fr 1fr;
    grid-template-columns: repeat(15, 1fr);
}

.scheduleFilter {
    color: #b64c4c;
    letter-spacing: 1.2px;
    font-size: 12px;
    border: solid;
    border-radius: 10px;
    border-width: 2px;
    text-align: center;
    padding: 8px;
    cursor: pointer;
    align-self: center;
}

.scheduleFilterReset {
    font-weight: bold;
    border-width: 4px;
    border-radius: 20px;
}

.myTeam {
    grid-column: 3/5;
}

.filler {
    grid-row: 2/3;
    grid-column: 1/3;
}

.mainScheduleWrapper {
    display: grid;
    grid-gap: 20px;
}

.groups {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-gap: 40px;
    margin-top: 40px;
    margin-bottom: 40px;
}

.group {
    position: relative;
    display: grid;
    align-items: center;
    grid-template-columns: 2fr 10fr 1fr 1fr 1fr;
    background-color: #202020;
    padding: 20px;
    grid-gap: 10px;
}

.groupName, .groupWin, .groupLose {
    grid-row: 1/2;
    font-size: 18px;
    letter-spacing: 0.3px;
    font-weight: bold;
    color: #b64c4c;
    margin-bottom: 10px;
}

.groupName {
    grid-column: 1/3;
}

.groupWin, .groupLose, .groupTeamWin, .groupTeamLose {
    text-align: center;
}

.groupTeam {
    display: contents;
}

.groupTeamInfo {
    display: contents;
}

.groupTeamAva {
    grid-column: 1/2;
    height: 48px;
    width: 48px;
}

.groupTeamName {
    font-size: 18px;
}

.groupInput, .groupInput::placeholder {
    background: none;
    border: none;
    font: inherit;
    color: #c8cfd5;
    outline: none;
}

.groupTeamWin, .groupTeamLose {
    font-size: 24px;
    font-weight: bold;
}

.groupTeamWin {
    grid-column: 3/4;
}

.groupTeamLose {
    grid-column: 4/5;
}

.groupSearchResults {
    top: initial;
    bottom: -15%;
}

.delTeam {
    cursor: pointer;
    grid-column: 5/6;
    justify-self: end;
}
</style>
