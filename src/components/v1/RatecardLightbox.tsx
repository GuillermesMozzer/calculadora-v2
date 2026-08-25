import { useEffect, useMemo, useRef, useState } from "react";
import { Download, Pencil, Plus, Search, Upload, X } from "lucide-react";
import {
  blankRow,
  cloneRatecard,
  getRatecard,
  listRatecards,
  type RatecardDef,
  type RatecardRow,
  saveRatecard,
} from "@/lib/v1/ratecard-catalog";
import {
  exportRatecardCsv,
  exportRatecardPdf,
  exportRatecardXlsx,
  parseRatecardFile,
} from "@/lib/v1/ratecard-io";
import {
  formatCell,
  isCellFilled,
  parseCell,
  type RateCell,
  V1_SENIORITIES,
  V1_SENIORITY_IDS,
} from "@/lib/v1/seniority";
import { cn } from "@/lib/cn";

type Props = {
  open: boolean;
  currentTableId: string;
  onClose: () => void;
  onSaved: (tableId: string, highlightProfile?: string) => void;
};

export function RatecardLightbox({ open, currentTableId, onClose, onSaved }: Props) {
  const [tables, setTables] = useState(listRatecards);
  const [selectedId, setSelectedId] = useState(currentTableId);
  const [query, setQuery] = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<RatecardDef | null>(null);
  const [error, setError] = useState("");
  const [highlight, setHighlight] = useState("");
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [exportOpen, setExportOpen] = useState(false);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);

  const selected = tables.find((t) => t.id === selectedId) ?? tables[0];
  const view = draft ?? selected;

  useEffect(() => {
    if (!open) return;
    const next = listRatecards();
    setTables(next);
    setSelectedId(currentTableId);
    setDraft(null);
    setEditing(false);
    setError("");
    setCreating(false);
    setQuery("");
    setHighlight("");
  }, [open, currentTableId]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) setPickerOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return tables;
    return tables.filter((t) => t.name.toLowerCase().includes(q));
  }, [query, tables]);

  function loadTable(id: string) {
    const table = getRatecard(id) ?? listRatecards()[0];
    setSelectedId(table.id);
    setDraft(null);
    setEditing(false);
    setError("");
    setQuery(table.name);
    setPickerOpen(false);
    setHighlight("");
  }

  function startEdit() {
    if (!view) return;
    setDraft(cloneRatecard(view));
    setEditing(true);
    setError("");
  }

  function updateRow(index: number, patch: Partial<RatecardRow> | { rates: Record<string, RateCell> }) {
    if (!draft) return;
    const rows = draft.rows.map((row, i) => (i === index ? { ...row, ...patch } : row));
    setDraft({ ...draft, rows });
  }

  function updateCell(index: number, sen: (typeof V1_SENIORITY_IDS)[number], raw: string) {
    if (!draft) return;
    const row = draft.rows[index];
    updateRow(index, { rates: { ...row.rates, [sen]: parseCell(raw) } });
  }

  function addRow() {
    if (!draft) startEdit();
    setDraft((prev) => {
      const base = prev ?? cloneRatecard(view);
      return { ...base, rows: [...base.rows, blankRow()] };
    });
    setEditing(true);
  }

  function validate(table: RatecardDef): string | null {
    const named = table.rows.filter((r) => r.profile.trim() || V1_SENIORITY_IDS.some((id) => isCellFilled(r.rates[id])));
    if (!named.length) return "A tabela precisa de ao menos uma competência.";
    for (const row of named) {
      if (!row.profile.trim()) return "Toda competência precisa de um nome.";
      for (const id of V1_SENIORITY_IDS) {
        if (!isCellFilled(row.rates[id])) {
          return `Preencha todos os níveis de senioridade em “${row.profile.trim() || "nova competência"}”.`;
        }
      }
    }
    return null;
  }

  function handleSave() {
    const table = draft ?? view;
    const msg = validate(table);
    if (msg) {
      setError(msg);
      setEditing(true);
      setDraft(cloneRatecard(table));
      return;
    }
    const previous = getRatecard(table.id);
    const previousNames = new Set((previous?.rows ?? []).map((r) => r.profile));
    const saved = saveRatecard({
      ...table,
      rows: table.rows.filter((r) => r.profile.trim()),
    });
    const added = saved.rows.find((r) => !previousNames.has(r.profile));
    setTables(listRatecards());
    setSelectedId(saved.id);
    setDraft(null);
    setEditing(false);
    setError("");
    setHighlight(added?.profile ?? "");
    onSaved(saved.id, added?.profile);
  }

  async function applyFile(file: File, asNew = false) {
    try {
      const rows = await parseRatecardFile(file);
      if (!rows.length) {
        setError("Não foi possível ler competências no arquivo.");
        return;
      }
      if (asNew) {
        if (!newName.trim()) {
          setError("Informe um nome para a nova tabela antes de importar.");
          return;
        }
        const created: RatecardDef = {
          id: `custom_${Date.now()}`,
          name: newName.trim(),
          builtin: false,
          kind: view.kind,
          rows,
        };
        setDraft(created);
        setSelectedId(created.id);
        setEditing(true);
        setCreating(false);
        setNewName("");
        setError(validate(created) ?? "");
        return;
      }
      const next = { ...(draft ?? cloneRatecard(view)), rows };
      setDraft(next);
      setEditing(true);
      setError(validate(next) ?? "");
    } catch {
      setError("Falha ao ler o arquivo. Use Excel (.xlsx) ou CSV.");
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) void applyFile(file, creating);
  }

  function createBlank() {
    if (!newName.trim()) {
      setError("Informe o nome da nova tabela.");
      return;
    }
    const created: RatecardDef = {
      id: `custom_${Date.now()}`,
      name: newName.trim(),
      builtin: false,
      kind: "hourly",
      rows: [blankRow()],
    };
    setDraft(created);
    setSelectedId(created.id);
    setEditing(true);
    setCreating(false);
    setNewName("");
    setError("");
  }

  function createCopy() {
    if (!newName.trim()) {
      setError("Informe o nome da nova tabela.");
      return;
    }
    const created: RatecardDef = {
      ...cloneRatecard(view),
      id: `custom_${Date.now()}`,
      name: newName.trim(),
      builtin: false,
    };
    setDraft(created);
    setSelectedId(created.id);
    setEditing(true);
    setCreating(false);
    setNewName("");
    setError("");
  }

  if (!open || !view) return null;

  const incomplete = new Set(
    view.rows.flatMap((row, i) => {
      const missing =
        (!row.profile.trim() && V1_SENIORITY_IDS.some((id) => isCellFilled(row.rates[id]))) ||
        (row.profile.trim() && V1_SENIORITY_IDS.some((id) => !isCellFilled(row.rates[id])));
      return missing ? [i] : [];
    }),
  );

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 p-3 backdrop-blur-sm">
      <div
        className="glass flex max-h-[92vh] w-full max-w-[1200px] flex-col overflow-hidden rounded-3xl shadow-glow"
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
      >
        <header className="flex flex-wrap items-start justify-between gap-3 border-b border-border/10 px-4 py-4 sm:px-5">
          <div className="min-w-[220px] flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-taking">Ratecard</p>
            <div ref={pickerRef} className="relative mt-2">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted/80" />
              <input
                value={pickerOpen ? query : view.name}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setPickerOpen(true);
                }}
                onFocus={() => {
                  setQuery("");
                  setPickerOpen(true);
                }}
                placeholder="Buscar ratecard…"
                className="w-full rounded-xl border border-border/15 bg-surface-overlay py-2.5 pl-10 pr-3 text-sm outline-none focus:border-taking/50"
              />
              {pickerOpen && (
                <ul className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-xl border border-border/15 bg-surface-raised shadow-2xl">
                  {filtered.map((t) => (
                    <li key={t.id}>
                      <button
                        type="button"
                        className={cn(
                          "w-full px-3 py-2 text-left text-sm hover:bg-taking-muted",
                          t.id === selectedId && "text-taking",
                        )}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => loadTable(t.id)}
                      >
                        {t.name}
                      </button>
                    </li>
                  ))}
                  {filtered.length === 0 && (
                    <li className="px-3 py-2 text-sm text-muted">Nenhuma tabela encontrada.</li>
                  )}
                </ul>
              )}
            </div>
            <p className="mt-1.5 text-[11px] text-muted">
              {view.kind === "hourly" ? "Valores em R$/hora" : "Valores em R$ (salário CLT)"} · arraste um Excel/CSV para
              atualizar
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setCreating((v) => !v);
                setError("");
              }}
              className="inline-flex items-center gap-1.5 rounded-xl border border-border/15 px-3 py-2 text-xs font-medium hover:border-taking/40 hover:text-taking"
            >
              <Plus className="h-3.5 w-3.5" />
              Nova tabela
            </button>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="inline-flex items-center gap-1.5 rounded-xl border border-border/15 px-3 py-2 text-xs font-medium hover:border-taking/40 hover:text-taking"
            >
              <Upload className="h-3.5 w-3.5" />
              Importar
            </button>
            <div className="relative">
              <button
                type="button"
                onClick={() => setExportOpen((v) => !v)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-border/15 px-3 py-2 text-xs font-medium hover:border-taking/40 hover:text-taking"
              >
                <Download className="h-3.5 w-3.5" />
                Exportar
              </button>
              {exportOpen && (
                <div className="absolute right-0 z-20 mt-1 w-36 overflow-hidden rounded-xl border border-border/15 bg-surface-raised shadow-2xl">
                  {[
                    { id: "xlsx", label: "Excel", fn: () => exportRatecardXlsx(view) },
                    { id: "pdf", label: "PDF", fn: () => exportRatecardPdf(view) },
                    { id: "csv", label: "CSV", fn: () => exportRatecardCsv(view) },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      className="block w-full px-3 py-2 text-left text-sm hover:bg-taking-muted"
                      onClick={() => {
                        item.fn();
                        setExportOpen(false);
                      }}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={startEdit}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold",
                editing
                  ? "border-taking/40 bg-taking-muted text-taking"
                  : "border-border/15 hover:border-taking/40 hover:text-taking",
              )}
            >
              <Pencil className="h-3.5 w-3.5" />
              Editar
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="rounded-xl bg-taking px-3 py-2 text-xs font-semibold text-white hover:bg-taking-hover"
            >
              Salvar
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-border/15 p-2 text-muted hover:text-foreground"
              title="Fechar"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </header>

        {creating && (
          <div className="border-b border-border/10 bg-taking-muted/40 px-4 py-3 sm:px-5">
            <p className="text-xs font-medium text-foreground/90">Nova tabela de ratecard</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Nome da tabela"
                className="min-w-[180px] flex-1 rounded-xl border border-border/15 bg-surface-overlay px-3 py-2 text-sm outline-none focus:border-taking/50"
              />
              <button
                type="button"
                onClick={createBlank}
                className="rounded-xl border border-border/15 px-3 py-2 text-xs font-medium hover:border-taking/40"
              >
                Em branco
              </button>
              <button
                type="button"
                onClick={createCopy}
                className="rounded-xl border border-border/15 px-3 py-2 text-xs font-medium hover:border-taking/40"
              >
                Copiar atual
              </button>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="rounded-xl border border-border/15 px-3 py-2 text-xs font-medium hover:border-taking/40"
              >
                Importar arquivo
              </button>
            </div>
          </div>
        )}

        {error && <p className="px-4 pt-3 text-xs text-red-500 sm:px-5">{error}</p>}

        <div
          className={cn(
            "relative min-h-0 flex-1 overflow-auto px-4 py-3 sm:px-5",
            dragging && "ring-2 ring-inset ring-taking",
          )}
        >
          {dragging && (
            <div className="pointer-events-none absolute inset-3 z-10 flex items-center justify-center rounded-2xl border-2 border-dashed border-taking bg-taking-muted/80 text-sm font-medium text-taking">
              Solte o Excel ou CSV para atualizar a tabela
            </div>
          )}
          <table className="w-full min-w-[920px] border-collapse text-xs">
            <thead>
              <tr className="text-left text-[10px] uppercase tracking-wider text-taking">
                <th className="sticky left-0 z-10 bg-surface-raised px-2 py-2">Competência técnica</th>
                {V1_SENIORITIES.map((s) => (
                  <th key={s.id} className="px-2 py-2">
                    {s.short}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {view.rows.map((row, index) => {
                const isNew = highlight && row.profile === highlight;
                const rowBad = incomplete.has(index);
                return (
                  <tr
                    key={`${row.profile}-${index}`}
                    className={cn(
                      "border-t border-border/10",
                      isNew && "bg-taking-muted",
                      rowBad && !isNew && "bg-red-500/5",
                    )}
                  >
                    <td className="sticky left-0 z-10 bg-inherit px-2 py-1.5">
                      {editing ? (
                        <input
                          value={row.profile}
                          onChange={(e) => updateRow(index, { profile: e.target.value })}
                          placeholder="Nova competência"
                          className={cn(
                            "w-full min-w-[160px] rounded-lg border bg-surface-overlay px-2 py-1.5 text-xs outline-none",
                            !row.profile.trim() && rowBad
                              ? "border-red-500/60"
                              : "border-border/15 focus:border-taking/50",
                          )}
                        />
                      ) : (
                        <span className={cn("font-medium", isNew && "text-taking")}>{row.profile}</span>
                      )}
                    </td>
                    {V1_SENIORITY_IDS.map((id) => {
                      const cell = row.rates[id];
                      const empty = !isCellFilled(cell);
                      return (
                        <td key={id} className="px-2 py-1.5">
                          {editing ? (
                            <input
                              value={formatCell(cell)}
                              onChange={(e) => updateCell(index, id, e.target.value)}
                              className={cn(
                                "mono-num w-full min-w-[72px] rounded-lg border bg-surface-overlay px-2 py-1.5 text-xs outline-none",
                                empty ? "border-red-500/70 bg-red-500/10" : "border-border/15 focus:border-taking/50",
                              )}
                            />
                          ) : (
                            <span className={cn("mono-num", empty && "text-red-500")}>
                              {formatCell(cell) || "—"}
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
          {editing && (
            <button
              type="button"
              onClick={addRow}
              className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-taking hover:underline"
            >
              <Plus className="h-3.5 w-3.5" />
              Adicionar competência
            </button>
          )}
        </div>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept=".xlsx,.xls,.csv,text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void applyFile(file, creating);
          e.target.value = "";
        }}
      />
    </div>
  );
}
