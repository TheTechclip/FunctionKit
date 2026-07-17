"use client";

import { createContext, type ReactNode, useContext } from "react";

export function buildContext<T>(defaultValue: T) {
	const Ctx = createContext<T>(defaultValue);

	function Provider({ value, children }: { value: T; children: ReactNode }) {
		return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
	}

	function useValue() {
		const ctx = useContext(Ctx);
		return ctx;
	}

	return [Provider, useValue] as const;
}
