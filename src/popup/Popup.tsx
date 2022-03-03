import { getUpdates } from '@src/util/api';
import { getHoursPerDay, getMonday } from '@src/util/date';
import { browser } from 'webextension-polyfill-ts';
import classNames from 'classnames';
import React, { useEffect, useMemo, useState } from 'react';

export default function Popup() {
  const [authtoken, setAuthtoken] = React.useState(
    localStorage.getItem('authtoken') ?? '',
  );
  const onClick = async () => {
    // get days from rally
    var query = { active: true, currentWindow: true };
    const tabs = await browser.tabs.query(query);
    tabs.forEach(async (tab) => {
      browser.runtime.onMessage.addListener(
        async ({ dateRange }: { dateRange: string }) => {
          const start = new Date(dateRange.split('-')[0].trim());
          const records = await getUpdates(start.getTime() / 1000, authtoken);
          const timesheet = getHoursPerDay(records, start);
          return timesheet;
        },
      );
      browser.tabs.executeScript(tab.id, {
        runAt: 'document_end',
        file: 'js/contentScript.js',
      });
    });
    setTimeout(() => window.close(), 100);
  };

  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    const query = { active: true, lastFocusedWindow: true };
    browser.tabs.query(query).then((tabs) => {
      let url = tabs[0].url;
      setEnabled(url?.includes('https://rally1.rallydev.com/') ?? false);
    });
  }, []);

  const onTokenChange: React.ChangeEventHandler<HTMLInputElement> = (v) => {
    setAuthtoken(v.target.value);
    localStorage.setItem('authtoken', v.target.value);
  };

  const tokenValid = authtoken.length > 0;
  return (
    <div className="w-64 bg-white">
      <form className="p-4 w-full h-full">
        <div className="mb-2">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="token"
          >
            Token
          </label>
          <input
            className={classNames(
              'shadow appearance-none border  rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline',
              { 'border-red-500': !tokenValid },
              'focus:border-blue-500',
            )}
            value={authtoken}
            onChange={onTokenChange}
            id="token"
            type="password"
            placeholder="******************"
          />
          <p
            className={classNames('text-red-500 text-xs italic', {
              ['invisible']: tokenValid,
            })}
          >
            Please provide a timetagger token.
          </p>
        </div>
        <div className="mb-6">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="type"
          >
            Type
          </label>
          <div className="relative">
            <select
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700  leading-tight focus:outline-none focus:shadow-outline"
              id="type"
              defaultValue="all"
            >
              <option value="all">All</option>
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <svg
                className="fill-current h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
              >
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
              </svg>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-16 disabled:bg-gray-500 disabled:cursor-not-allowed"
            type="button"
            onClick={onClick}
            disabled={!tokenValid || !enabled}
          >
            Fill
          </button>
        </div>
      </form>
    </div>
  );
}
