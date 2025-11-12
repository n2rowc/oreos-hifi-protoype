import React from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";

const HISTORY_ITEMS = [
  { id: "new", title: "➕ New session", subtitle: "Start a fresh upload" },
  { id: "lecture-1", title: "Lecture 1 – Algorithms", subtitle: "Sept 20 • 52 min" },
  { id: "lecture-2", title: "Lecture 2 – HCI", subtitle: "Sept 22 • 47 min" },
  { id: "meeting-1", title: "Project check-in", subtitle: "Sept 24 • 30 min" },
];

export default function OreosSidebar() {
  const navigate = useNavigate();
  const { sessionId } = useParams();
  const location = useLocation();

  const currentId =
    location.pathname === "/" ? "new" : sessionId || "new";

  return (
    <aside className="w-72 border-r border-slate-800 bg-slate-900/90 flex flex-col">
      <div className="px-4 pt-4 pb-2">
        <h1 className="text-2xl font-semibold tracking-tight">Oreos HiFi</h1>
        <p className="mt-1 text-xs text-slate-400">Recent uploads</p>
      </div>

      <div className="mt-2 flex-1 overflow-y-auto px-2 pb-4 space-y-1">
        {HISTORY_ITEMS.map((item) => {
          const isActive = item.id === currentId;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                if (item.id === "new") {
                  navigate("/");
                } else {
                  navigate(`/session/${item.id}`);
                }
              }}
              className={[
                "w-full text-left px-3 py-2 rounded-lg transition",
                "flex flex-col gap-0.5",
                isActive
                  ? "bg-slate-800/90 text-slate-50 border border-slate-700"
                  : "text-slate-300 hover:bg-slate-800/70 hover:text-slate-50",
              ].join(" ")}
            >
              <span className="text-sm font-medium truncate">
                {item.title}
              </span>
              <span className="text-[11px] text-slate-400 truncate">
                {item.subtitle}
              </span>
            </button>
          );
        })}
      </div>

      <div className="border-t border-slate-800 px-4 py-3 text-[11px] text-slate-500">
        Click a past upload to revisit it, or choose{" "}
        <span className="font-semibold text-slate-300">“New session”</span> to
        upload new audio.
      </div>
    </aside>
  );
}
