import { browser } from 'webextension-polyfill-ts';

function fillInput(el: HTMLInputElement, value: string) {
  el.dispatchEvent(new Event('focus', { bubbles: true }));
  el.value = value;
  el.dispatchEvent(new Event('input', { bubbles: true }));
  el.blur();
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
      for (let i = 0; i < rows.length; i++) {
        const cells = rows[i].getElementsByClassName('smb-TableCell');

        const fillWeek = (tag: string) => {
          for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek++) {
            const hours = fill[dayOfWeek]?.[tag];
            if (hours) {
              const roundingFactor = 100;
              const rounded =
                Math.round((hours + Number.EPSILON) * roundingFactor) /
                roundingFactor;
              const el = cells[dayOfWeek + 5] as HTMLElement;
              el.click();
              const editor = cells[dayOfWeek + 5].getElementsByClassName(
                'smb-TextInput-input',
              )[0] as HTMLInputElement;
              fillInput(editor, `${rounded}`);
            }
          }
        };

        const project = cells[0]?.textContent;
        const taskDesc = cells[2]?.textContent?.toLowerCase();
        if (taskDesc?.startsWith('ta')) {
          const task = taskDesc.split(':')[0];
          fillWeek(`#${task}`);
        } else if (project?.startsWith('.')) {
          if (project.startsWith('.Conferences')) {
            fillWeek('#events');
          }
          if (project.startsWith('.Employee')) {
            fillWeek('#personal');
          }
          if (project.startsWith('.Scrum')) {
            fillWeek('#scrum');
          }
        }
      }
    });
})();
