import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, test } from "vitest";
import { useCheckInvisible } from "@/web/packages/hooks/useCheckInvisible";
import { useCheckScroll } from "@/web/packages/hooks/useCheckScroll";
import { useViewportHeight } from "@/web/packages/hooks/useViewportHeight";
import { useViewportMatch } from "@/web/packages/hooks/useViewportMatch";

function Snapshots() {
	const { isInvisible } = useCheckInvisible("server-only-probe");
	const { isScrolled } = useCheckScroll();
	const { height } = useViewportHeight();
	const matched = useViewportMatch("(min-width: 1px)");
	return createElement("output", {
		"data-invisible": isInvisible,
		"data-scrolled": isScrolled,
		"data-height": height,
		"data-matched": matched,
	});
}

describe("external-store SSR snapshots", () => {
	test("render deterministic fallback values without consulting browser snapshots", () => {
		const html = renderToString(createElement(Snapshots));
		expect(html).toContain('data-invisible="false"');
		expect(html).toContain('data-scrolled="false"');
		expect(html).toContain('data-height="0"');
		expect(html).toContain('data-matched="false"');
	});
});
