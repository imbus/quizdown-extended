function fetch(
  url: string,
  timeout: number = 8000
): Promise<any> {
  // Check if the URL is in sessionStorage
  const cachedData = sessionStorage.getItem(url);
  if (cachedData) {
    return Promise.resolve(JSON.parse(cachedData));
  }

  return new Promise<any>((resolve, reject) => {
    const controller = new AbortController();
    const id = setTimeout(() => {
      controller.abort();
      reject(new Error(`Request timed out after ${timeout}ms`));
    }, timeout);

    fetch(url, { signal: controller.signal })
      .then((response) => {
        clearTimeout(id);
        if (!response.ok) {
          reject(new Error(`HTTP error! Status: ${response.status}`));
        } else {
          return response.json(); // or response.text() if it's a CSS file
        }
      })
      .then((data) => {
        // Store the fetched data in sessionStorage
        sessionStorage.setItem(url, JSON.stringify(data));
        resolve(data);
      })
      .catch((err) => {
        clearTimeout(id);
        reject(err);
      });
  });
}


export default fetch;