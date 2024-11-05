<template>
  <ul>
    <li>
      <router-link :to="{ name: 'editor' }">
        Editor
      </router-link>
    </li>
    <li>
      <router-link :to="{ name: 'waterfall' }">
        Waterfall
      </router-link>
    </li>
  </ul>
</template>
