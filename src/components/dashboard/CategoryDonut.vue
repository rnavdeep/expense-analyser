<template>
  <Doughnut :data="chartData" :options="chartOptions" :aria-label="ariaLabel" role="img" />
</template>

<script lang="ts">
import { computed, defineComponent, type PropType } from 'vue'
import { Doughnut } from 'vue-chartjs'
import type { ChartOptions, TooltipItem } from 'chart.js'
import './chartSetup'
import type { CategorySlice } from '@/models/Dashboard'

export default defineComponent({
  name: 'CategoryDonut',
  components: { Doughnut },
  props: {
    data: {
      type: Array as PropType<CategorySlice[]>,
      required: true
    }
  },
  setup(props) {
    const chartData = computed(() => ({
      labels: props.data.map((c) => c.label),
      datasets: [
        {
          data: props.data.map((c) => c.amount),
          backgroundColor: props.data.map((c) => c.color),
          borderWidth: 0,
          hoverOffset: 4
        }
      ]
    }))

    const chartOptions: ChartOptions<'doughnut'> = {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '68%',
      plugins: {
        legend: {
          position: 'right',
          labels: {
            usePointStyle: true,
            pointStyle: 'circle',
            boxWidth: 8,
            padding: 14,
            font: { size: 12 }
          }
        },
        tooltip: {
          callbacks: {
            label: (ctx: TooltipItem<'doughnut'>) =>
              `${ctx.label}: $${(ctx.parsed ?? 0).toLocaleString()}`
          }
        }
      }
    }

    const ariaLabel = computed(
      () => `Spending by category: ${props.data.map((c) => `${c.label} $${c.amount}`).join(', ')}`
    )

    return { chartData, chartOptions, ariaLabel }
  }
})
</script>
