import { describe, expect, test } from "vitest";
import {
	acquireEscapeDismissalBlock,
	isEscapeDismissalBlocked,
} from "@/web/packages/utils/escapeDismissal";

describe("escape dismissal", () => {
	test("tracks nested blockers and releases each blocker once", () => {
		const releaseFirst = acquireEscapeDismissalBlock();
		const releaseSecond = acquireEscapeDismissalBlock();
		expect(isEscapeDismissalBlocked()).toBe(true);

		releaseFirst();
		releaseFirst();
		expect(isEscapeDismissalBlocked()).toBe(true);

		releaseSecond();
		expect(isEscapeDismissalBlocked()).toBe(false);
	});
});
