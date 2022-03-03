import { browser } from 'webextension-polyfill-ts';

function fillInput(el: HTMLInputElement, value: string) {
  el.dispatchEvent(new Event('focus', { bubbles: true }));
  el.value = value;
  el.dispatchEvent(new Event('input', { bubbles: true }));
  el.dispatchEvent(new Event('blur', { bubbles: true }));
  el.blur();
}

function fillDays(
  tag: string,
  fill: Record<number, Record<string, number>>,
  cellsArr: (string | null)[],
  cells: HTMLCollectionOf<Element>,
) {
  for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek++) {
    const hours = fill[dayOfWeek]?.[tag];
    if (hours) {
      const rounded = Math.round((hours + 0.1 - Number.EPSILON) * 100) / 100;
      cellsArr[dayOfWeek + 5] = `${rounded}`;
      const el = cells[dayOfWeek + 5] as HTMLElement;
      el.click();
      const editor = cells[dayOfWeek + 5].getElementsByClassName(
        'smb-TextInput-input',
      )[0] as HTMLInputElement;
      fillInput(editor, `${rounded}`);
    }
  }
}

(() => {
  const table = document.getElementsByClassName('smb-TableBody')[0];
  const rows = table.getElementsByClassName('smb-TableRow');

  const dateRange = document.getElementsByClassName(
    'chr-WeekSelector-dateRange',
  )[0];

  browser.runtime
    .sendMessage({ dateRange: dateRange.textContent })
    .then(async (fill: Record<number, Record<string, number>>) => {
      await new Promise((res) => setTimeout(() => res(0), 500));
      console.log(fill);
      const rowsArr = [];
      for (let i = 0; i < rows.length; i++) {
        const cellsArr = [];
        const cells = rows[i].getElementsByClassName('smb-TableCell');
        for (let j = 0; j < cells.length; j++) {
          cellsArr.push(cells[j].textContent);
        }
        if (cellsArr[2]?.toLowerCase()?.startsWith('ta')) {
          const task = cellsArr[2].toLowerCase().split(':')[0];

          fillDays(`#${task}`, fill, cellsArr, cells);
        }
        if (cellsArr[0]?.toLowerCase()?.startsWith('.Scrum Ceremonies')) {
          fillDays(`#scrum`, fill, cellsArr, cells);
        }
        if (cellsArr[0]?.toLowerCase()?.startsWith('.Conferences & Events')) {
          fillDays(`#events`, fill, cellsArr, cells);
        }
        rowsArr.push(cellsArr);
      }
    });
})();
