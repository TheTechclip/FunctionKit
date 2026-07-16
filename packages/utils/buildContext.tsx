"use client";

import { createContext, type ReactNode, useContext, useMemo } from "react";

export function buildContext<T>(defaultValue: T) {
	const Ctx = createContext<T>(defaultValue);

	function Provider({ value, children }: { value: T; children: ReactNode }) {
		const stable = useMemo(() => value, [value]);
		return <Ctx.Provider value={stable}>{children}</Ctx.Provider>;
	}

	function useValue() {
		const ctx = useContext(Ctx);
		return ctx;
	}

	return [Provider, useValue] as const;
}
