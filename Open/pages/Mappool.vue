<template>
    <div>
        <div v-if="mappool" class="mappoolWrapper">
            <div class="mappool">
                <div class="round">
                    <router-link :to="`/mappool/${prevPool}`" v-if="prevPool" class="prevPool">
                        <div class="nextPrev">&lt;&lt;</div>
                    </router-link>
                    <div class="roundName">{{ $i18n.messages[$i18n.locale].rounds[mappool.slug] }}</div>
                    <router-link :to="`/mappool/${nextPool}`" v-if="nextPool" class="nextPool">
                        <div class="nextPrev">>></div>
                    </router-link>
                </div>
                <div class="edit">
                    <div v-if="user.isMappooler && !mappool.public && !edit" @click="edit = true">
                        <img src="../../Assets/img/open/editMappool.png">
                        EDIT
                    </div>
                    <div class="editActive" v-else-if="user.isMappooler && !mappool.public && edit" @click="edit = false">
                        <img src="../../Assets/img/open/editSave.png">
                        CLOSE EDIT
                    </div>
                    <div v-if="user.isHeadStaff && !mappool.public" @click="publish">
                        <img src="../../Assets/img/open/publish.png">
                        PUBLISH
                    </div>
                    <div v-else-if="user.isHeadStaff && mappool.public" @click="unpublish">
                        <img src="../../Assets/img/open/publish.png">
                        UNPUBLISH
                    </div>
                    <input class="mappack" v-if="edit" :placeholder="mappack === '' ? 'paste mappack link here' : mappack" v-model="mappack" @input="addPack">
                    <input class="mappack" v-if="edit" :placeholder="sheet === '' ? 'paste sheet link here' : sheet" v-model="sheet" @input="addSheet">
                    <a v-if="mappool.mappack && !edit" :href="mappool.mappack">
                        <div>
                            <img src="../../Assets/img/open/pool.png">
                            MAPPACK
                        </div>
                    </a>
                    <a v-if="mappool.sheet && !edit" :href="mappool.sheet">
                        <div>
                            <img src="../../Assets/img/open/sched.png">
                            SHEET VER.
                        </div>
                    </a>
                </div>
                <div class="mappoolList">
                    <div v-for="(modGroup, index) in mappool.modGroups" :key="index">
                        <ModGroupComponent :user="user" :mod-group="modGroup" :round="mappool.name" :edit="edit" @refresh="refresh"></ModGroupComponent>
                    </div>
                </div>
                <div class="mappoolSubHeaders" style="margin-top:20px;" v-if="Object.keys(pickBans).length > 2 && beatmaps">
                    <div @click="statType='raw'" class="mappoolSubHeader" :class="{ mappoolSubHeaderActive: statType==='raw' }">RAW</div>
                    <div @click="statType='total'" class="mappoolSubHeader" :class="{ mappoolSubHeaderActive: statType==='total' }">%TOTAL</div>
                    <div @click="statType='max'" class="mappoolSubHeader" :class="{ mappoolSubHeaderActive: statType==='max' }">%MAX</div>
                </div>
                <table class="mappoolTable" v-if="Object.keys(pickBans).length > 2 && beatmaps">
                    <tr>
                        <th>Type</th>
                        <th class="mappoolTableScoresBorder" v-for="(beatmap, index) in beatmaps" :key="index" :style="beatmap.style ? beatmap.style : null"><a :href="beatmap.mapID ? `https://osu.ppy.sh/beatmaps/${beatmap.mapID}` : null">{{ beatmap.name }}</a></th>
                    </tr>
                    <tr>
                        <td>Picks</td>
                        <td class="mappoolTableScoresBorder" v-for="(beatmap, index) in beatmaps" :key="index" :class="{topScore: pickBans[beatmap.mapID] && pickBans[beatmap.mapID].pick === pickBans.max.pick}">{{!pickBans[beatmap.mapID] ? '0' : statType === 'raw' ? pickBans[beatmap.mapID].pick : (100 * pickBans[beatmap.mapID].pick / (statType === 'total' ? pickBans.total.pick : pickBans.max.pick)).toFixed(2).toString() + "%"}}</td>
                    </tr>
                    <tr>
                        <td>Bans</td>
                        <td class="mappoolTableScoresBorder" v-for="(beatmap, index) in beatmaps" :key="index" :class="{topScore: pickBans[beatmap.mapID] && pickBans[beatmap.mapID].ban === pickBans.max.ban}">{{!pickBans[beatmap.mapID] ? '0' : statType === 'raw' ? pickBans[beatmap.mapID].ban : (100 * pickBans[beatmap.mapID].ban / (statType === 'total' ? pickBans.total.ban : pickBans.max.ban)).toFixed(2).toString() + "%"}}</td>
                    </tr>
                    <tr>
                        <td>Match Bans</td>
                        <td class="mappoolTableScoresBorder" v-for="(beatmap, index) in beatmaps" :key="index" :class="{topScore: pickBans[beatmap.mapID] && pickBans[beatmap.mapID].matchBan === pickBans.max.matchBan}">{{!pickBans[beatmap.mapID] ? '0' : statType === 'raw' ? pickBans[beatmap.mapID].matchBan : (100 * pickBans[beatmap.mapID].matchBan / (statType === 'total' ? pickBans.total.matchBan : pickBans.max.matchBan)).toFixed(2).toString() + "%"}}</td>
                    </tr>
                </table>
            </div>
        </div>
        <Construction v-else></Construction>
    </div>
