<template>
    <div class="demeritApp">
        <div class="demeritAppTitle">DEMERIT REPORT</div>
        <div class="demeritSelection">
            <p class="verifyAppDesc">User or Team?</p>
            <input class="prevCorsaceInput" type="radio" id="user" value="USER" v-model="selection">
            <label class="prevCorsaceLabel" for="user">User</label>
            <input class="prevCorsaceInput" type="radio" id="team" value="TEAM" v-model="selection">
            <label class="prevCorsaceLabel" for="team">Team</label>
        </div>
        <div class="demeritWho" v-if="selection === 'USER'">
            User:
            <input class="verifyAppInput" placeholder="User" v-model="targetUser" @click="active = true">
            <div class="searchResults">
                <div v-for="(user, index) in usersFiltered" :key="index">
                    <p class="searchSelection" v-if="targetUser && active" @click="chooseUser(user)">{{ user.username }}</p>
                </div>
            </div>
        </div>
        <div class="demeritWho" v-else-if="selection === 'TEAM'">
            Team:
            <input class="verifyAppInput" placeholder="Team" v-model="targetTeam" @click="active = true">
            <div class="searchResults">
                <div v-for="(team, index) in teamsFiltered" :key="index">
                    <p class="searchSelection" v-if="targetTeam && active" @click="chooseTeam(team)">{{ team.name }}</p>
                </div>
            </div>
        </div>
        <div class="demeritAmount" v-if="selection">
            <p class="verifyAppDesc">How many demerits?</p>
            <select class="demeritAmountDropdown" v-model="amount">
                <option disabled value="">Select one</option>
                <option>1</option>
                <option>2</option>
                <option>3</option>
                <option>5</option>
                <option>7</option>
            </select>
        </div>
        <div class="demeritReason" v-if="selection">
            <p class="verifyAppDesc">What is the reason?</p>
            <textarea class="demeritInput extraInput" v-model="reason" placeholder="Reason" maxlength="200"></textarea>
            <div class="demRemainingChar">{{ reason.length }}/200</div>
        </div>
        <div class="demeritText" @click="createReport">SUBMIT REPORT</div>
    </div>
</template>

<script>
import _ from "lodash";
import axios from "axios";
import regeneratorRuntime from "regenerator-runtime";

export default {
    data: () => ({
        report: {},
        selection: "",
        amount: null,
        reason: "",
        targetUser: "",
        targetTeam: "",
        active: true,
    }),
    props: {
        team: Object,
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
        async usersFiltered() {
            if(this.targetTeam !== "") {
                const userList = (await axios.get("/api/user/search?regex=" + this.targetUser)).data.users;
                return await userList;
            } else {
                return null;
            }
        },
    },
    methods: {
        createReport: async function() {
            if(!this.selection || !this.amount || !this.reason || (!this.targetTeam && !this.targetUser)) {
                return alert("Invalid! Please fill out everything!");
            } else {
                this.reportData = {
                    targetType: this.selection,
                    amount: this.amount,
                    reason: this.reason,
                    team: this.selection === "" ? null : this.targetTeam,
                    user: this.seclection === "" ? null : this.targetUser,
                };
                try {
                    await axios.post("/api/demerits/create", this.reportData);
                } catch(e) {
                    alert(e);
                } finally {
                    this.$emit('toggle');
                }
            }
        },
        chooseUser: function(user) {
            this.targetUser = user.username;
            this.active = false;
        },
        chooseTeam: function(team) {
            this.targetTeam = team.name;
            this.active = false;
        }
    }
}
</script>

<style>
.demeritApp {
    top: 15px;
    position: absolute;
    display: grid;
    justify-items: center;
    background-image: url(../../Assets/img/open/textbg.png);
    padding: 13px;
    color: #ff4848;
    width: 250px;
    z-index: 2;
    grid-row-gap: 15px;
    font-weight: normal;
    text-shadow: none;
    font-size: 16px;
}

.demeritAppTitle {
    font-size: 18px;
    font-weight: bold;
}

.demeritText {
    cursor: pointer;
    font-size: 16px;
    letter-spacing: 1.6px;
    padding: 7px 9px;
    border: solid;
    border-radius: 14px;
    color: #ff4848;
    text-shadow: 0 0 10px rgba(255,72,72,.75);
    box-shadow: 0 0 10px rgba(255,72,72,.75);
}

.demeritSelection {
    position: relative;
    display: grid;
    white-space: normal;
    grid-column-gap: 10px;
}

.demeritWho {
    position: relative;
    align-self: center;
}

.searchResults {
    background-image: url(../../Assets/img/open/textbg.png);
    position: absolute;
    left: 0;
    right: 0;
    text-align: center;
}

.searchSelection {
    cursor: pointer;
}

.demeritAmount {
    display: flex;
    flex-direction: column;
}

.demeritAmountDropdown {
    border: 0;
    outline: 0;
    background-color: #443e3e;
    font: inherit;
    color: #8f8f8f;
    font-size: 12px;
    align-self: center;
    width: fit-content;
}

.demeritReason {
    position: relative;
    display: flex;
    flex-direction: column;
}

.demeritInput {
    height: 75px;
    margin: 0;
    background-color: #443e3e;
    outline: 0;
    border: 0;
    text-align: center;
    color: #8f8f8f;
    font: inherit;
    font-size: 12px;
}

.demRemainingChar {
    cursor: default;
    font-size: 10px;
    text-align: right;
    grid-column: 1/2;
    grid-row: 3/4;
    bottom: 0;
    left: 0;
    position: absolute;
}
</style>