<template>
  <ul>
    <li>
      <router-link :to="{ name: 'editor' }">
        Editor
      </router-link> (This is highly WIP)
    </li>
    <li>
      <router-link :to="{ name: 'trace-viewer-slideout' }">
        TraceViewer (slideout)
      </router-link>
    </li>
    <li>
      <router-link :to="{ name: 'waterfall' }">
        Waterfall
      </router-link>
    </li>
  </ul>
</template>
