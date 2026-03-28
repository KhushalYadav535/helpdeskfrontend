"use client"

import { useState, useRef, useEffect, useCallback, useMemo } from "react"
import { Search, X, Loader2, Ticket, Settings, BookOpen, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { API_URL, getHeaders } from "@/lib/api-helpers"

interface SearchResult {
  id: string
  title: string
  subtitle: string
  category: "tickets" | "settings" | "knowledge-base"
  url: string
}

const CATEGORY_CONFIG = {
  tickets: { label: "Tickets", icon: Ticket },
  settings: { label: "Settings", icon: Settings },
  "knowledge-base": { label: "Knowledge Base", icon: BookOpen },
} as const

type SearchApiResponse = {
  success: boolean
  data?: {
    tickets: SearchResult[]
    settings: SearchResult[]
    knowledgeBase: SearchResult[]
  }
}

function mergeApiResults(data: NonNullable<SearchApiResponse["data"]>): SearchResult[] {
  const out: SearchResult[] = []
  for (const t of data.tickets || []) {
    out.push({ ...t, category: "tickets" })
  }
  for (const s of data.settings || []) {
    out.push({ ...s, category: "settings" })
  }
  for (const k of data.knowledgeBase || []) {
    out.push({ ...k, category: "knowledge-base" })
  }
  return out
}

export function GlobalSearchBar() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const [isFocused, setIsFocused] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const flatResults = useMemo(() => results, [results])

  const groupedResults = useMemo(() => {
    const groups: Record<string, SearchResult[]> = {}
    for (const result of results) {
      if (!groups[result.category]) groups[result.category] = []
      if (groups[result.category].length < 3) {
        groups[result.category].push(result)
      }
    }
    return groups
  }, [results])

  const fullGroups = useMemo(() => {
    const groups: Record<string, SearchResult[]> = {}
    for (const result of results) {
      if (!groups[result.category]) groups[result.category] = []
      groups[result.category].push(result)
    }
    return groups
  }, [results])

  const performSearch = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setResults([])
      setIsOpen(false)
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch(`${API_URL}/search?q=${encodeURIComponent(searchQuery)}`, {
        headers: getHeaders(true),
      })
      const json: SearchApiResponse = await res.json()
      if (json.success && json.data) {
        setResults(mergeApiResults(json.data))
        setIsOpen(true)
      } else {
        setResults([])
        setIsOpen(true)
      }
      setHighlightedIndex(-1)
    } catch {
      setResults([])
      setIsOpen(true)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (query.length < 2) {
      setResults([])
      setIsOpen(false)
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    debounceRef.current = setTimeout(() => {
      performSearch(query)
    }, 300)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query, performSearch])

  useEffect(() => {
    if (!isOpen) return
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isOpen])

  const navigateTo = (url: string) => {
    window.location.href = url
    setIsOpen(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setQuery("")
      setIsOpen(false)
      inputRef.current?.blur()
      return
    }
    if (!isOpen || flatResults.length === 0) {
      if (e.key === "Enter" && query.length >= 2) {
        void performSearch(query)
      }
      return
    }

    if (e.key === "ArrowDown") {
      e.preventDefault()
      setHighlightedIndex((prev) => (prev + 1) % flatResults.length)
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setHighlightedIndex((prev) => (prev <= 0 ? flatResults.length - 1 : prev - 1))
    } else if (e.key === "Enter") {
      e.preventDefault()
      const idx = highlightedIndex >= 0 ? highlightedIndex : 0
      const result = flatResults[idx]
      if (result) navigateTo(result.url)
    }
  }

  const handleClear = () => {
    setQuery("")
    setResults([])
    setIsOpen(false)
    inputRef.current?.focus()
  }

  const highlightMatch = (text: string, q: string) => {
    if (!q || q.length < 2) return text
    const idx = text.toLowerCase().indexOf(q.toLowerCase())
    if (idx === -1) return text
    return (
      <>
        {text.slice(0, idx)}
        <span className="font-bold text-foreground">{text.slice(idx, idx + q.length)}</span>
        {text.slice(idx + q.length)}
      </>
    )
  }

  const renderSeeAll = (category: keyof typeof CATEGORY_CONFIG) => {
    const all = fullGroups[category] || []
    const shown = groupedResults[category] || []
    if (all.length <= 3 || shown.length >= all.length) return null
    const seeAllUrl =
      all[0]?.url ||
      (category === "knowledge-base" ? "/dashboard/customer/kb" : "/dashboard/agent/tickets")
    return (
      <button
        type="button"
        className="w-full text-left px-4 py-2 text-xs font-medium text-primary hover:bg-primary/5"
        onClick={() => navigateTo(seeAllUrl)}
      >
        See all in {CATEGORY_CONFIG[category].label} ({all.length})
      </button>
    )
  }

  const inputClassName = cn(
    "h-10 pl-10 pr-8 rounded-full bg-muted/50 border border-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:bg-background transition-all duration-200 w-full",
    isFocused ? "sm:w-[400px]" : "sm:w-[280px]",
  )

  return (
    <div className="relative flex-1 max-w-md w-full">
      {/* Always flex so mobile sheet (sm:hidden parent in TopNav) still shows the input */}
      <div className="relative w-full flex min-w-0">
        {isLoading ? (
          <Loader2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground animate-spin z-10" />
        ) : (
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
        )}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            setIsFocused(true)
            if (query.length >= 2) setIsOpen(true)
          }}
          onBlur={() => setIsFocused(false)}
          placeholder="Search tickets, settings..."
          role="combobox"
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-label="Search RezolvX"
          aria-activedescendant={highlightedIndex >= 0 ? `search-result-${highlightedIndex}` : undefined}
          className={inputClassName}
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors z-10"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {isOpen && (
        <div
          ref={dropdownRef}
          role="listbox"
          className={cn(
            "absolute left-0 top-full mt-2 bg-card border border-border rounded-xl shadow-lg z-50 overflow-hidden w-full sm:w-auto min-w-[min(100%,280px)]",
            isFocused ? "sm:w-[400px]" : "sm:w-[280px]",
            "animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 duration-150",
          )}
          style={{ maxHeight: "480px", overflowY: "auto" }}
        >
          {flatResults.length === 0 && !isLoading ? (
            <div className="px-4 py-6 text-center">
              <p className="text-sm text-muted-foreground">
                No results found for &quot;<span className="font-medium text-foreground">{query}</span>&quot;.
              </p>
              <p className="text-xs text-muted-foreground/60 mt-1">Try a different keyword.</p>
            </div>
          ) : (
            (() => {
              let flatIndex = 0
              return (["tickets", "settings", "knowledge-base"] as const).map((category) => {
              const items = groupedResults[category]
              if (!items || items.length === 0) return null
              const config = CATEGORY_CONFIG[category]
              const CategoryIcon = config.icon

              return (
                <div key={category}>
                  <div className="px-4 py-2 flex items-center gap-2">
                    <CategoryIcon className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {config.label}
                    </span>
                  </div>
                  {items.map((result) => {
                    const currentIndex = flatIndex++
                    const isHighlighted = currentIndex === highlightedIndex || (highlightedIndex < 0 && currentIndex === 0)
                    const ResultIcon = config.icon
                    return (
                      <div
                        key={result.id + currentIndex}
                        id={`search-result-${currentIndex}`}
                        role="option"
                        aria-selected={highlightedIndex === currentIndex || (highlightedIndex < 0 && currentIndex === 0)}
                        onMouseEnter={() => setHighlightedIndex(currentIndex)}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => navigateTo(result.url)}
                        className={cn(
                          "flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors",
                          isHighlighted ? "bg-primary/10" : "hover:bg-muted/50",
                        )}
                      >
                        <ResultIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm truncate">{highlightMatch(result.title, query)}</p>
                          <p className="text-xs text-muted-foreground truncate">{result.subtitle}</p>
                        </div>
                        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/40 flex-shrink-0" />
                      </div>
                    )
                  })}
                  {renderSeeAll(category)}
                  <div className="border-b border-border/40 last:border-b-0" />
                </div>
              )
            })
            })()
          )}
        </div>
      )}
    </div>
  )
}
