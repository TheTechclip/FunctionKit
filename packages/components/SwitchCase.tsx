import type { ReactNode } from "react";

type SwitchCaseProps<T extends string | number> = {
  value: T;
  cases: Partial<Record<T, ReactNode>>;
  otherwise?: ReactNode;
};

export function SwitchCase<T extends string | number>({
  value,
  cases,
  otherwise = null,
}: SwitchCaseProps<T>) {
  return (cases[value] ?? otherwise) as ReactNode;
}
