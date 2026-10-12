"use client";

import { createContext, type ReactNode, useContext } from "react";

export function buildContext<T>(displayName?: string) {
	const Ctx = createContext<T | undefined>(undefined);
	Ctx.displayName = displayName;

	function Provider({ value, children }: { value: T; children: ReactNode }) {
		return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
	}

	function useValue() {
		const ctx = useContext(Ctx);
		if (ctx === undefined) {
			throw new Error(`${displayName ?? "Context"} must be used within its Provider.`);
		}
		return ctx;
	}

	return [useValue, Provider] as const;
}
