import { Search, Bell, User } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="flex items-center justify-between px-6 md:px-12 py-4">
        <div className="flex items-center gap-8">
          <h1 className="text-2xl font-bold text-primary">CineMN</h1>
          <nav className="hidden md:flex items-center gap-6">
            <a href="#" className="text-foreground hover:text-primary transition-colors">
              Нүүр
            </a>
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
              Кино
            </a>
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
              Цуврал
            </a>
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
              Миний жагсаалт
            </a>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon">
            <Search className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <Bell className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <User className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </header>
  )
}
