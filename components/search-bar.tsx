"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { debouncedSearchSuggestions, trackSearch } from "@/lib/search-service"

interface SearchBarProps {
  placeholder?: string
  className?: string
  onSearch?: (query: string) => void
  showButton?: boolean
  autoFocus?: boolean
}

export function SearchBar({
  placeholder = "Search...",
  className = "",
  onSearch,
  showButton = false,
  autoFocus = false,
}: SearchBarProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [suggestions, setSuggestions] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  useEffect(() => {
    if (query.length > 1) {
      debouncedSearchSuggestions(query).then(setSuggestions)
    } else {
      setSuggestions([])
    }
  }, [query])

  const handleSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) return

    // Track the search query
    trackSearch(searchQuery)

    // Call the onSearch prop if provided
    if (onSearch) {
      onSearch(searchQuery)
    } else {
      // Otherwise, navigate to the search page
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
    }

    // Close the command dialog if open
    setOpen(false)
  }

  return (
    <>
      <div className={`relative flex items-center ${className}`}>
        <div className="relative w-full">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            ref={inputRef}
            type="search"
            placeholder={placeholder}
            className={`w-full pl-9 ${showButton ? "rounded-r-none" : ""}`}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSearch(query)
              }
              // Open suggestions on arrow down
              if (e.key === "ArrowDown" && suggestions.length > 0) {
                setOpen(true)
              }
            }}
            onClick={() => {
              if (query.length > 1 && suggestions.length > 0) {
                setOpen(true)
              }
            }}
            autoFocus={autoFocus}
          />
        </div>
        {showButton && (
          <Button type="submit" className="rounded-l-none" onClick={() => handleSearch(query)}>
            Search
          </Button>
        )}
      </div>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search..." value={query} onValueChange={setQuery} />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Suggestions">
            {suggestions.map((suggestion) => (
              <CommandItem
                key={suggestion}
                onSelect={() => {
                  setQuery(suggestion)
                  handleSearch(suggestion)
                }}
              >
                <Search className="mr-2 h-4 w-4" />
                {suggestion}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}
