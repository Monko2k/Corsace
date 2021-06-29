<template>
    <div class="popup">
        {{text}}
    </div>
</template>

<script>
export default {
    props: {
        text: String,
    }
}
</script>

<style>
.popup {
    background-color: #202020;
    padding: 20px;
    display: inline;
    border-radius: 10px;
    margin: 70px;
    position: fixed;
    bottom: 0;
    right: 0;
    color: #c8cfd5;
    text-shadow: 0 0 10px rgba(200,207,213,.75);
}
</style>