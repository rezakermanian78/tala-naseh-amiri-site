// Lightweight decorative circuit / neural-network motif.
const nodes: [number, number][] = [
  [60, 80],
  [180, 40],
  [300, 110],
  [420, 60],
  [540, 130],
  [100, 200],
  [230, 170],
  [350, 230],
  [480, 190],
  [580, 260],
]
const links: [number, number][] = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
  [0, 5],
  [1, 6],
  [2, 6],
  [2, 7],
  [3, 8],
  [4, 8],
  [4, 9],
  [5, 6],
  [6, 7],
  [7, 8],
  [8, 9],
]

export default function CircuitBackdrop({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 640 300"
      className={className}
      aria-hidden="true"
      focusable="false"
      fill="none"
    >
      <g stroke="rgb(var(--rose-soft))" strokeOpacity="0.5" strokeWidth="1.5">
        {links.map(([a, b]) => (
          <path
            key={`${a}-${b}`}
            d={`M${nodes[a][0]} ${nodes[a][1]} H${nodes[b][0]} V${nodes[b][1]}`}
            strokeLinejoin="round"
          />
        ))}
      </g>
      {nodes.map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r="9" fill="rgb(var(--rose-soft))" fillOpacity="0.18" />
          <circle cx={x} cy={y} r="4" fill="rgb(var(--rose))" />
        </g>
      ))}
    </svg>
  )
}
