import {
    Activity,
    AlertTriangle,
    ArrowUpRight,
    Bot,
    Network,
    ShieldCheck
  } from "lucide-react";
  import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Legend,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
  } from "recharts";
  import { Link } from "react-router-dom";
  import { getIncidents, getStats } from "../api.js";
  import usePolling from "../hooks/usePolling.js";
  
  const numberFormat = new Intl.NumberFormat("en-IN");
  
  function MetricCard({ label, value, detail, icon: Icon, tone = "cyan" }) {
    const tones = {
      cyan: "border-cyan-400/15 bg-cyan-400/10 text-cyan-300",
      red: "border-red-400/15 bg-red-400/10 text-red-300",
      amber: "border-amber-400/15 bg-amber-400/10 text-amber-300",
      violet: "border-violet-400/15 bg-violet-400/10 text-violet-300"
    };
  
    return (
      <div className="panel p-5">
        <div className="flex items-start justify-between gap-3">
          <p className="text-sm text-zinc-400">{label}</p>
          <div className={`rounded-lg border p-2 ${tones[tone]}`}>
            <Icon size={18} />
          </div>
        </div>
  
        <p className="mt-5 text-3xl font-semibold tracking-tight text-white">
          {value === undefined || value === null
            ? "—"
            : numberFormat.format(value)}
        </p>
  
        <p className="mt-1 text-xs text-zinc-500">{detail}</p>
      </div>
    );
  }
  
  function LoadingMessage({ children }) {
    return (
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 px-5 py-8 text-center text-sm text-zinc-500">
        {children}
      </div>
    );
  }
  
  export default function Overview() {
    const {
      data: stats,
      error: statsError,
      loading: statsLoading
    } = usePolling(getStats, 3000);
  
    const {
      data: incidents,
      error: incidentsError,
      loading: incidentsLoading
    } = usePolling(getIncidents, 3000);
  
    const providerData = Object.values(
      (stats?.by_provider || []).reduce((groups, item) => {
        if (!groups[item.provider]) {
          groups[item.provider] = {
            provider: item.provider,
            approved: 0,
            shadow: 0
          };
        }
  
        if (item.sanctioned) {
          groups[item.provider].approved += item.count;
        } else {
          groups[item.provider].shadow += item.count;
        }
  
        return groups;
      }, {})
    );
  
    const latestCritical = (incidents || [])
      .filter((incident) => incident.severity === "critical")
      .slice(0, 5);
  
    const formatMinute = (value) => {
      const date = new Date(value);
      return Number.isNaN(date.getTime())
        ? value
        : date.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
          });
    };
  
    return (
      <div className="space-y-6">
        <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">
              Security overview
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              AI activity at a glance
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
              Monitor AI provider usage, discover shadow AI activity, and review
              security incidents from one local console.
            </p>
          </div>
  
          <div className="flex w-fit items-center gap-2 rounded-full border border-emerald-400/15 bg-emerald-400/5 px-3 py-2 text-xs text-emerald-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Polling every 3 seconds
          </div>
        </section>
  
        {(statsError || incidentsError) && (
          <div className="flex items-start gap-3 rounded-xl border border-red-400/20 bg-red-400/5 p-4 text-sm text-red-300">
            <AlertTriangle size={18} className="mt-0.5 shrink-0" />
            <div>
              <p className="font-medium">Backend offline or request failed</p>
              <p className="mt-1 text-xs text-red-300/80">
                {statsError || incidentsError}
              </p>
            </div>
          </div>
        )}
  
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="AI Requests"
            value={stats?.ai_requests}
            detail="Requests to identified AI providers"
            icon={Activity}
            tone="cyan"
          />
          <MetricCard
            label="Shadow AI Requests"
            value={stats?.shadow_requests}
            detail="Requests to unapproved providers"
            icon={AlertTriangle}
            tone="red"
          />
          <MetricCard
            label="Open Incidents"
            value={stats?.incidents_total}
            detail="Correlated security incidents"
            icon={ShieldCheck}
            tone="amber"
          />
          <MetricCard
            label="Providers Detected"
            value={stats?.providers_seen}
            detail="Unique AI providers identified"
            icon={Network}
            tone="violet"
          />
        </section>
  
        {statsLoading && !stats ? (
          <LoadingMessage>Loading overview statistics…</LoadingMessage>
        ) : (
          <section className="grid gap-5 xl:grid-cols-2">
            <div className="panel min-w-0 p-5">
              <div className="mb-5">
                <h2 className="text-sm font-semibold text-zinc-100">
                  Requests by provider
                </h2>
                <p className="mt-1 text-xs text-zinc-500">
                  Approved versus shadow provider activity
                </p>
              </div>
  
              {providerData.length === 0 ? (
                <LoadingMessage>No provider activity available.</LoadingMessage>
              ) : (
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={providerData}
                      margin={{ top: 8, right: 8, left: -18, bottom: 0 }}
                    >
                      <CartesianGrid
                        stroke="#3f3f46"
                        strokeDasharray="3 3"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="provider"
                        tick={{ fill: "#a1a1aa", fontSize: 11 }}
                        axisLine={{ stroke: "#52525b" }}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fill: "#71717a", fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip
                        contentStyle={{
                          background: "#18181b",
                          border: "1px solid #3f3f46",
                          borderRadius: 10,
                          color: "#f4f4f5"
                        }}
                      />
                      <Legend
                        wrapperStyle={{
                          color: "#a1a1aa",
                          fontSize: 11
                        }}
                      />
                      <Bar
                        dataKey="approved"
                        name="Approved"
                        stackId="requests"
                        fill="#22d3ee"
                        radius={[0, 0, 0, 0]}
                      />
                      <Bar
                        dataKey="shadow"
                        name="Shadow"
                        stackId="requests"
                        fill="#f87171"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
  
            <div className="panel min-w-0 p-5">
              <div className="mb-5">
                <h2 className="text-sm font-semibold text-zinc-100">
                  Activity timeline
                </h2>
                <p className="mt-1 text-xs text-zinc-500">
                  Requests and correlated incidents over time
                </p>
              </div>
  
              {(stats?.timeline || []).length === 0 ? (
                <LoadingMessage>No timeline data available.</LoadingMessage>
              ) : (
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={stats.timeline}
                      margin={{ top: 8, right: 8, left: -18, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient
                          id="requestFill"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="0%"
                            stopColor="#22d3ee"
                            stopOpacity={0.28}
                          />
                          <stop
                            offset="95%"
                            stopColor="#22d3ee"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        stroke="#3f3f46"
                        strokeDasharray="3 3"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="minute"
                        tickFormatter={formatMinute}
                        tick={{ fill: "#a1a1aa", fontSize: 11 }}
                        axisLine={{ stroke: "#52525b" }}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fill: "#71717a", fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip
                        labelFormatter={formatMinute}
                        contentStyle={{
                          background: "#18181b",
                          border: "1px solid #3f3f46",
                          borderRadius: 10,
                          color: "#f4f4f5"
                        }}
                      />
                      <Legend
                        wrapperStyle={{
                          color: "#a1a1aa",
                          fontSize: 11
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="requests"
                        name="Requests"
                        stroke="#22d3ee"
                        fill="url(#requestFill)"
                        strokeWidth={2}
                      />
                      <Area
                        type="monotone"
                        dataKey="incidents"
                        name="Incidents"
                        stroke="#f59e0b"
                        fill="none"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </section>
        )}
  
        <section className="panel overflow-hidden">
          <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-4">
            <div>
              <h2 className="text-sm font-semibold text-zinc-100">
                Latest critical incidents
              </h2>
              <p className="mt-1 text-xs text-zinc-500">
                Highest severity incidents requiring attention
              </p>
            </div>
  
            <Link
              to="/incidents"
              className="flex items-center gap-1 text-xs font-medium text-cyan-300 transition hover:text-cyan-200"
            >
              All incidents
              <ArrowUpRight size={14} />
            </Link>
          </div>
  
          {incidentsLoading && !incidents ? (
            <div className="p-5 text-sm text-zinc-500">
              Loading incidents…
            </div>
          ) : latestCritical.length === 0 ? (
            <div className="p-8 text-center">
              <Bot size={24} className="mx-auto text-zinc-600" />
              <p className="mt-3 text-sm text-zinc-400">
                No critical incidents to display.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-800">
              {latestCritical.map((incident) => (
                <Link
                  key={incident.incident_id}
                  to={`/incidents/${incident.incident_id}`}
                  className="flex flex-col gap-3 px-5 py-4 transition hover:bg-zinc-900/70 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-md border border-red-400/20 bg-red-400/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-red-300">
                        Critical
                      </span>
                      {incident.is_chain && (
                        <span className="text-xs text-amber-300">
                          ⛓ Exfiltration chain
                        </span>
                      )}
                    </div>
                    <p className="mt-2 truncate text-sm font-medium text-zinc-200">
                      {incident.agent_context}
                    </p>
                    <p className="mt-1 text-xs text-zinc-500">
                      {incident.source} → {incident.provider}
                    </p>
                  </div>
  
                  <div className="flex shrink-0 items-center gap-4">
                    <span className="mono text-lg font-semibold text-red-300">
                      {incident.risk_score}/10
                    </span>
                    <ArrowUpRight size={16} className="text-zinc-500" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    );
  }