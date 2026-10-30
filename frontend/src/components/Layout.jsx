import {
    Activity,
    LayoutDashboard,
    Network,
    ShieldCheck
  } from "lucide-react";
  import { NavLink, Outlet, useLocation } from "react-router-dom";
  
  const navigation = [
    {
      label: "Overview",
      path: "/",
      icon: LayoutDashboard,
      end: true
    },
    {
      label: "Shadow AI Inventory",
      path: "/inventory",
      icon: Network,
      end: false
    },
    {
      label: "Incidents",
      path: "/incidents",
      icon: Activity,
      end: false
    }
  ];
  
  function getPageTitle(pathname) {
    if (pathname.startsWith("/incidents/")) {
      return "Incident Detail";
    }
  
    if (pathname === "/inventory") {
      return "Shadow AI Inventory";
    }
  
    if (pathname === "/incidents") {
      return "Incidents";
    }
  
    return "Overview";
  }
  
  export default function Layout() {
    const location = useLocation();
    const pageTitle = getPageTitle(location.pathname);
  
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100">
        <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-zinc-800 bg-zinc-950 lg:flex">
          <div className="flex h-20 items-center gap-3 border-b border-zinc-800 px-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-300">
              <ShieldCheck size={23} strokeWidth={2.2} />
            </div>
  
            <div>
              <p className="text-base font-semibold tracking-tight text-white">
                ShadowGuard AI
              </p>
              <p className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-500">
                Security console
              </p>
            </div>
          </div>
  
          <div className="px-4 pt-8">
            <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-600">
              Workspace
            </p>
  
            <nav className="space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
  
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.end}
                    className={({ isActive }) =>
                      [
                        "group flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors",
                        isActive
                          ? "border border-cyan-400/15 bg-cyan-400/10 text-cyan-300"
                          : "border border-transparent text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100"
                      ].join(" ")
                    }
                  >
                    <Icon size={18} strokeWidth={1.9} />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>
  
          <div className="mt-auto p-4">
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-4">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-40" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                </span>
                <span className="text-xs font-medium text-zinc-300">
                  Local console
                </span>
              </div>
  
              <p className="mt-2 text-[11px] leading-5 text-zinc-500">
                Privacy-focused monitoring. No TLS interception.
              </p>
            </div>
  
            <p className="mt-4 px-1 text-[10px] text-zinc-600">
              ShadowGuard AI · Prototype
            </p>
          </div>
        </aside>
  
        <div className="min-h-screen lg:pl-64">
          <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-zinc-800/90 bg-zinc-950/90 px-5 backdrop-blur-xl sm:px-8">
            <div>
              <p className="text-sm font-semibold text-zinc-100">
                {pageTitle}
              </p>
              <p className="mt-0.5 hidden text-[11px] text-zinc-500 sm:block">
                AI usage monitoring and security auditing
              </p>
            </div>
  
            <div className="flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900 px-3 py-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
              <span className="text-[11px] font-medium text-zinc-400">
                LOCAL MODE
              </span>
            </div>
          </header>
  
          <main className="mx-auto w-full max-w-[1600px] p-5 sm:p-8">
            <Outlet />
          </main>
        </div>
      </div>
    );
  }