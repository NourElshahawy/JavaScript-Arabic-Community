"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function SearchBox() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
  }

  return (
    <form onSubmit={handleSubmit} className="input-icon-group app-header__search" role="search">
      <Search size={16} className="input-icon-group__icon" aria-hidden="true" />
      <input
        type="search"
        className="input"
        placeholder="ابحث عن سؤال، خبر، وسم..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        aria-label="بحث"
      />
    </form>
  );
}
