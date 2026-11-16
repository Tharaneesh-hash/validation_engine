import React, { useMemo } from 'react';

/**
 * Interactive SVG Automata Graph Renderer
 * Renders arbitrary DFA or NFA state transition graphs dynamically.
 * Features:
 * - Circular state nodes
 * - Double border for accepting states
 * - Entering arrow for start state
 * - Curved transition arrows with input symbol labels
 * - Self-loop transitions
 * - Dynamic active state glow / highlighting for simulation
 */

export default function AutomataGraph({
  automaton,
  activeState = null,
  activeTransition = null,
  isNFA = false,
  width = 750,
  height = 360
}) {
  if (!automaton || !automaton.states || automaton.states.length === 0) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8', fontStyle: 'italic' }}>
        No automaton state graph data available.
      </div>
    );
  }

  const { states, startState, acceptStates, transitions } = automaton;
  const acceptSet = useMemo(() => new Set(acceptStates || []), [acceptStates]);

  // Compute node layout coordinates (Arranged horizontally or in an ellipse)
  const nodePositions = useMemo(() => {
    const positions = {};
    const count = states.length;
    const paddingX = 80;
    const paddingY = 80;
    const availableWidth = width - 2 * paddingX;
    const availableHeight = height - 2 * paddingY;

    if (count <= 6) {
      // Horizontal linear layout with slight zigzag for clarity
      states.forEach((state, idx) => {
        const x = paddingX + (count > 1 ? (idx / (count - 1)) * availableWidth : availableWidth / 2);
        const y = height / 2 + (idx % 2 === 0 ? -25 : 25);
        positions[state] = { x, y };
      });
    } else {
      // Elliptical layout for larger automata
      const centerX = width / 2;
      const centerY = height / 2;
      const radiusX = availableWidth / 2.2;
      const radiusY = availableHeight / 2.2;

      states.forEach((state, idx) => {
        const angle = (idx / count) * 2 * Math.PI - Math.PI / 2;
        const x = centerX + radiusX * Math.cos(angle);
        const y = centerY + radiusY * Math.sin(angle);
        positions[state] = { x, y };
      });
    }

    return positions;
  }, [states, width, height]);

  // Aggregate edge transitions between state pairs
  const edges = useMemo(() => {
    const edgeMap = new Map();

    for (const [fromState, transMap] of Object.entries(transitions || {})) {
      if (!nodePositions[fromState]) continue;

      for (const [symbol, targets] of Object.entries(transMap || {})) {
        const targetList = Array.isArray(targets) ? targets : [targets];

        for (const toState of targetList) {
          if (!toState || !nodePositions[toState]) continue;

          const key = `${fromState}->${toState}`;
          if (!edgeMap.has(key)) {
            edgeMap.set(key, { from: fromState, to: toState, symbols: [] });
          }
          edgeMap.get(key).symbols.push(symbol);
        }
      }
    }

    return Array.from(edgeMap.values());
  }, [transitions, nodePositions]);

  const NODE_RADIUS = 24;

  return (
    <div style={{ width: '100%', overflowX: 'auto', background: '#ffffff', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        style={{ width: '100%', height: 'auto', minWidth: '600px', display: 'block' }}
      >
        <defs>
          {/* Arrow markers */}
          <marker
            id="arrowhead"
            markerWidth="8"
            markerHeight="6"
            refX="7"
            refY="3"
            orient="auto"
          >
            <polygon points="0 0, 8 3, 0 6" fill="#64748b" />
          </marker>
          <marker
            id="arrowhead-active"
            markerWidth="8"
            markerHeight="6"
            refX="7"
            refY="3"
            orient="auto"
          >
            <polygon points="0 0, 8 3, 0 6" fill="#4f46e5" />
          </marker>
          <marker
            id="arrowhead-start"
            markerWidth="8"
            markerHeight="6"
            refX="7"
            refY="3"
            orient="auto"
          >
            <polygon points="0 0, 8 3, 0 6" fill="#10b981" />
          </marker>
        </defs>

        {/* 1. Initial State Indicator Arrow */}
        {startState && nodePositions[startState] && (
          <g>
            <line
              x1={nodePositions[startState].x - 45}
              y1={nodePositions[startState].y}
              x2={nodePositions[startState].x - NODE_RADIUS - 2}
              y2={nodePositions[startState].y}
              stroke="#10b981"
              strokeWidth="2.5"
              markerEnd="url(#arrowhead-start)"
            />
            <text
              x={nodePositions[startState].x - 52}
              y={nodePositions[startState].y - 6}
              fontSize="11"
              fontWeight="700"
              fill="#10b981"
            >
              Start
            </text>
          </g>
        )}

        {/* 2. Transition Edges */}
        {edges.map((edge) => {
          const from = nodePositions[edge.from];
          const to = nodePositions[edge.to];
          const isSelf = edge.from === edge.to;
          const isEdgeActive = activeTransition && activeTransition.from === edge.from && activeTransition.to === edge.to;
          const strokeColor = isEdgeActive ? '#4f46e5' : '#94a3b8';
          const strokeWidth = isEdgeActive ? 2.5 : 1.5;
          const label = edge.symbols.join(', ');

          if (isSelf) {
            // Self-loop arc on top of the node
            const loopX = from.x;
            const loopY = from.y - NODE_RADIUS;
            return (
              <g key={`${edge.from}-${edge.to}`}>
                <path
                  d={`M ${loopX - 10} ${loopY} C ${loopX - 25} ${loopY - 35}, ${loopX + 25} ${loopY - 35}, ${loopX + 10} ${loopY}`}
                  fill="none"
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  markerEnd={isEdgeActive ? 'url(#arrowhead-active)' : 'url(#arrowhead)'}
                />
                <rect
                  x={loopX - 12}
                  y={loopY - 45}
                  width="24"
                  height="14"
                  rx="3"
                  fill="#ffffff"
                  stroke="#e2e8f0"
                  strokeWidth="0.8"
                />
                <text
                  x={loopX}
                  y={loopY - 34}
                  textAnchor="middle"
                  fontSize="10"
                  fontWeight="600"
                  fill={isEdgeActive ? '#4f46e5' : '#475569'}
                >
                  {label}
                </text>
              </g>
            );
          }

          // Directed curve between distinct states
          const dx = to.x - from.x;
          const dy = to.y - from.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const nx = dx / dist;
          const ny = dy / dist;

          const startX = from.x + nx * NODE_RADIUS;
          const startY = from.y + ny * NODE_RADIUS;
          const endX = to.x - nx * (NODE_RADIUS + 4);
          const endY = to.y - ny * (NODE_RADIUS + 4);

          // Curve control offset
          const curvature = 24;
          const midX = (startX + endX) / 2 - ny * curvature;
          const midY = (startY + endY) / 2 + nx * curvature;

          return (
            <g key={`${edge.from}-${edge.to}`}>
              <path
                d={`M ${startX} ${startY} Q ${midX} ${midY} ${endX} ${endY}`}
                fill="none"
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                markerEnd={isEdgeActive ? 'url(#arrowhead-active)' : 'url(#arrowhead)'}
              />
              {/* Edge Label Badge */}
              <rect
                x={midX - 14}
                y={midY - 9}
                width={Math.max(28, label.length * 7 + 10)}
                height="18"
                rx="4"
                fill="#ffffff"
                stroke={isEdgeActive ? '#818cf8' : '#e2e8f0'}
                strokeWidth="1"
              />
              <text
                x={midX + (label.length > 2 ? 0 : 0)}
                y={midY + 3.5}
                textAnchor="middle"
                fontSize="10"
                fontWeight="700"
                fill={isEdgeActive ? '#4f46e5' : '#334155'}
              >
                {label}
              </text>
            </g>
          );
        })}

        {/* 3. State Nodes */}
        {states.map((state) => {
          const pos = nodePositions[state];
          if (!pos) return null;

          const isAccepting = acceptSet.has(state);
          const isActive = activeState === state;

          return (
            <g key={state} style={{ cursor: 'pointer' }}>
              {/* Active state pulsing halo */}
              {isActive && (
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={NODE_RADIUS + 8}
                  fill="none"
                  stroke="#6366f1"
                  strokeWidth="3"
                  opacity="0.4"
                />
              )}

              {/* Main State Circle */}
              <circle
                cx={pos.x}
                cy={pos.y}
                r={NODE_RADIUS}
                fill={isActive ? '#e0e7ff' : state === automaton.deadState ? '#fee2e2' : '#ffffff'}
                stroke={isActive ? '#4f46e5' : isAccepting ? '#10b981' : state === automaton.deadState ? '#ef4444' : '#64748b'}
                strokeWidth={isActive ? '3' : '2'}
              />

              {/* Double border circle for Accepting states */}
              {isAccepting && (
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={NODE_RADIUS - 4}
                  fill="none"
                  stroke={isActive ? '#4f46e5' : '#10b981'}
                  strokeWidth="1.5"
                />
              )}

              {/* State ID Text */}
              <text
                x={pos.x}
                y={pos.y + 4}
                textAnchor="middle"
                fontSize="12"
                fontWeight="700"
                fill={isActive ? '#4f46e5' : state === automaton.deadState ? '#dc2626' : '#1e293b'}
              >
                {state}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
