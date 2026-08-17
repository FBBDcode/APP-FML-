import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { Calendar as CalendarIcon, Trash2, Plus, Info } from 'lucide-react';
import { format, isSameDay, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import { useIntegration } from '../hooks/useIntegration';
import { Link } from 'react-router-dom';

import { EmptyState } from '../components/ui/empty-state';

export function Agenda() {
  const { events, addEvent, deleteEvent } = useStore();
  const { config: calendarConfig } = useIntegration('calendar');
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [category, setCategory] = useState('Família');
  const [notes, setNotes] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date) return;
    
    addEvent({
      title,
      date: new Date(date).toISOString(),
      category,
      notes
    });
    
    setTitle('');
    setDate(format(new Date(), 'yyyy-MM-dd'));
    setCategory('Família');
    setNotes('');
    setOpen(false);
    toast.success('Evento agendado com sucesso!');
  };

  const categories = ['Família', 'Casa', 'Escola', 'Trabalho', 'Saúde', 'Compromissos', 'Viagens', 'Outros'];

  // Group events by upcoming and past
  const sortedEvents = [...events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  
  const upcomingEvents = sortedEvents.filter(e => new Date(e.date) >= now);
  const pastEvents = sortedEvents.filter(e => new Date(e.date) < now).reverse().slice(0, 5); // Just show last 5

  const EventList = ({ title, items }: { title: string, items: typeof events }) => {
    if (items.length === 0) return null;
    return (
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">{title}</h3>
        <div className="border rounded-md divide-y overflow-hidden bg-card">
          {items.map(event => (
            <div key={event.id} className="group relative flex border-l-4 border-l-primary hover:bg-muted/50 transition-colors">
              <div className="flex-1 p-4 flex justify-between items-start gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-lg truncate">{event.title}</h4>
                    {event.source === 'google' && (
                      <Badge variant="secondary" className="text-[10px] bg-blue-500/10 text-blue-600 dark:text-blue-400 border-none font-normal h-5">Google</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                    <CalendarIcon className="h-3.5 w-3.5" />
                    {format(new Date(event.date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Badge variant="secondary" className="font-normal">
                      {event.category}
                    </Badge>
                  </div>
                  {event.notes && <p className="text-sm mt-2 text-muted-foreground line-clamp-2">{event.notes}</p>}
                </div>
                <Button variant="ghost" size="icon-sm" className="text-destructive opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" onClick={() => deleteEvent(event.id)}>
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Excluir evento</span>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Agenda</h1>
          <p className="text-muted-foreground mt-1">Compromissos e eventos da família.</p>
        </div>
        
        <div className="flex gap-2 items-center">
          {calendarConfig.status === 'connected' ? (
            <Badge variant="outline" className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 py-1.5 hidden sm:flex">
              <CalendarIcon className="h-3.5 w-3.5 mr-1" /> Google Agenda Conectado
            </Badge>
          ) : (
            <Button variant="outline" size="sm" className="hidden sm:flex" nativeButton={false} render={<Link to="/configuracoes/integracoes" />}>
              <CalendarIcon className="h-4 w-4 mr-2" /> Conectar Agenda
            </Button>
          )}

          <Dialog open={open} onOpenChange={(val) => {
            setOpen(val);
            if (!val) {
            setTitle('');
            setDate(format(new Date(), 'yyyy-MM-dd'));
            setCategory('Família');
            setNotes('');
          }
        }}>
          <DialogTrigger render={<Button />}>
            <Plus className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Novo Evento</span>
            <span className="inline sm:hidden">Novo</span>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Agendar Evento</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título</Label>
                <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="Ex: Reunião Escolar" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Data</Label>
                  <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Categoria</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(c => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">Observações</Label>
                <Input id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Opcional..." />
              </div>
              <Button type="submit" className="w-full">Salvar Evento</Button>
            </form>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      <div className="space-y-8">
        {upcomingEvents.length === 0 && pastEvents.length === 0 ? (
          <EmptyState 
            icon={CalendarIcon}
            title="Nenhum evento agendado"
            description="Adicione compromissos à agenda da família."
          />
        ) : (
          <>
            <EventList title="Próximos Eventos" items={upcomingEvents} />
            <EventList title="Eventos Passados" items={pastEvents} />
          </>
        )}
      </div>
    </div>
  );
}
