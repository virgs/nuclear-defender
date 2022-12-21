<script setup lang="ts">
import {useRouter} from 'vue-router';

const router = useRouter();
router.push('/splash');
</script>

<template>
  <router-view></router-view>
</template>