</template>

<script>
import axios from "axios";
import regeneratorRuntime from "regenerator-runtime";
import Construction from "./Construction";
import ModGroupComponent from "./ModGroupComponent";

const pools = [
    'qualifiers',
    'round-of-32',
    'round-of-16',
    'quarter-finals',
    'semi-finals',
    'finals',
    'grand-finals',
];

const defaultMaps = [
    {name: "NM1"},
    {name: "NM2"},
    {name: "NM3"},
    {name: "NM4"},
    {name: "HD1"},
    {name: "HD2"},
    {name: "HR1"},
    {name: "HR2"},
    {name: "DT1"},
    {name: "DT2"},
];

export default {
    components: {
        Construction,
        ModGroupComponent,
    },
    data: () => ({
        mappool: [],
        pickBans: {},
        mappack: "",
        sheet: "",
        nextPool: "",
        prevPool: "",
        statType: "raw",
        edit: false,
    }),
    props: {
        user: Object,
    },
    created: async function() {
        await this.refresh();
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
    },
    methods: {
        refresh: async function() {
            let data;
            if(this.$route.params.round)
                data = (await axios.get("/api/mappool?poolSlug=" + this.$route.params.round)).data;
            else
                data = (await axios.get("/api/mappool")).data;

            if (data.mappool) {
                this.mappool = data.mappool;
                const index = pools.indexOf(this.mappool.slug);
                if (data.next)
                    this.nextPool = pools[index+1];
                if (data.previous)
                    this.prevPool = pools[index-1];
            } else
                this.$router.push({ path: '/404' });

            this.pickBans.total = {
                pick: data.picks.length,
                ban: data.bans.length,
                matchBan: data.matchBans.length,
            }
            this.pickBans.max = {
                pick: 0,
                ban: 0,
                matchBan: 0,
            }
            
            if (data.picks) {
                for (const pick of data.picks) {
                    if (!this.pickBans[pick]) {
                        this.pickBans[pick] = {
                            pick: 1,
                            ban: 0,
                            matchBan: 0,
                        }
                    } else {
                        this.pickBans[pick].pick++;
                        this.pickBans.max.pick = Math.max(this.pickBans[pick].pick, this.pickBans.max.pick)
                    }
                }
            }

            if (data.bans) {
                for (const ban of data.bans) {
                    if (!this.pickBans[ban]) {
                        this.pickBans[ban] = {
                            pick: 0,
                            ban: 1,
                            matchBan: 0,
                        }
                    } else {
                        this.pickBans[ban].ban++;
                        this.pickBans.max.ban = Math.max(this.pickBans[ban].ban, this.pickBans.max.ban)
                    }
                }
            }

            if (data.matchBans) {
                for (const ban of data.matchBans) {
                    if (!this.pickBans[ban]) {
                        this.pickBans[ban] = {
                            pick: 0,
                            ban: 0,
                            matchBan: 1,
                        }
                    } else {
                        this.pickBans[ban].matchBan++;
                        this.pickBans.max.matchBan = Math.max(this.pickBans[ban].matchBan, this.pickBans.max.matchBan)
                    }
                }
            }

            if (this.mappool) {
                this.mappack = this.mappool.mappack ? this.mappool.mappack : this.mappack;
                this.sheet = this.mappool.sheet ? this.mappool.sheet : this.sheet;
            }
        },
        publish: async function() {
            if(confirm("Are you sure you want to publish this pool?")) {
                await axios.patch("/api/mappool/publish?round=" + this.mappool.name.replace(/ /g, "%20"));
                this.refresh();
            }
        },
        unpublish: async function() {
            if(confirm("Are you sure you want to unpublish this pool?")) {
                await axios.patch("/api/mappool/unpublish?round=" + this.mappool.name.replace(/ /g, "%20"));
                this.refresh();
            }
        },
        addPack: async function() {
            await axios.patch("/api/mappool/mappack?round=" + this.mappool.name.replace(/ /g, "%20") + "&link=" + (this.mappack ? this.mappack : "empty"));
            this.refresh();
        },
        addSheet: async function() {
            await axios.patch("/api/mappool/sheet?round=" + this.mappool.name.replace(/ /g, "%20") + "&link=" + (this.sheet ? this.sheet : "empty"));
            this.refresh();
        },
    }
}
</script>

