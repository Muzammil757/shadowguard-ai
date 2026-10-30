import { useMemo, useState } from "react";
import { Network, Search, ShieldCheck, ShieldX } from "lucide-react";
import { getStats } from "../api.js";
import usePolling from "../hooks/usePolling.js";

export default function Inventory() {
  const { data: stats, error, loading } = usePolling(getStats, 3000);
  const [shadowOnly, setShadowOnly] = useState(false);
  const [search, setSearch] = useState("");

  const inventory = useMemo(() => {
    const rows = [...(stats?.inventory || [])];

    rows.sort((a, b) => {
      if (a.sanctioned !== b.sanctioned) {
        return Number(a.sanctioned) - Number(b.sanctioned);
      }

      return b.requests - a.requests;
    });

    return rows.filter((item) => {
      const matchesStatus = !shadowOnly || item.sanctioned === false;
      const query = search.trim().toLowerCase();
      const matchesSearch =
        !query ||
        item.source.toLowerCase().includes(query) ||
        item.provider.toLowerCase().includes(query);

      return matchesStatus && matchesSearch;
    });
  }, [stats, shadowOnly, search]);

  function formatTimestamp(value) {
    const date = new Date(value);

    return Number.isNaN(date.getTime())
      ? value
      : date.toLocaleString();
  }

  return (
    <div className="space-y-6">
      <section>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">
          Discovery
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          Shadow AI Inventory
        </h1>
        <p className="mt-2 text-sm leading-6 text-zinc-400">
          See which processes communicate with AI providers and identify
          activity outside the approved provider list.
        </p>
      </section>

      {error && (
        <div className="rounded-xl border border-red-400/20 bg-red-400/5 p-4 text-sm text-red-300">
          Could not load inventory: {error}
        </div>
      )}

      <section className="grid gap-4 sm:grid-cols-3">
        <div className="panel p-5">
          <p className="text-xs text-zinc-500">Detected processes</p>
          <p className="mt-2 text-2xl font-semibold text-white">
            {inventory.length}
          </p>
        </div>

        <div className="panel p-5">
          <p className="text-xs text-zinc-500">Approved entries</p>
          <p className="mt-2 text-2xl font-semibold text-emerald-300">
            {(stats?.inventory || []).filter((item) => item.sanctioned).length}
          </p>
        </div>

        <div className="panel p-5">
          <p className="text-xs text-zinc-500">Shadow entries</p>
          <p className="mt-2 text-2xl font-semibold text-red-300">
            {
              (stats?.inventory || []).filter(
                (item) => item.sanctioned === false
              ).length
            }
          </p>
        </div>
      </section>

      <section className="panel overflow-hidden">
        <div className="flex flex-col gap-4 border-b border-zinc-800 p-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-sm font-semibold text-zinc-100">
              Process inventory
            </h2>
            <p className="mt-1 text-xs text-zinc-500">
              Grouped by process and AI provider
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <label className="flex items-center gap-2 text-xs text-zinc-400">
              <input
                type="checkbox"
                checked={shadowOnly}
                onChange={(event) => setShadowOnly(event.target.checked)}
                className="h-4 w-4 accent-cyan-400"
              />
              Show shadow only
            </label>

            <div className="relative">
              <Search
                size={15}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
              />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search process or provider"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 py-2 pl-9 pr-3 text-xs text-zinc-200 outline-none placeholder:text-zinc-600 focus:border-cyan-400/60 sm:w-64"
              />
            </div>
          </div>
        </div>

        {loading && !stats ? (
          <div className="p-8 text-center text-sm text-zinc-500">
            Loading inventory…
          </div>
        ) : inventory.length === 0 ? (
          <div className="p-10 text-center">
            <Network size={25} className="mx-auto text-zinc-600" />
            <p className="mt-3 text-sm text-zinc-400">
              No matching inventory entries.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left">
              <thead className="bg-zinc-900/80">
                <tr className="text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                  <th className="px-5 py-4">Process</th>
                  <th className="px-5 py-4">Provider</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4 text-right">Requests</th>
                  <th className="px-5 py-4">Last seen</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-zinc-800">
                {inventory.map((item, index) => (
                  <tr
                    key={`${item.source}-${item.provider}-${index}`}
                    className="transition hover:bg-zinc-900/50"
                  >
                    <td className="px-5 py-4">
                      <span className="mono text-xs text-zinc-200">
                        {item.source}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-sm text-zinc-300">
                      {item.provider}
                    </td>

                    <td className="px-5 py-4">
                      {item.sanctioned ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-[10px] font-semibold text-emerald-300">
                          <ShieldCheck size={12} />
                          Approved
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-red-400/20 bg-red-400/10 px-2.5 py-1 text-[10px] font-semibold text-red-300">
                          <ShieldX size={12} />
                          SHADOW
                        </span>
                      )}
                    </td>

                    <td className="mono px-5 py-4 text-right text-sm text-zinc-300">
                      {item.requests.toLocaleString("en-IN")}
                    </td>

                    <td className="px-5 py-4 text-xs text-zinc-500">
                      {formatTimestamp(item.last_seen)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}