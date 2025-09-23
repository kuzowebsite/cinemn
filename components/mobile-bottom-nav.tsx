import { Home, Search, Bookmark, User } from "lucide-react"

export function MobileBottomNav() {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border md:hidden z-50">
      <div className="flex items-center justify-around py-2">
        <button className="flex flex-col items-center gap-1 p-2 text-primary">
          <Home className="w-5 h-5" />
          <span className="text-xs">Нүүр</span>
        </button>
        <button className="flex flex-col items-center gap-1 p-2 text-muted-foreground hover:text-primary transition-colors">
          <Search className="w-5 h-5" />
          <span className="text-xs">Хайх</span>
        </button>
        <button className="flex flex-col items-center gap-1 p-2 text-muted-foreground hover:text-primary transition-colors">
          <Bookmark className="w-5 h-5" />
          <span className="text-xs">Хадгалсан</span>
        </button>
        <button className="flex flex-col items-center gap-1 p-2 text-muted-foreground hover:text-primary transition-colors">
          <User className="w-5 h-5" />
          <span className="text-xs">Профайл</span>
        </button>
      </div>
    </div>
  )
}
