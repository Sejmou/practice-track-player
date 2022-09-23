export const baseFetcher = async (url: string, init?: RequestInit) => {
  const res = await fetch(url, init);

  if (!res.ok) {
    // throw Error if we got an error
    throw Error(
      'An error occurred while fetching the data. Status code: ' + res.status
    );
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
