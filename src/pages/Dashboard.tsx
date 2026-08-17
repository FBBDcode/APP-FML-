import { useStore } from '../store/useStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Calendar, CheckSquare, AlertTriangle, ChevronRight, Plus, Clock, Info } from 'lucide-react';
import { format, isSameDay, isFuture } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';

export function Dashboard() {
  const { family, tasks, events, notifications } = useStore();
  const navigate = useNavigate();
  const today = new Date();
  const todayStr = format(today, "EEEE, d 'de' MMMM", { locale: ptBR });
  
  const hour = today.getHours();
  let greeting = 'Bom dia';
  if (hour >= 12 && hour < 18) greeting = 'Boa tarde';
  else if (hour >= 18) greeting = 'Boa noite';

  // Alerts
  const alerts = notifications
    .filter(n => !n.isRead && (n.priority === 'Importante' || n.priority === 'Urgente'))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 3);

  // Today's events and tasks
  const eventsToday = events.filter(e => isSameDay(new Date(e.date), today));
  const tasksToday = tasks.filter(t => t.dueDate && isSameDay(new Date(t.dueDate), today) && t.status !== 'completed');

  // Upcoming
  const upcomingEvents = events.filter(e => isFuture(new Date(e.date)) && !isSameDay(new Date(e.date), today)).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).slice(0, 3);
  const upcomingTasks = tasks.filter(t => t.status !== 'completed' && (!t.dueDate || (isFuture(new Date(t.dueDate)) && !isSameDay(new Date(t.dueDate), today)))).slice(0, 3);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{greeting}, {family.name}!</h1>
          <p className="text-muted-foreground capitalize mt-1">{todayStr}</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" nativeButton={false} render={<Link to="/tarefas" />}>
            <Plus className="w-4 h-4 mr-2"/> Nova Tarefa
          </Button>
          <Button size="sm" variant="secondary" nativeButton={false} render={<Link to="/agenda" />}>
            <Plus className="w-4 h-4 mr-2"/> Novo Evento
          </Button>
        </div>
      </div>

      {alerts.length > 0 && (
        <Card className="border-amber-500/50 bg-amber-500/5 dark:bg-amber-500/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center text-amber-600 dark:text-amber-500">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Atenção
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alerts.map(alert => (
                <div 
                  key={alert.id} 
                  className="flex items-center justify-between p-2 -mx-2 rounded-md hover:bg-amber-500/10 cursor-pointer transition-colors"
                  onClick={() => alert.linkTo && navigate(alert.linkTo)}
                >
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium">{alert.title}</p>
                    <p className="text-xs text-muted-foreground">{alert.description}</p>
                  </div>
                  {alert.linkTo && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Hoje */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            O que acontece hoje
          </h2>
          
          <Card>
            <CardContent>
              {eventsToday.length === 0 && tasksToday.length === 0 ? (
                <div className="text-center text-muted-foreground text-sm py-4">
                  Seu dia está livre! Nenhum evento ou tarefa para hoje.
                </div>
              ) : (
                <div className="divide-y">
                  {eventsToday.length > 0 && (
                    <div className="p-4 space-y-3">
                      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Eventos</h3>
                      {eventsToday.map(event => (
                        <div key={event.id} className="flex items-center gap-3">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{event.title}</p>
                            <p className="text-xs text-muted-foreground">{format(new Date(event.date), "HH:mm")}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {tasksToday.length > 0 && (
                    <div className="p-4 space-y-3">
                      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Tarefas</h3>
                      {tasksToday.map(task => (
                        <div key={task.id} className="flex items-center gap-3">
                          <CheckSquare className="w-4 h-4 text-muted-foreground" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{task.title}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Próximos */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Info className="h-5 w-5 text-muted-foreground" />
            Próximos dias
          </h2>
          
          <Card>
            <CardContent className="divide-y">
              <div className="py-4 first:pt-0 last:pb-0">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Na Agenda</h3>
                {upcomingEvents.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nenhum evento próximo.</p>
                ) : (
                  <div className="space-y-3">
                    {upcomingEvents.map(event => (
                      <div key={event.id} className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium truncate">{event.title}</p>
                        <Badge variant="outline" className="text-xs shrink-0">{format(new Date(event.date), "dd/MM")}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="py-4 first:pt-0 last:pb-0">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Na Lista de Tarefas</h3>
                {upcomingTasks.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nenhuma tarefa próxima.</p>
                ) : (
                  <div className="space-y-3">
                    {upcomingTasks.map(task => (
                      <div key={task.id} className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium truncate">{task.title}</p>
                        {task.dueDate && <span className="text-xs text-muted-foreground shrink-0">{format(new Date(task.dueDate), "dd/MM")}</span>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
