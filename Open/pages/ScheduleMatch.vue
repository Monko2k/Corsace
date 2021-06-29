<template>
    <div class="matchWrapper" @mouseenter="!edit ? active = !active : null" @mouseleave="!edit ? active = !active : null">
        <div class="match" :class="[ firstMatch, potentialMatch ]">
            <div class="matchTeamA">
                <div class="matchTeamPP">{{ match.teamA ? `${Math.round(match.teamA.averageBWS)} BWS` : 'N/A BWS' }}</div>
                <div class="matchTeamName">{{ match.teamA ? match.teamA.name : 'N/A' }}</div>
            </div>
            <div class="matchTime" v-if="!edit">
                <div class="matchTimeHour">{{ match.date.split('T')[1].slice(0,5) }}</div>
                <div class="matchTimeHour">UTC</div>
                <div class="matchTimeDate">{{ match.date.split('-')[2].split('T')[0] }} {{ month }}</div>
            </div>
            <div class="matchTime" v-else-if="edit">
                <input class="matchTimeHour inputTime" v-model="timeInput">
                <input class="matchTimeDate inputTime inputTimeDate" v-model="dateInput">
                <div class="searchResults scheduleSearchResults">
                    <div v-for="(time, index) in timesFiltered" :key="index">
                        <p class="searchSelection" @click="chooseTime(time)">{{ time }}</p>
                    </div>
                </div>
                <div class="searchResults scheduleSearchResults">
                    <div v-for="(date, index) in datesFiltered" :key="index">
                        <p class="searchSelection" @click="chooseDate(date)">{{ date }}</p>
                    </div>
                </div>
            </div>
            <div class="matchTeamB">
                <div class="matchTeamPP">{{ match.teamB ? `${Math.round(match.teamB.averageBWS)} BWS` : 'N/A BWS' }}</div>
                <div class="matchTeamName">{{ match.teamB ? match.teamB.name : 'N/A' }}</div>
            </div>
            <div class="staffIcons">
                <img v-if="match.referee" src="../../Assets/img/open/ref.png">
                <img v-if="match.streamer" src="../../Assets/img/open/stream.png">
                <img v-if="match.commentators.length !== 0" v-for="(x, index) in match.commentators" :key="index" src="../../Assets/img/open/comm.png">
            </div>
        </div>
        <router-link :to="`/match/${match.matchID}`">
            <transition name="fade" v-if="!edit">
                <div class="match matchOverlay" :class="[firstMatch, potentialMatch]" v-show="active === true">
                    <div class="matchTeamAOverlay" v-if="match.teamA">
                        <div class="matchTeamPlayer" v-for="(member, index) in match.teamA.members" :key="index">
                            <div class="matchPlayerPP">{{ Math.round(Math.pow(member.rank, Math.pow(0.9937, Math.pow(member.badges, 2)))) }} BWS</div>
                            <div class="matchPlayerName">{{member.username}}</div>
                        </div>
                        <div class="matchOverlayFiller"></div>
                    </div>
                    <div class="matchTime" v-if="Date.parse(match.date) - Date.now() > 0 && $i18n.locale === 'kr'">
                        <div class="matchTimeLeft scheduleMatchID">{{ match.matchID }}</div>
                        <div class="matchTimeHour">{{ $t('schedule.until').replace('(Insert Time Here)', timeLeft) }}</div>
                    </div>
                    <div class="matchTime" v-else-if="Date.parse(match.date) - Date.now() > 0 && $i18n.locale === 'jp'">
                        <div class="matchTimeLeft">{{ $t('schedule.until') }}</div>
                        <div class="matchTimeHour">{{ timeLeft }}</div>
                        <div class="matchTimeLeft scheduleMatchID">{{ match.matchID }}</div>
                    </div>
                    <div class="matchTime" v-else-if="Date.parse(match.date) - Date.now() > 0">
                        <div class="matchTimeLeft scheduleMatchID">{{ match.matchID }}</div>
                        <div class="matchTimeHour">{{ timeLeft }}</div>
                        <div class="matchTimeLeft">{{ $t('schedule.until') }}</div>
                    </div>
                    <div class="matchTeamBOverlay" v-if="match.teamB">
                        <div class="matchTeamPlayer" v-for="(member, index) in match.teamB.members" :key="index">
                            <div class="matchPlayerPP">{{ Math.round(Math.pow(member.rank, Math.pow(0.9937, Math.pow(member.badges, 2)))) }} BWS</div>
                            <div class="matchPlayerName">{{member.username}}</div>
                        </div>
                    </div>
                </div>
            </transition>
        </router-link>
    </div>
</template>

<script>
import axios from "axios";
import regeneratorRuntime from "regenerator-runtime";

