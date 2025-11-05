"use client"

import { Button } from "@/components/ui/button"
import { Sun, Moon } from "lucide-react"
import Link from "next/link"
import { useTheme } from "next-themes"
import { usePathname } from "next/navigation"
import { Badge } from "@/components/ui/badge"

interface NavbarProps {
  language: "es" | "en"
  onLanguageChange: (lang: "es" | "en") => void
  showApiButton?: boolean
}

const translations = {
  es: {
    home: "Home",
    api: "API",
    soon: "Próximamente",
  },
  en: {
    home: "Home",
    api: "API",
    soon: "Soon",
  },
}

export function Navbar({ language, onLanguageChange, showApiButton = true }: NavbarProps) {
  const { theme, setTheme } = useTheme()
  const t = translations[language]
  const pathname = usePathname()

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="font-mono text-xl font-bold text-foreground hover:text-primary transition-colors">
              fakepay.ai
            </Link>
          </div>

          <div className="hidden md:flex md:items-center md:gap-8">
            <Link
              href="/"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                pathname === "/" ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              {t.home}
            </Link>
            {showApiButton && (
              <div className="relative">
                <Badge
                  variant="secondary"
                  className="absolute -top-3 right-0 translate-x-1/2 z-10 text-[10px] px-1.5 py-0.5 pointer-events-none bg-primary text-primary-foreground hover:bg-primary"
                >
                  {t.soon}
                </Badge>
                <Link
                  href="/api-docs"
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    pathname === "/api-docs" ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {t.api}
                </Link>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={toggleTheme} className="h-9 w-9">
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>

            <div className="flex items-center gap-1 rounded-md bg-secondary p-1">
              <Button
                variant={language === "en" ? "default" : "ghost"}
                size="sm"
                onClick={() => onLanguageChange("en")}
                className="h-7 px-3 text-xs font-medium"
              >
                EN
              </Button>
              <Button
                variant={language === "es" ? "default" : "ghost"}
                size="sm"
                onClick={() => onLanguageChange("es")}
                className="h-7 px-3 text-xs font-medium"
              >
                ES
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
