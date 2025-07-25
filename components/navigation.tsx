"use client"

import Link from "next/link"
import { Home, Search, BarChart3, Menu, X, Music } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SearchWrapper } from "@/components/search-wrapper"
import { cn } from "@/lib/utils"
import { useState } from "react"

interface NavigationProps {
  className?: string
}

export function Navigation({ className }: NavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const navigation = [
    { name: "Home", href: "/", icon: Home },
    { name: "Search", href: "/search", icon: Search },
    { name: "Analytics", href: "/analytics", icon: BarChart3 },
  ]

  return (
    <nav
      className={cn(
        "sticky top-0 z-50 border-b bg-background/95 backdrop-blur-sm",
        className,
      )}>
      <div className="container mx-auto px-4">
        <div className="flex h-12 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-primary">
              <Music className="h-3 w-3 text-white" />
            </div>
            <span className="font-semibold gradient-text">Rock Mixes</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navigation.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button variant="ghost" size="sm" className="h-8 gap-1 text-sm">
                  <item.icon className="h-3 w-3" />
                  {item.name}
                </Button>
              </Link>
            ))}
          </div>

          {/* Desktop Search */}
          <div className="hidden md:block">
            <SearchWrapper className="w-48" placeholder="Search..." />
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-border/40 bg-background/95 backdrop-blur-md">
            <div className="py-4 space-y-4">
              {/* Mobile Search */}
              <div className="px-2">
                <SearchWrapper className="w-full" placeholder="Search..." />
              </div>

              {/* Mobile Navigation Links */}
              <div className="flex flex-col space-y-1 px-2">
                {navigation.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}>
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-3 hover:bg-primary/10 hover:text-primary">
                      <item.icon className="h-4 w-4" />
                      {item.name}
                    </Button>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