<style>

.mappoolWrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 40px;
}

.mappool {
    display: flex;
    flex-wrap: wrap;
    width: 50%;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    white-space: nowrap;
}

.round {
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
}

.roundName {
    grid-column: 2/3;
}

.nextPrev {
    cursor: pointer;
    color: #b64c4c;
    padding: 10px;
}

.prevPool {
    grid-column: 1/2;
}

.nextPool {
    grid-column: 3/4
}

.edit {
    cursor: pointer;
    color: #866662;
    display: grid;
    grid-row-gap: 10px;
    margin-left: auto;
    justify-content: space-around;
}

.editActive {
    color: #2dbf59;
}

.unpublish {
    color: #b64c4c;
    font-weight: bold;
}

.mappoolList {
    display: flex;
    width: 100%;
    flex-direction: column;
    grid-column: 1/3;
    margin: 35px 0;
}

.mappack {
    padding: 0 2px;
    font-size: 12px;
    color: #b64c4c;
    line-height: 15px;
    font-style: italic;
    background: 0;
    border: 0;
    outline: 0;
    font-family: inherit;
    cursor: initial;
}

.mappoolSubHeaders {
    display: flex;
    font-size: 20px;
    letter-spacing: 6.8px;
    text-shadow: 0 0 10px rgba(95,95,95,.75);
    padding: 10px;
    background-color: rgba(0,0,0,0.7);
}

.mappoolSubHeaders > a, .mappoolSubHeaders > div {
    padding: 0 17px;
}

.mappoolSubHeader {
    cursor: pointer;
    color: #5f5f5f;
}

.mappoolSubHeaderActive {
    color: #b64c4c;
    text-shadow: 0 0 10px rgba(182,76,76,.75);
}

.mappoolTable {
    background-color: rgba(0,0,0,0.7);
    margin-top: 20px;
    border-spacing: 0;
    text-align: center;
    position: relative;
}

.mappoolTable > tr > th, .mappoolTable > tr > td {
    padding: 10px;
}

.mappoolTable > tr > th {
    font-size: 1.75rem;
}

.mappoolTable > tr > td {
    font-size: 1.25rem;
}

.topScore {
    color: #ffe075;
    text-shadow: 0px 0px 10px rgba(255,224,117, 0.75);
}
</style>
