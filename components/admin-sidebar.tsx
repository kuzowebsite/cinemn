"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Film, Plus, List, BarChart3, Menu, X, Users } from "lucide-react"

interface AdminSidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export function AdminSidebar({ activeTab, onTabChange }: AdminSidebarProps) {
  const [isOpen, setIsOpen] = useState(false)

  const menuItems = [
    { id: "movies", label: "Кинонууд", icon: List },
    { id: "add-movie", label: "Кино нэмэх", icon: Plus },
    { id: "user-management", label: "Хэрэглэгч удирдлага", icon: Users },
    { id: "stats", label: "Статистик", icon: BarChart3 },
  ]

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="outline"
        size="sm"
        className="md:hidden fixed top-4 left-4 z-50 bg-transparent"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </Button>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-full w-64 bg-background border-r transition-transform duration-300 ease-in-out md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="p-6">
          <div className="flex items-center gap-2 mb-8">
            <Film className="h-6 w-6" />
            <h2 className="text-lg font-semibold">Админ цэс</h2>
          </div>

          <nav className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon
              return (
                <Button
                  key={item.id}
                  variant={activeTab === item.id ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => {
                    onTabChange(item.id)
                    setIsOpen(false)
                  }}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {item.label}
                </Button>
              )
            })}
          </nav>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isOpen && <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setIsOpen(false)} />}
    </>
  )
}
