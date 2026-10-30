import { useEffect, useState } from "react";

export default function usePolling(fn, interval = 3000) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    let inFlight = false;

    async function load() {
      if (inFlight) {
        return;
      }

      inFlight = true;

      try {
        const result = await fn();

        if (active) {
          setData(result);
          setError(null);
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error ? err.message : "Unable to load data"
          );
        }
      } finally {
        inFlight = false;

        if (active) {
          setLoading(false);
        }
      }
    }

    load();

    const timerId = setInterval(load, interval);

    return () => {
      active = false;
      clearInterval(timerId);
    };
  }, [fn, interval]);

  return {
    data,
    error,
    loading
  };
}