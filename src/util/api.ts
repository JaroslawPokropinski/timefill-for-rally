import { Record } from '@src/types/Record';

export async function getUpdates(
  since: number,
  token: string,
): Promise<Record[]> {
  return fetch(`http://localhost/timetagger/api/v2/updates?since=${since}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      authtoken: token,
    },
  })
    .then((response) => response.json())
    .then((json) => json.records);
}
