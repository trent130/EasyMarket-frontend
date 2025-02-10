"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/útils"
import { Button } from "@/components/ui/button"
import { Home, Settings, Users, BarChart3, Files, Calendar, MessagesSquare, Menu } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  isSidebarOpen: boolean
  onToggleSidebar: (isOpen: boolean) => void
}

const navigationLinks = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/analytics", icon: BarChart3, label: "Analytics" },
  { href: "/customers", icon: Users, label: "Customers" },
  { href: "/addProduct", icon: Users, label: "Product add" },
  { href: "/my-product", icon: Files, label: "My Products" },
  { href: "/messages", icon: MessagesSquare, label: "Messages" },
  { href: "/calendar", icon: Calendar, label: "Calendar" },
]

const settingsLinks = [{ href: "/settings", icon: Settings, label: "Settings" }]

const SidebarHeader = () => (
  <div className="flex items-center px-4 py-6">
    <BarChart3 className="h-6 w-6 text-primary" />
    <h2 className="ml-3 text-xl font-semibold tracking-tight">Dashboard</h2>
  </div>
)

const NavigationLinks = ({ links, className }: { links: typeof navigationLinks; className?: string }) => {
  const pathname = usePathname()

  return (
    <nav className={cn("space-y-1", className)}>
      {links.map((link) => {
        const Icon = link.icon
        const isActive = pathname === link.href

        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors",
              isActive ? "bg-gray-300 text-black" : "text-black hover:bg-gray-700 hover:text-white",
            )}
          >
            <Icon className="mr-3 h-5 w-5" />
            {link.label}
          </Link>
        )
      })}
    </nav>
  )
}

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const media = window.matchMedia(query)
    setMatches(media.matches)
    const listener = () => setMatches(media.matches)
    media.addEventListener("change", listener)

    return () => media.removeEventListener("change", listener)
  }, [query])

  return matches
}

export function Sidebar({ className, isSidebarOpen, onToggleSidebar }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(isSidebarOpen)
  const isMediumScreen = useMediaQuery("(min-width: 768px) and (max-width: 1024px)")

  useEffect(() => {
    setIsOpen(isSidebarOpen)
  }, [isSidebarOpen])

  useEffect(() => {
    if (isMediumScreen) {
      setIsOpen(false)
      onToggleSidebar(false)
    }
  }, [isMediumScreen, onToggleSidebar])

  const toggleSidebar = () => {
    const newState = !isOpen
    setIsOpen(newState)
    onToggleSidebar(newState)
  }

  return (
    <div className={cn("relative h-screen bg-slate-600 sm:flex sm:flex-col sm:w-0 mt-6 sm:z-auto", className='')}>
      {/* Hamburger Menu for Mobile and Medium Screens */}
      <div className="absolute top-4 left-4 z-10 md:hidden">
        <Button variant="ghost" size="icon" onClick={toggleSidebar} className="p-2">
          <Menu className="h-6 w-6 text-white" />
        </Button>
      </div>

      {/* Sidebar */}
      <div
        className={cn(
          "absolute top-0 left-0 z-40 h-screen w-64 bg-white text-black transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full",
          "md:relative md:translate-x-0",
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <SidebarHeader />

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto py-4">
            <NavigationLinks links={navigationLinks} />
          </div>

          {/* Footer */}
          <div className="border-t border-gray-700 px-4 py-6">
            <h2 className="mb-2 text-lg font-semibold tracking-tight">Settings</h2>
            <NavigationLinks links={settingsLinks} className="mt-2" />
          </div>
        </div>
      </div>

      {/* Overlay for Mobile */}
      {isOpen && <div className="fixed inset-0 z-30 bg-black bg-opacity-50 md:hidden" onClick={toggleSidebar} />}
    </div>
  )
}

