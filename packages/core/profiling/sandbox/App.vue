<template>
  <div class="sandbox-container">
    <main>
      <FlameChart
        class="flame-chart-container"
        :nodes="nodes"
        @select="onSelectNode"
      />
      <div class="flame-node-list-container">
        <FlameNodeList :nodes="listNodes" />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { ExtendedFlameNode, NodeTypes } from '../src'
import { FlameChart, FlameNodeList, getLeafNodes, toExtendedFlameChartNodes } from '../src'
import * as fixtures from './fixtures'

const nodes = computed(() => toExtendedFlameChartNodes(fixtures.EXAMPLE2.split('\n')))
const listNodes = ref<ExtendedFlameNode[]>([])

const onSelectNode = (nt: NodeTypes) => {
  if (nt !== null && nt.type === 'flame-chart-node') {

    if (nt.node?.source !== undefined) {
      listNodes.value = getLeafNodes(nt.node?.source)
    }
  }
}

</script>

<style lang="scss">
body {
  padding: 0;
  margin: 0;
}
</style>

<style lang="scss" scoped>
main {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100dvw;
  height: 100dvh;
}

.flame-chart-container {
  width: 100%;
  height: 50%
}

.flame-node-list-container {
  font-size: 11px;
  width: 100%;
  height: 50%;
  overflow: scroll;
}
</style>
