"use client";

import { useCallback, useEffect, useState } from "react";
import CreateAdminForm from "./CreateAdminForm";

interface AdminRow {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  isSuperAdmin: boolean;
}

export default function AdminsPanel({ onDone }: { onDone: () => void }) {
  const [admins, setAdmins] = useState<AdminRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/admins");
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not load admins.");
        return;
      }
      setError(null);
      setAdmins(data.admins);
    } catch {
      setError("Network error — please try again.");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function remove(id: string) {
    setPending(id);
    try {
      const res = await fetch(`/api/admin/admins/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not remove access.");
        return;
      }
      setAdmins((prev) => prev?.filter((a) => a.id !== id) ?? null);
    } catch {
      setError("Network error — please try again.");
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="rounded-lg border border-line bg-surface-2 p-5 mb-8">
      <div className="flex items-center justify-between mb-4 gap-3">
        <h2 className="text-display text-lg uppercase tracking-wide text-ink">Admin access</h2>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setShowCreate((v) => !v)}
            className="text-xs text-ink-dim hover:text-ink border border-line rounded-md px-3 py-2 uppercase tracking-wide transition-colors"
          >
            {showCreate ? "Cancel" : "Add admin"}
          </button>
          <button
            type="button"
            onClick={onDone}
            className="text-xs text-ink-dim hover:text-ink border border-line rounded-md px-3 py-2 uppercase tracking-wide transition-colors"
          >
            Close
          </button>
        </div>
      </div>

      {showCreate && (
        <div className="mb-5">
          <CreateAdminForm onDone={() => setShowCreate(false)} onCreated={load} />
        </div>
      )}

      {error && <p className="text-stop text-xs mb-3">{error}</p>}

      {admins === null ? (
        <p className="text-ink-dim text-sm">Loading…</p>
      ) : admins.length === 0 ? (
        <p className="text-ink-dim text-sm">No admin accounts yet.</p>
      ) : (
        <div className="rounded-md border border-line overflow-x-auto">
          <table className="w-full min-w-[540px] text-sm">
            <thead className="bg-surface text-ink-dim uppercase text-xs tracking-wide">
              <tr>
                <th className="text-left px-4 py-2.5 whitespace-nowrap">Name</th>
                <th className="text-left px-4 py-2.5 whitespace-nowrap">Email</th>
                <th className="text-left px-4 py-2.5 whitespace-nowrap">Added</th>
                <th className="px-4 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {admins.map((a) => (
                <tr key={a.id} className="border-t border-line bg-surface">
                  <td className="px-4 py-2.5 whitespace-nowrap">{a.name}</td>
                  <td className="px-4 py-2.5 whitespace-nowrap">{a.email}</td>
                  <td className="px-4 py-2.5 tabular whitespace-nowrap">
                    {new Date(a.createdAt).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-4 py-2.5 text-right whitespace-nowrap">
                    {a.isSuperAdmin ? (
                      <span className="text-ink-faint text-xs uppercase tracking-wide">
                        Super admin
                      </span>
                    ) : (
                      <button
                        onClick={() => remove(a.id)}
                        disabled={pending === a.id}
                        className="text-stop hover:text-accent disabled:opacity-40 text-xs uppercase tracking-wide"
                      >
                        {pending === a.id ? "…" : "Remove access"}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
