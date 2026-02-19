import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";

const DataContext = createContext();

const PAGE_SIZE = 10;

export function DataProvider({ children }) {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // bumped on every fetch so we can ignore responses that come back out of order
  const requestIdRef = useRef(0);

  const fetchItems = useCallback(
    async (signal) => {
      const id = ++requestIdRef.current;
      setLoading(true);
      setError(null);
      try {
        const offset = (page - 1) * PAGE_SIZE;
        const params = new URLSearchParams({ offset, limit: PAGE_SIZE });
        if (query) params.set("q", query);

        const res = await fetch(`/api/items?${params}`, { signal });
        if (!res.ok) throw new Error("Failed to fetch items");
        const data = await res.json();
        if (id !== requestIdRef.current) return; // stale, a newer request already fired
        setItems(data.items);
        setTotal(data.total);
        setLoading(false);
      } catch (err) {
        if (err.name === "AbortError") return;
        if (id !== requestIdRef.current) return;
        setError(err);
        setLoading(false);
      }
    },
    [page, query],
  );

  // without this, every provider render would re-render all consumers
  const value = useMemo(
    () => ({
      items,
      total,
      page,
      setPage,
      query,
      setQuery,
      loading,
      error,
      fetchItems,
      PAGE_SIZE,
    }),
    [items, total, page, query, loading, error, fetchItems],
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export const useData = () => useContext(DataContext);
