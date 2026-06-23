// Registers only the Chart.js pieces the dashboard uses (bar + doughnut), so the
// bundle stays small. Imported for its side effect by the chart components.
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend)

export { ChartJS }
