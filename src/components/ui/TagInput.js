"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Hash, X, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

// Tag picker with autocomplete against the existing `tags` table. Value is
// an array of tag names; the caller passes `value.join(",")` to attachTags.
// Typing (or a leading "#") opens a list of matching known tags so the
// user picks a real one instead of inventing a near-duplicate.
export function TagInput({ value = [], onChange, max = 5, placeholder = "اكتب # أو اسم وسم..." }) {
  const [query, setQuery] = useState("");
  const [known, setKnown] = useState([]);
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const wrapRef = useRef(null);

  useEffect(() => {
    let active = true;
    const supabase = createClient();
    supabase
      .from("tags")
      .select("name, slug, usage_count")
      .order("usage_count", { ascending: false })
      .limit(300)
      .then(({ data }) => {
        if (active) setKnown(data ?? []);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    function onDocClick(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const q = query.replace(/^#/, "").trim().toLowerCase();

  const matches = useMemo(() => {
    const selected = new Set(value.map((v) => v.toLowerCase()));
    return known
      .filter((t) => !selected.has(t.name.toLowerCase()))
      .filter((t) => (q ? t.name.toLowerCase().includes(q) : true))
      .slice(0, 8);
  }, [known, value, q]);

  const exactExists = known.some((t) => t.name.toLowerCase() === q);
  const canCreate = q.length >= 2 && !exactExists && !value.some((v) => v.toLowerCase() === q);

  function addTag(name) {
    const clean = name.replace(/^#/, "").trim();
    if (!clean || value.length >= max) return;
    if (value.some((v) => v.toLowerCase() === clean.toLowerCase())) {
      setQuery("");
      return;
    }
    onChange([...value, clean]);
    setQuery("");
    setHighlight(0);
    setOpen(false);
  }

  function removeTag(name) {
    onChange(value.filter((t) => t !== name));
  }

  const options = [...matches.map((m) => ({ type: "existing", tag: m })), ...(canCreate ? [{ type: "create" }] : [])];

  function onKeyDown(e) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setHighlight((h) => Math.min(h + 1, options.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const picked = options[highlight];
      if (picked?.type === "existing") addTag(picked.tag.name);
      else if (q) addTag(q);
    } else if (e.key === "Backspace" && !query && value.length) {
      removeTag(value[value.length - 1]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div className="tag-input" ref={wrapRef}>
      <div className="tag-input__control" onClick={() => setOpen(true)}>
        {value.map((tag) => (
          <span key={tag} className="tag-input__chip">
            <span className="ltr">#{tag}</span>
            <button type="button" aria-label={`إزالة ${tag}`} onClick={() => removeTag(tag)}>
              <X size={12} />
            </button>
          </span>
        ))}
        {value.length < max ? (
          <input
            type="text"
            className="tag-input__field ltr"
            value={query}
            placeholder={value.length ? "" : placeholder}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
              setHighlight(0);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={onKeyDown}
            aria-label="إضافة وسم"
          />
        ) : null}
      </div>

      {open && options.length > 0 ? (
        <div className="menu tag-input__menu">
          {matches.map((t, i) => (
            <button
              key={t.slug}
              type="button"
              className="menu__item"
              data-active={highlight === i}
              onMouseEnter={() => setHighlight(i)}
              onClick={() => addTag(t.name)}
            >
              <Hash size={14} />
              <span className="ltr" style={{ flex: 1 }}>
                {t.name}
              </span>
              <span style={{ color: "var(--color-text-muted)", fontSize: "var(--text-xs)" }}>{t.usage_count}</span>
            </button>
          ))}
          {canCreate ? (
            <button
              type="button"
              className="menu__item"
              data-active={highlight === matches.length}
              onMouseEnter={() => setHighlight(matches.length)}
              onClick={() => addTag(q)}
            >
              <Plus size={14} /> إنشاء وسم جديد «<span className="ltr">{q}</span>»
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
