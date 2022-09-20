// makes sure that we always get an error if the fetch request fails
export const baseFetcher = async (url: string, init?: RequestInit) => {
  const res = await fetch(url, init);

  // If the status code is not in the range 200-299,
  // we still try to parse and throw it.
  if (!res.ok) {
    const error = new Error(
      'An error occurred while fetching the data. Status code: ' + res.status
    );
    // TODO: Attach extra info to the error object - not working like that because of TypeScript lol
    // error.info = await res.json()
    // error.status = res.status
    throw error;
  }
  return res;
};

export const jsonFetcher = (url: string, init?: RequestInit) =>
  baseFetcher(url, init).then(async data => {
    try {
      const json = await data.json();
      return json;
    } catch (error) {
      const msg = 'Could not decode API response - not valid JSON!';
      console.error(msg + '\n', error);
      throw Error('Could not decode API response - not valid JSON!');
    }
  });
