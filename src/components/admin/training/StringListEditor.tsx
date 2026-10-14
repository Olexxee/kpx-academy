import { useEffect, useRef, useState } from "react";
import {
  Plus,
  X,
  ArrowUp,
  ArrowDown,
  List as ListIcon,
  AlignLeft,
  Check,
} from "lucide-react";

interface Props {
  label: string;
  description?: string;
  placeholder?: string;
  values: string[];
  onChange: (values: string[]) => void;
  numbered?: boolean;
  maxItems?: number;
}

export function StringListEditor({
  label,
  description,
  placeholder = "Type and press Enter",
  values,
  onChange,
  numbered = false,
  maxItems,
}: Props) {
  const [draft, setDraft] = useState("");
  const [bulkMode, setBulkMode] = useState(false);
  const [bulkText, setBulkText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Entering bulk mode snapshots the current values as text.
  // Leaving without saving discards the snapshot.
  useEffect(() => {
    if (bulkMode) setBulkText(values.join("\n"));
    // Intentionally exclude `values` — we only want this when toggling mode.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bulkMode]);

  const addItem = () => {
    const raw = draft.trim();
    if (!raw) return;
    if (maxItems && values.length >= maxItems) return;

    // If user pasted multiline content into the single-line input,
    // split it into multiple items instead of one blob.
    const items = raw
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    onChange([...values, ...items]);
    setDraft("");
    inputRef.current?.focus();
  };

  const removeAt = (index: number) => {
    onChange(values.filter((_, i) => i !== index));
  };

  const move = (index: number, delta: number) => {
    const target = index + delta;
    if (target < 0 || target >= values.length) return;
    const next = [...values];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  const saveBulk = () => {
    const parsed = bulkText
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    onChange(parsed);
    setBulkMode(false);
  };

  const cancelBulk = () => {
    setBulkMode(false);
    setBulkText("");
  };

  return (
    <div>
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <label className="block text-sm font-medium text-slate-700">
            {label}
            {maxItems && (
              <span className="ml-2 text-xs font-normal text-slate-400">
                {values.length}/{maxItems}
              </span>
            )}
          </label>
          {description && (
            <p className="mt-0.5 text-xs text-slate-500">{description}</p>
          )}
        </div>

        <button
          type="button"
          onClick={() => (bulkMode ? cancelBulk() : setBulkMode(true))}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
          title={bulkMode ? "Back to list" : "Bulk edit as text"}
        >
          {bulkMode ? <ListIcon size={12} /> : <AlignLeft size={12} />}
          {bulkMode ? "List view" : "Bulk edit"}
        </button>
      </div>

      {bulkMode ? (
        <div className="space-y-2">
          <textarea
            value={bulkText}
            onChange={(e) => setBulkText(e.target.value)}
            rows={6}
            placeholder="One item per line"
            className="w-full resize-y rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 caret-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-100"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={cancelBulk}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={saveBulk}
              className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800"
            >
              <Check size={12} />
              Apply
            </button>
          </div>
        </div>
      ) : (
        <>
          {values.length > 0 && (
            <ul className="mb-3 space-y-1.5">
              {values.map((item, index) => (
                <li
                  key={`${index}-${item}`}
                  className="group flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 transition hover:border-slate-300"
                >
                  {numbered ? (
                    <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-900 text-[10px] font-semibold text-white">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  ) : (
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
                  )}

                  <span className="min-w-0 flex-1 truncate text-sm text-slate-800">
                    {item}
                  </span>

                  <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition group-hover:opacity-100">
                    <IconBtn
                      onClick={() => move(index, -1)}
                      disabled={index === 0}
                      title="Move up"
                    >
                      <ArrowUp size={12} />
                    </IconBtn>
                    <IconBtn
                      onClick={() => move(index, 1)}
                      disabled={index === values.length - 1}
                      title="Move down"
                    >
                      <ArrowDown size={12} />
                    </IconBtn>
                    <IconBtn
                      onClick={() => removeAt(index)}
                      title="Remove"
                      variant="danger"
                    >
                      <X size={12} />
                    </IconBtn>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addItem();
                }
                // Backspace on an empty input removes the last item — feels
                // like a chip input.
                if (e.key === "Backspace" && !draft && values.length > 0) {
                  removeAt(values.length - 1);
                }
              }}
              placeholder={placeholder}
              disabled={!!maxItems && values.length >= maxItems}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 caret-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-100 disabled:bg-slate-50"
            />
            <button
              type="button"
              onClick={addItem}
              disabled={
                !draft.trim() || (!!maxItems && values.length >= maxItems)
              }
              className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-slate-900 px-3 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Plus size={14} />
              Add
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function IconBtn({
  children,
  onClick,
  title,
  disabled,
  variant = "default",
}: {
  children: React.ReactNode;
  onClick: () => void;
  title: string;
  disabled?: boolean;
  variant?: "default" | "danger";
}) {
  const styles =
    variant === "danger"
      ? "text-slate-400 hover:bg-red-50 hover:text-red-600"
      : "text-slate-400 hover:bg-slate-100 hover:text-slate-700";
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      disabled={disabled}
      className={`inline-flex h-7 w-7 items-center justify-center rounded-md transition disabled:cursor-not-allowed disabled:opacity-30 ${styles}`}
    >
      {children}
    </button>
  );
}
