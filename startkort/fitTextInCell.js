// Dynamically fit text in all table cells of .rounds-table
export function fitTextInRoundsTableCells(container = document) {
  const cells = container.querySelectorAll('.rounds-table th, .rounds-table td');
  cells.forEach(cell => {
    fitTextInCell(cell);
  });
}

function fitTextInCell(cell) {
  // Reset font size to max
  cell.style.fontSize = '';
  let fontSize = parseFloat(getComputedStyle(cell).fontSize);
  const minFontSize = 7; // px, don't go below this
  const cellWidth = cell.clientWidth;
  const cellHeight = cell.clientHeight;
  // Only shrink if overflow
  while ((cell.scrollWidth > cellWidth || cell.scrollHeight > cellHeight) && fontSize > minFontSize) {
    fontSize -= 0.5;
    cell.style.fontSize = fontSize + 'px';
  }
}

// Optional: fit on window resize or print
window.addEventListener('resize', () => fitTextInRoundsTableCells());
window.addEventListener('DOMContentLoaded', () => fitTextInRoundsTableCells());
window.addEventListener('afterprint', () => fitTextInRoundsTableCells());
window.addEventListener('beforeprint', () => fitTextInRoundsTableCells());
