"use client";

import { useEffect, useState } from "react";

import { emptyData, fetchDashboardData } from "./admin-data";
import { AdminHomeView } from "./admin-home-view";
import type { AdminDashboardData } from "./admin-types";

export function AdminHome() {
  const [data, setData] = useState<AdminDashboardData>(emptyData);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      setLoading(true);

      try {
        const nextData = await fetchDashboardData();

        if (!cancelled) {
          setData(nextData);
          setErrorMessage("");
        }
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(
            error instanceof Error ? error.message : "后台数据加载失败",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadData();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <main className="shell-page pt-32 pb-24">
        <section className="ui-panel p-8">
          <p className="ui-meta">Loading</p>
          <p className="mt-4 text-base leading-7 text-text-base">
            正在加载后台概览...
          </p>
        </section>
      </main>
    );
  }

  if (errorMessage) {
    return (
      <main className="shell-page pt-32 pb-24">
        <section className="rounded-control border border-rose-300/20 bg-rose-500/8 px-4 py-3 text-sm text-rose-200">
          {errorMessage}
        </section>
      </main>
    );
  }

  return <AdminHomeView data={data} />;
}
