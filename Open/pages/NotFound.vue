<template>
    <div class="ErrImg">
        <div class="ErrSpace"></div>
        <div class="ErrText" v-html="$t('error.404')"></div>
    </div>
</template>

<script>
export default {

}
</script>

<style>

.ErrImg {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    position: fixed;
    background-image: url(../../Assets/img/open/404.png);
    background-position: center;
}

.ErrSpace {
    width: 100%;
    height: 50%;
}

.ErrText {
    font-size: 35px;
    text-align: center;
    width: 25em;
    margin: auto;
}

.ErrLink {
    color: #dd3636;
    text-decoration: underline;
    text-shadow: 0 0 10px rgba(221,54,54, 0.75);
    display: contents;
}
</style>