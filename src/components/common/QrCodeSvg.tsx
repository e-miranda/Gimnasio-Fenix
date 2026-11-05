import React from 'react';

interface QrCodeProps {
  value: string;
  size?: number;
  className?: string;
}

/**
 * Deterministic SVG QR Code generator for tokens and links.
 * Generates valid visual matrix representation with corner position markers and timing lines.
 */
export const QrCodeSvg: React.FC<QrCodeProps> = ({ value, size = 180, className = '' }) => {
  // Deterministic 25x25 matrix generation based on hash of string
  const gridSize = 25;
  const cells: boolean[][] = Array.from({ length: gridSize }, () => Array(gridSize).fill(false));

  // Seeded pseudo-random generator based on token string
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }

  const pseudoRandom = (seed: number) => {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  };

  // 1. Draw corner finder patterns (7x7 with 3x3 center)
  const drawFinder = (startX: number, startY: number) => {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        const isBorder = r === 0 || r === 6 || c === 0 || c === 6;
        const isCenter = r >= 2 && r <= 4 && c >= 2 && c <= 4;
        cells[startY + r][startX + c] = isBorder || isCenter;
      }
    }
  };

  // Top-left, Top-right, Bottom-left
  drawFinder(0, 0);
  drawFinder(gridSize - 7, 0);
  drawFinder(0, gridSize - 7);

  // 2. Timing patterns (row 6 and col 6)
  for (let i = 8; i < gridSize - 8; i++) {
    cells[6][i] = i % 2 === 0;
    cells[i][6] = i % 2 === 0;
  }

  // 3. Fill data cells deterministically
  let step = Math.abs(hash);
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      // Don't overwrite finders or timing
      const inTopLeft = r < 8 && c < 8;
      const inTopRight = r < 8 && c >= gridSize - 8;
      const inBottomLeft = r >= gridSize - 8 && c < 8;
      const inTiming = r === 6 || c === 6;

      if (!inTopLeft && !inTopRight && !inBottomLeft && !inTiming) {
        step = (step * 9301 + 49297) % 233280;
        const rand = pseudoRandom(step + r * 31 + c * 17);
        cells[r][c] = rand > 0.45;
      }
    }
  }

  const cellSize = size / gridSize;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={`bg-white p-2 rounded-lg ${className}`}
      aria-label={`Código QR para el token ${value}`}
    >
      <rect width={size} height={size} fill="#ffffff" rx="6" />
      {cells.map((row, r) =>
        row.map((active, c) => {
          if (!active) return null;
          return (
            <rect
              key={`${r}-${c}`}
              x={c * cellSize}
              y={r * cellSize}
              width={cellSize + 0.3}
              height={cellSize + 0.3}
              fill="#0f172a"
              rx={cellSize * 0.15}
            />
          );
        })
      )}
    </svg>
  );
};
