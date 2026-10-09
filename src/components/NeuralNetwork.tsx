import { m, useReducedMotion, useTransform, type MotionValue } from 'framer-motion'

// Decorative circuit / neural-network motif: lines draw themselves, nodes pulse,
// and the two layers drift at different depths with the cursor (desktop only).
const nodes: [number, number][] = [
  [70, 90],
  [190, 50],
  [320, 120],
  [450, 60],
  [580, 140],
  [660, 80],
  [110, 230],
  [250, 200],
  [380, 260],
  [510, 220],
  [640, 290],
  [60, 360],
  [200, 390],
  [340, 350],
  [470, 410],
  [600, 380],
]
const links: [number, number][] = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
  [4, 5],
  [0, 6],
  [1, 7],
  [2, 7],
  [2, 8],
  [3, 9],
  [4, 9],
  [5, 10],
  [6, 7],
  [7, 8],
  [8, 9],
  [9, 10],
  [6, 11],
  [7, 12],
  [8, 13],
  [9, 14],
  [10, 15],
  [11, 12],
  [12, 13],
  [13, 14],
  [14, 15],
]
const pulsing = new Set([2, 7, 9, 13])

export default function NeuralNetwork({
  px,
  py,
  className,
}: {
  px: MotionValue<number>
  py: MotionValue<number>
  className?: string
}) {
  const reduced = useReducedMotion()
  const lx = useTransform(px, (v) => v * 8)
  const ly = useTransform(py, (v) => v * 6)
  const nx = useTransform(px, (v) => v * 18)
  const ny = useTransform(py, (v) => v * 14)

  return (
    <svg
      viewBox="0 0 720 460"
      preserveAspectRatio="xMidYMid slice"
      className={className}
      aria-hidden="true"
      focusable="false"
      fill="none"
    >
      <m.g
        style={{ x: lx, y: ly }}
        stroke="rgb(var(--rose-soft))"
        strokeWidth="1.5"
        strokeLinejoin="round"
      >
        {links.map(([a, b], i) => (
          <m.path
            key={`${a}-${b}`}
            d={`M${nodes[a][0]} ${nodes[a][1]} H${nodes[b][0]} V${nodes[b][1]}`}
            initial={reduced ? false : { pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.55 }}
            transition={{ duration: 1.1, delay: 0.2 + i * 0.05, ease: 'easeOut' }}
          />
        ))}
      </m.g>
      <m.g style={{ x: nx, y: ny }}>
        {nodes.map(([x, y], i) => (
          <g key={i}>
            {pulsing.has(i) && (
              <circle
                cx={x}
                cy={y}
                r="7"
                fill="rgb(var(--rose-soft))"
                className="node-pulse"
                style={{ animationDelay: `${i * 0.25}s` }}
              />
            )}
            <circle cx={x} cy={y} r="9" fill="rgb(var(--rose-soft))" fillOpacity="0.2" />
            <circle cx={x} cy={y} r="4" fill="rgb(var(--rose))" />
          </g>
        ))}
      </m.g>
    </svg>
  )
}
