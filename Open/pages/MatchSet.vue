<template>
    <div class="matchSet">
        <match-map-ban @refresh="$emit('refresh')" :matchid="match.matchID" :edit="edit" :set-num="setNum" :set-map="!emptyBans && set.bans[0] ? set.bans[0] : null" :map-num="1" :team="setNum % 2 === 1 ? (first ? first : null) : (first && first.name === teamA.name ? teamB : (first ? teamA : null))"></match-map-ban>
        <match-map-ban @refresh="$emit('refresh')" :matchid="match.matchID" :edit="edit" :set-num="setNum" :set-map="!emptyBans && set.bans[1] ? set.bans[1] : null" :map-num="2" :team="setNum % 2 === 1 ? (first && first.name === teamA.name ? teamB : (first ? teamA : null)) : (first ? first : null)"></match-map-ban>
        <match-map-pick @refresh="$emit('refresh')" :matchid="match.matchID" :edit="edit" :set-num="setNum" :set-map="!emptyPicks && set.picks[0] ? set.picks[0] : null" :map-num="1" :team-a="teamA" :team-b="teamB" :team="setNum % 2 === 1 ? (first ? first : null) : (first && first.name === teamA.name ? teamB : (first ? teamA : null))"></match-map-pick>
        <match-map-pick @refresh="$emit('refresh')" :matchid="match.matchID" :edit="edit" :set-num="setNum" :set-map="!emptyPicks && set.picks[1] ? set.picks[1] : null" :map-num="2" :team-a="teamA" :team-b="teamB" :team="setNum % 2 === 1 ? (first && first.name === teamA.name ? teamB : (first ? teamA : null)) : (first ? first : null)"></match-map-pick>
        <match-map-ban @refresh="$emit('refresh')" :matchid="match.matchID" :edit="edit" :set-num="setNum" :set-map="!emptyBans && set.bans[2] ? set.bans[2] : null" :map-num="3" :team="setNum % 2 === 1 ? (first && first.name === teamA.name ? teamB : (first ? teamA : null)) : (first ? first : null)"></match-map-ban>
        <match-map-ban @refresh="$emit('refresh')" :matchid="match.matchID" :edit="edit" :set-num="setNum" :set-map="!emptyBans && set.bans[3] ? set.bans[3] : null" :map-num="4" :team="setNum % 2 === 1 ? (first ? first : null) : (first && first.name === teamA.name ? teamB : (first ? teamA : null))"></match-map-ban>
        <match-map-pick @refresh="$emit('refresh')" :matchid="match.matchID" :edit="edit" :set-num="setNum" :set-map="!emptyPicks && set.picks[2] ? set.picks[2] : null" :map-num="3" :team-a="teamA" :team-b="teamB" :team="setNum % 2 === 1 ? (first && first.name === teamA.name ? teamB : (first ? teamA : null)) : (first ? first : null)"></match-map-pick>
        <match-map-pick @refresh="$emit('refresh')" :matchid="match.matchID" :edit="edit" :set-num="setNum" :set-map="!emptyPicks && set.picks[3] ? set.picks[3] : null" :map-num="4" :team-a="teamA" :team-b="teamB" :team="setNum % 2 === 1 ? (first ? first : null) : (first && first.name === teamA.name ? teamB : (first ? teamA : null))"></match-map-pick>
        <match-map-pick @refresh="$emit('refresh')" :matchid="match.matchID" :edit="edit" :set-num="setNum" :set-map="!emptyPicks && set.picks[4] ? set.picks[4] : null" :map-num="5" :team-a="teamA" :team-b="teamB" :team="setNum % 2 === 1 ? (first ? first : null) : (first && first.name === teamA.name ? teamB : (first ? teamA : null))"></match-map-pick>
        <match-map-pick @refresh="$emit('refresh')" :matchid="match.matchID" :edit="edit" :set-num="setNum" :set-map="!emptyPicks && set.picks[5] ? set.picks[5] : null" :map-num="6" :team-a="teamA" :team-b="teamB" :team="setNum % 2 === 1 ? (first && first.name === teamA.name ? teamB : (first ? teamA : null)) : (first ? first : null)"></match-map-pick>
        <match-map-pick v-if="(set && set.picks[6] && set.picks[6].teamAScores.length > 0 && set.picks[6].teamBScores.length > 0) || user.isCorsace || (match.referee && match.referee.id === user.id)" @refresh="$emit('refresh')" :matchid="match.matchID" :edit="edit" :set-num="setNum" :set-map="!emptyPicks && set.picks[6] ? set.picks[6] : null" :map-num="7" :team-a="teamA" :team-b="teamB"></match-map-pick>
    </div>
