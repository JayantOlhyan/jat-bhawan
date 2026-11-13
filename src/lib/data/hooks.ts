"use client";

import { useEffect, useRef, useState } from "react";
import { getRepos, type Repos } from ".";
import type { ChangeTopic } from "./repos";

/**
 * Runs `query` against the browser repos after mount and again whenever one
 * of `topics` changes (this tab or another). Starts from `initial`, which is
 * usually the server-rendered result, so there is no loading flash.
 */
export function useLiveQuery<T>(
  query: (repos: Repos) => Promise<T>,
  deps: readonly unknown[],
  topics: readonly ChangeTopic[],
  initial: T,
): T {
  const [data, setData] = useState<T>(initial);
  const queryRef = useRef(query);
  useEffect(() => {
    queryRef.current = query;
  });

  const depsKey = JSON.stringify(deps);
  const topicsKey = topics.join(",");

  useEffect(() => {
    let alive = true;
    const repos = getRepos();
    const run = () => {
      queryRef.current(repos).then(
        (v) => alive && setData(v),
        (err: unknown) => console.error(err),
      );
    };
    run();
    const unsubs = topicsKey.split(",").map((t) => repos.subscribe(t as ChangeTopic, run));
    return () => {
      alive = false;
      unsubs.forEach((u) => u());
    };
  }, [depsKey, topicsKey]);

  return data;
}
