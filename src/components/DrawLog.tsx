import type { DrawEvent } from '../lib/game'
import { formatTime, summariseTiles } from '../lib/format'

interface DrawLogProps {
  log: readonly DrawEvent[]
}

export function DrawLog({ log }: DrawLogProps) {
  const newestFirst = [...log].reverse()

  return (
    <details className="panel log-panel">
      <summary>
        <span>Draw log</span>
        <span className="log-panel__count">{log.length}</span>
      </summary>
      {log.length === 0 ? (
        <p className="fine-print">No draws yet.</p>
      ) : (
        <ol className="log-list">
          {newestFirst.map((event, index) => (
            <li key={`${event.at}-${event.slot}-${index}`}>
              <span className="log-list__meta">
                {event.kind === 'setup' ? 'Setup' : formatTime(event.at)} ·
                Supply {event.slot + 1}
              </span>
              <span className="log-list__tiles">
                {summariseTiles(event.tiles)}
              </span>
            </li>
          ))}
        </ol>
      )}
    </details>
  )
}