</template>

<script>
import _ from "lodash";
import MatchMapBan from "./MatchMapBan";
import MatchMapPick from "./MatchMapPick";

export default {
    components: {
        MatchMapBan,
        MatchMapPick,
    },
    data: () => ({
        emptyBans: true,
        emptyPicks: true,
    }),
    props: {
        edit: Boolean,
        set: Object,
        setNum: Number,
        teamA: Object,
        teamB: Object,
        first: Object,
        match: Object,
        user: Object,
    },
    created: function() {
        this.check();
    },
    updated: function() {
        this.check();
    },
    methods: {
        check: function() {
            if (this.set && !_.isEmpty(this.set.bans)) {
                this.emptyBans = false;
            }
            if (this.set && !_.isEmpty(this.set.picks)) {
                this.emptyPicks = false;
            }
        }
    }
}
</script>

<style>
.mapLink, .mapLink::placeholder {
    background: none;
    border: none;
    outline: none;
    font: inherit;
    font-size: 18px;
    color: white;
}

.matchSet {
    display: grid;
    grid-template-columns: 1fr 1fr;
}

.matchBan, .matchPick {
    position: relative;
    display: grid;
    grid-template-rows: repeat(3, 1fr);
    overflow: hidden;
}

.matchBan {
    padding: 9px;
}

.matchPick {
    padding: 9px 9px 9px 0;
}

.matchMapArtist {
    font-size: 18px;
    font-style: italic;
    text-overflow: ellipsis;
    white-space: nowrap;
    line-height: normal;
    overflow: hidden;
    width: 50%;
    height: 25px;
}

.matchMapTitle {
    font-size: 24px;
    font-weight: bold;
    text-overflow: ellipsis;
    white-space: nowrap;
    line-height: normal;
    overflow: hidden;
    width: 50%;
    height: 33px;
}

.matchMapDiff {
    grid-row: 4/5;
    font-size: 20px;
    font-weight: bold;
    text-overflow: ellipsis;
    white-space: nowrap;
    line-height: normal;
    overflow: hidden;
    width: 50%;
}

.matchMapWinner {
    position: absolute;
    font-size: 30px;
    right: 8%;
    align-self: center;
    font-weight: bold;
    letter-spacing: 0.3px;
    margin-top: 10px;
    width: 11em;
}

.matchPickHover {
    position: absolute;
    display: grid;
    padding: 10px;
    padding-left: 32px;
    height: 84%;
    right: 0;
    transition: transform 0.35s cubic-bezier(0, 0, 0, 0.96);
    grid-template-areas: 
    'filler1 mapID'
    'pickBanShow pickBanBy';
    width: 45%;
}

.matchBanHover {
    position: absolute;
    display: grid;
    padding: 10px;
    padding-left: 32px;
    height: 84%;
    right: 0;
    transition: transform 0.35s cubic-bezier(0, 0, 0, 0.96);
    grid-template-areas: 
    'mapID'
    'pickBanBy';
    width: 45%;
    text-align: right;
    grid-template-rows: 4fr 1fr 1fr;
}

.matchBanHover {
    background-color: #ff4848;
}

.matchPickHover {
    background-color: #5ec949;
}

.mapID {
    font-weight: bold;
    grid-area: mapID;
    font-size: 18px;
    text-align: right;
}

.pickBanBy {
    font-size: 16px;
    grid-area: pickBanBy;
    line-height: 20px;
    margin-top: auto;
    text-align: right;
}

.pickBanTeam {
    font-size: 20px;
    font-weight: bold;
    align-self: center;
}

.filler1 {
    grid-area: filler1;
}

.pickBanShow {
    grid-area: pickBanShow;
    font-size: 12px;
    margin-top: auto;
    cursor: pointer;
}
</style>