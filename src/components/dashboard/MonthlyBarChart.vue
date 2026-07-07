<template>
  <Bar :data="chartData" :options="chartOptions" :aria-label="ariaLabel" role="img" />
</template>

<script lang="ts">
import { computed, defineComponent, type PropType } from 'vue'
import { Bar } from 'vue-chartjs'
import type { ChartOptions, TooltipItem } from 'chart.js'
import './chartSetup'
import type { MonthlyPoint } from '@/models/Dashboard'

const INK = '#1a1d28'
const BAR = '#e8e5df'

export default defineComponent({
  name: 'MonthlyBarChart',
  components: { Bar },
  props: {
    data: {
      type: Array as PropType<MonthlyPoint[]>,
      required: true
    }
  },
  setup(props) {
    // Highlight the most recent point (current period) in ink, the rest in grey.
    const chartData = computed(() => {
      const colors = props.data.map((_, i) => (i === props.data.length - 1 ? INK : BAR))
      return {
        labels: props.data.map((p) => p.label),
        datasets: [
          {
            data: props.data.map((p) => p.amount),
            backgroundColor: colors,
            borderRadius: 4,
            maxBarThickness: 44
          }
        ]
      }
    })

    const chartOptions: ChartOptions<'bar'> = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx: TooltipItem<'bar'>) => `$${(ctx.parsed.y ?? 0).toLocaleString()}`
          }
        }
      },
      scales: {
        x: { grid: { display: false }, border: { display: false } },
        y: {
          beginAtZero: true,
          border: { display: false },
          ticks: { callback: (v) => `$${v}` },
          grid: { color: 'rgba(0,0,0,0.05)' }
        }
      }
    }

    const ariaLabel = computed(
      () => `Spending per period: ${props.data.map((p) => `${p.label} $${p.amount}`).join(', ')}`
    )

    return { chartData, chartOptions, ariaLabel }
  }
})
</script>
