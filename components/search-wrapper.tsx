"use client"

import { useRouter } from "next/navigation"
import { SearchBar } from "./search-bar"

interface SearchWrapperProps {
  className?: string
  placeholder?: string
}

export function SearchWrapper({ className, placeholder }: SearchWrapperProps) {
  const router = useRouter()

  const handleSearch = (query: string) => {
    router.push(`/search?q=${encodeURIComponent(query)}`)
  }

  return (
    <SearchBar
      className={className}
      placeholder={placeholder}
      onSearch={handleSearch}
    />
  )
}
