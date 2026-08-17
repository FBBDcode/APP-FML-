import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { Home, Calendar, CheckSquare, ShoppingCart, DollarSign, Users, Menu, Utensils, BookOpen, FileText, MessageSquare, Image as ImageIcon, Settings } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '../ui/sheet';
import { Button } from '../ui/button';
import { useState } from 'react';
import { Notifications } from './Notifications';

const mainNavItems = [
  { path: '/', icon: Home, label: 'Hoje' },
  { path: '/agenda', icon: Calendar, label: 'Agenda' },
  { path: '/tarefas', icon: CheckSquare, label: 'Tarefas' },
  { path: '/compras', icon: ShoppingCart, label: 'Compras' },
];

const secondaryNavItems = [
  { path: '/mural', icon: MessageSquare, label: 'Mural' },
  { path: '/memorias', icon: ImageIcon, label: 'Memórias' },
  { path: '/refeicoes', icon: Utensils, label: 'Refeições' },
  { path: '/receitas', icon: BookOpen, label: 'Receitas' },
  { path: '/documentos', icon: FileText, label: 'Documentos' },
  { path: '/casa', icon: Home, label: 'Casa' },
  { path: '/contatos', icon: Users, label: 'Contatos' },
  { path: '/financeiro', icon: DollarSign, label: 'Financeiro' },
  { path: '/familia', icon: Users, label: 'Família' },
  { path: '/configuracoes/integracoes', icon: Settings, label: 'Integrações' },
];

export function AppLayout() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  const NavContent = ({ mobile = false }) => (
    <div className="flex flex-col gap-6">
      <div className="px-3">
        <h2 className="mb-2 px-4 text-xs font-semibold tracking-tight text-muted-foreground uppercase">
          Principal
        </h2>
        <div className="space-y-1">
          {mainNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => mobile && setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-md px-4 py-2.5 text-sm font-medium transition-colors min-h-[44px] ${
                  isActive 
                    ? 'bg-secondary text-foreground' 
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`
              }
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
        </div>
      </div>
      <div className="px-3">
        <h2 className="mb-2 px-4 text-xs font-semibold tracking-tight text-muted-foreground uppercase">
          Mais
        </h2>
        <div className="space-y-1">
          {secondaryNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => mobile && setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-md px-4 py-2.5 text-sm font-medium transition-colors min-h-[44px] ${
                  isActive 
                    ? 'bg-secondary text-foreground' 
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`
              }
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen flex-col bg-background md:flex-row">
      {/* Desktop Sidebar */}
      <aside className="hidden w-64 flex-col border-r bg-card md:flex">
        <div className="flex h-16 items-center justify-between border-b px-4">
          <h1 className="font-semibold text-lg flex items-center gap-2 pl-2">
            <Home className="h-5 w-5 text-primary" />
            Central da Família
          </h1>
          <Notifications />
        </div>
        <div className="flex-1 overflow-auto py-6">
          <NavContent />
        </div>
      </aside>

      {/* Mobile Header & Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden pb-16 md:pb-0">
        {/* Mobile Header */}
        <header className="flex h-14 items-center justify-between border-b bg-card px-4 md:hidden">
          <h1 className="font-semibold flex items-center gap-2">
            <Home className="h-5 w-5 text-primary" />
            Central da Família
          </h1>
          <div className="flex items-center gap-2">
            <Notifications />
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-muted/20 p-4 md:p-8">
          <div className="mx-auto max-w-5xl">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="fixed bottom-0 z-50 flex h-16 w-full items-center justify-around border-t bg-background md:hidden">
        {mainNavItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center gap-1 min-w-[64px] min-h-[44px] transition-colors ${
                isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </NavLink>
          );
        })}
        
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger render={<button className="flex flex-col items-center justify-center gap-1 min-w-[64px] min-h-[44px] text-muted-foreground hover:text-foreground transition-colors" />}>
            <Menu className="h-5 w-5" />
            <span className="text-[10px] font-medium">Mais</span>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[80vh] px-0 py-2">
            <SheetHeader className="border-b px-6 py-4 text-left">
              <SheetTitle className="flex items-center gap-2 text-lg">
                <Menu className="h-5 w-5 text-primary" />
                Mais Opções
              </SheetTitle>
            </SheetHeader>
            <div className="py-6 overflow-y-auto h-full pb-20">
              <NavContent mobile />
            </div>
          </SheetContent>
        </Sheet>
      </nav>
    </div>
  );
}
