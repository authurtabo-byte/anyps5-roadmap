// The report form: one dialog, three fields, no page change.
//
// It exists because the alternative was a GitHub account and a blank issue. The reason list covers
// what people actually write in, the text box is optional for everything but "something else", and
// the submission lands in the operator's queue where the model's first pass reads it. The dialog is
// the browser's own <dialog>, so focus trapping, Escape and the backdrop are handled by the engine.

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { CloseIcon } from "./Icons";
import { External } from "./ui";

const REASONS: [string, string][] = [
  ["stop", "Incorrect stopping point"],
  ["stage", "Wrong stage"],
  ["identity", "Wrong game name or merged title IDs"],
  ["fixed", "Blocker already fixed"],
  ["missing", "Reported on GitHub but missing here"],
  ["other", "Something else"],
];

type Status = { kind: "idle" } | { kind: "sending" } | { kind: "done"; id: string } | { kind: "error"; message: string };

export function ReportButton({
  game,
  blocker,
  github,
  label = "Report a correction",
  context,
}: {
  game?: string; // the game's id, so the queue knows what the report is about
  blocker?: string; // the issue number, when the report comes from a blocker panel
  github: string; // the prefilled GitHub form, kept for anyone who wants to attach logs
  label?: string;
  context?: string; // spoken after the label, e.g. "for Silent Hill (PPSA10112)"
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [reason, setReason] = useState("stop");
  const [text, setText] = useState("");
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  useEffect(() => {
    const node = dialog.current;
    if (!node) return;
    // A click on the backdrop is a click outside the panel, but inside the dialog element.
    const onClick = (event: MouseEvent) => {
      if (event.target === node) node.close();
    };
    node.addEventListener("click", onClick);
    return () => node.removeEventListener("click", onClick);
  }, []);

  const open = () => {
    setStatus({ kind: "idle" });
    dialog.current?.showModal();
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status.kind === "sending") return;
    setStatus({ kind: "sending" });
    try {
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason, text, game: game ?? "", blocker: blocker ?? "", page: location.pathname }),
      });
      const body = (await response.json().catch(() => ({}))) as { id?: string; error?: string; note?: string };
      if (!response.ok) {
        setStatus({ kind: "error", message: body.error || "that did not go through" });
        return;
      }
      setStatus({ kind: "done", id: body.id ?? "" });
      setText("");
    } catch {
      setStatus({ kind: "error", message: "the site could not reach the server; try again in a minute" });
    }
  };

  return (
    <>
      <Button
        variant="outline"
        onClick={open}
        aria-label={context ? `${label} for ${context}` : label}
      >
        {label}
      </Button>

      <dialog ref={dialog} className="report-dialog" aria-labelledby="report-title">
        <form className="report-form" onSubmit={submit}>
          <header className="report-head">
            <h2 id="report-title">Report a correction</h2>
            <button type="button" className="icon-btn" onClick={() => dialog.current?.close()}>
              <CloseIcon />
              <span className="sr-only">Close</span>
            </button>
          </header>

          {status.kind === "done" ? (
            <div className="report-thanks">
              <p>Thank you. It is in the queue{status.id ? ` as ${status.id}` : ""} and will be read shortly.</p>
              <p className="muted small">
                If it needs evidence a maintainer can act on, the{" "}
                <External href={github}>prefilled GitHub form</External> is the place for logs and screenshots.
              </p>
              <Button variant="outline" onClick={() => dialog.current?.close()}>
                Close
              </Button>
            </div>
          ) : (
            <>
              <label className="report-field">
                <span>What is wrong</span>
                <select value={reason} onChange={(event) => setReason(event.target.value)}>
                  {REASONS.map(([value, name]) => (
                    <option key={value} value={value}>
                      {name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="report-field">
                <span>
                  Details <span className="muted">optional</span>
                </span>
                <textarea
                  value={text}
                  onChange={(event) => setText(event.target.value)}
                  rows={4}
                  maxLength={2000}
                  placeholder="What you saw, and where. A build, a GPU or an issue number helps."
                />
              </label>

              {status.kind === "error" && (
                <p className="report-error" role="alert">
                  {status.message}
                </p>
              )}

              <footer className="report-foot">
                <Button type="submit" loading={status.kind === "sending"}>
                  Send report
                </Button>
                <span className="muted small">
                  Goes to the operator, not GitHub. <External href={github}>Open an issue instead</External>.
                </span>
              </footer>
            </>
          )}
        </form>
      </dialog>
    </>
  );
}