export default {
    data: () => ({
        active: false,
        timeInput: '',
        dateInput: '',
        prevTime: '',
        prevDate: '',
        dates: [],
        times: [],
    }),
    props: {
        round: String,
        edit: Boolean,
        index: Number,
        match: Object,
    },
    created: function() {
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
                const date1 = `${i+1} SEP`;
                const date2 = `${i+1} OCT`;
                const date3 = `${i+1} NOV`;
                const date4 = `${i+1} DEC`;
                const date5 = `${i+1} JAN`;
                this.dates.push(date1, date2, date3, date4, date5);
            } else {
                const date2 = `${i+1} OCT`;
                const date4 = `${i+1} DEC`;
                const date5 = `${i+1} JAN`;
                this.dates.push(date2, date4, date5);
            }
        }
    },
    updated: function() {
        if(this.prevTime !== this.match.date.split('T')[1].slice(0,5)) {
            this.prevTime = this.timeInput = this.match.date.split('T')[1].slice(0,5);
        }
        if(this.prevDate !== this.match.date.split('-')[2].split('T')[0] + " " + this.month) {
            this.prevDate = this.dateInput = this.match.date.split('-')[2].split('T')[0] + " " + this.month;
        }
    },
    computed: {
        timesFiltered: function() {
            if (this.timeInput !== this.match.date.split('T')[1].slice(0,5)) {
                const regex = new RegExp(this.timeInput.split().join(".*"), 'i');
                return this.times.filter(time => time.match(regex));
            } else {
                return [];
            }
        },
        datesFiltered: function() {
            if (this.dateInput !== this.match.date.split('-')[2].split('T')[0] + " " + this.month) {
                const regex = new RegExp(this.dateInput.split().join(".*"), 'i');
                return this.dates.filter(date => date.match(regex));
            } else {
                return [];
            }
        },
        firstMatch: function() {
            if(this.index === 0)
                return 'nextMatch'
        },
        potentialMatch: function() {
            if (this.match && this.match.potential)
                return 'potentialMatch'
        },
        month: function() {
            const date = this.match.date.split('-')[1];
            switch(date) {
                case '01':
                    return 'JAN';
                    break;
                case '09':
                    return 'SEP';
                    break;
                case '10':
                    return 'OCT';
                    break;
                case '11':
                    return 'NOV';
                    break;
                case '12':
                    return 'DEC';
                    break;
            }
        },
        timeLeft: function() {
            const matchDateLeft = Date.parse(this.match.date) - Date.now();
            if (matchDateLeft < 0) {
                return '00:00';
            }
            if (matchDateLeft < 86400000) {
                var hours = Math.round(matchDateLeft/3600000);
                var minutes = Math.round(Math.round((matchDateLeft/60000)) % 60);
                return (hours < 10 ? `0${hours}` : hours) + ':' + (minutes < 10 ? `0${minutes}` : minutes);
            } else {
                return Math.round(matchDateLeft/86400000) + this.$i18n.messages[this.$i18n.locale].schedule.days;
            }
        }
    },
    methods: {
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
                    this.$emit('refresh');
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
                    this.$emit('refresh');
                }
            }
        }
    }
}
</script>

<style>
.matchWrapper {
    position:relative;
}

.match {
    cursor: pointer;
    position: relative;
    display: grid;
    grid-auto-flow: column;
    grid-gap: 7px;
    grid-template-columns: 6fr 1fr 6fr;
    color: #67fdff;
    box-shadow: 0 0 10px rgba(103,253,255,.75);
    padding: 15px;
    border: solid;
    border-radius: 15px;
    height: 40px;
}

.nextMatch {
    color: #fff17e;
    box-shadow: 0 0 10px rgba(255,241,126,.75);
}

.potentialMatch {
    color: black;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.75);
}

.matchTeamA, .matchTeamB {
    color: #b64c4c;
    display: grid;
    grid-row-gap: 2px;
}

.matchTeamA {
    text-align: right;
    justify-self: right;
}

.matchTeamPP, .matchPlayerPP {
    color: #866662;
    font-size: 14px;
    letter-spacing: 1.4px;
}

.matchTeamName {
    font-size: 24px;
    font-weight: bold;
}

.matchTime {
    color: white;
    align-self: center;
    justify-items: center;
    display: grid;
    text-align: center;
    grid-column: 2/3;
}

.matchTimeHour {
    font-size: 17px;
    letter-spacing: 3.7px;
    font-weight: bold;
}

.matchTimeDate {
    font-size: 15px;
    font-weight: bold;
    letter-spacing: 3.3px;
}

.inputTime {
    background: none;
    border: 0;
    outline: 0;
    font: inherit;
    font-weight: bold;
    font-size: 17px;
    color: white;
    justify-self: center;
    text-align: center;
    width: 5em;
    height: 1em;
}

.inputTimeDate {
    font-size: 15px;
}

.matchTeamB {
    text-align: left;
    justify-self: left;
}

.staffIcons {
    position: absolute;
    right: 0;
    bottom: 0;
    padding: 10px;
    display: grid;
    grid-auto-flow: column;
    grid-gap: 10px;
}

.matchOverlay {
    position: absolute;
    top: 0;
    background-color: #202020;
    width: -moz-available;
    width: -webkit-fill-available;
    width: fill-available;
}

.matchTeamAOverlay, .matchTeamBOverlay {
    display: grid;
    grid-auto-flow: column;
    grid-template-columns: 1fr 1fr 1fr;
    grid-template-rows: 1fr 1fr 1fr;
    grid-column-gap: 8px;
}

.matchTeamAOverlay {
    justify-self: end;
    grid-column: 1/2;
}

.matchTeamBOverlay {
    justify-self: start;
    grid-column: 3/4;
}

.matchPlayerName {
    color: #c8cfd5;
    letter-spacing: 0.1px;
    white-space: nowrap;
}

.matchTeamPlayer {
    display: grid;
    grid-auto-flow: column;
    grid-gap: 5px;
    font-size: 12px;
    white-space: nowrap;
}

.matchPlayerPP {
    font-size: 12px;
}

.matchOverlayFiller {
    grid-row: 3/4;
    grid-column: 1/2;
}

.matchTimeLeft {
    font-size: 11px;
    font-weight: bold;
    color: white;
}

.scheduleMatchID {
    color: rgb(182, 76, 76);
    font-size: 17px;
}

.scheduleSearchResults {
    width: 200px;
    z-index: 100;
    top: 70px;
    margin: auto;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.25s ease-out;
}

.fade-enter, .fade-leave-to {
  opacity: 0;
}

</style>
