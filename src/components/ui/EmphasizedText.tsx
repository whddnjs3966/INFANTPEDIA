import { Fragment } from "react";
import { emphasisForCareText, splitContentEmphasis, type ContentEmphasisMark } from "@/lib/utils/content-presentation";

const styles = {
  key: "font-semibold text-[var(--foreground)]",
  condition: "font-semibold text-[var(--foreground)]",
  action: "font-semibold text-[var(--brand)]",
  caution: "font-semibold text-[var(--content-caution)]",
  urgent: "font-semibold text-[var(--content-urgent)]",
};

export default function EmphasizedText({ text, marks = emphasisForCareText(text) }: { text: string; marks?: readonly ContentEmphasisMark[] }) {
  return <>{splitContentEmphasis(text, marks).map((part, index) => part.kind
    ? <strong key={index} data-content-emphasis={part.kind} className={styles[part.kind]}>{part.text}</strong>
    : <Fragment key={index}>{part.text}</Fragment>)}</>;
}
