import React, { useMemo } from 'react';
import { useStore } from '../../store/useStore';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Button } from '../ui/button';
import { Bell, Check, Clock, FileText, Home, Utensils, Zap, Users, ShieldAlert, Calendar } from 'lucide-react';
import { AppNotification, NotificationType } from '../../types';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';

const getIcon = (type: NotificationType) => {
  switch (type) {
    case 'task': return <Check className="h-4 w-4 text-orange-500" />;
    case 'event': return <Calendar className="h-4 w-4 text-blue-500" />;
    case 'document': return <FileText className="h-4 w-4 text-purple-500" />;
    case 'home': return <Home className="h-4 w-4 text-amber-500" />;
    case 'board': return <Users className="h-4 w-4 text-primary" />;
    case 'finance': return <Zap className="h-4 w-4 text-emerald-500" />;
    default: return <Bell className="h-4 w-4 text-muted-foreground" />;
  }
};

export function Notifications() {
  const { notifications, markNotificationAsRead, markAllNotificationsAsRead } = useStore();
  const navigate = useNavigate();

  const sortedNotifs = useMemo(() => {
    return [...notifications].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [notifications]);

  const unreadCount = sortedNotifs.filter(n => !n.isRead).length;

  const handleClick = (notif: AppNotification) => {
    markNotificationAsRead(notif.id);
    if (notif.linkTo) {
      navigate(notif.linkTo);
    }
  };

  return (
    <Popover>
      <PopoverTrigger render={<Button variant="ghost" size="icon" className="relative h-10 w-10 min-h-[44px] min-w-[44px]" />}>
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-destructive"></span>
          </span>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 mr-4 mt-2" align="end">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h4 className="font-semibold text-sm">Notificações</h4>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground" onClick={markAllNotificationsAsRead}>
              Marcar lidas
            </Button>
          )}
        </div>
        <div className="max-h-[400px] overflow-y-auto">
          {sortedNotifs.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground flex flex-col items-center">
              <Bell className="h-8 w-8 mb-2 opacity-20" />
              Nenhuma notificação.
            </div>
          ) : (
            <div className="flex flex-col">
              {sortedNotifs.map(notif => (
                <button
                  key={notif.id}
                  className={`text-left flex gap-3 p-4 border-b last:border-0 hover:bg-muted/50 transition-colors ${!notif.isRead ? 'bg-muted/20' : ''}`}
                  onClick={() => handleClick(notif)}
                >
                  <div className="mt-0.5 shrink-0">
                    {getIcon(notif.type)}
                  </div>
                  <div className="flex-1 space-y-1 overflow-hidden">
                    <p className={`text-sm leading-tight ${!notif.isRead ? 'font-semibold' : 'font-medium text-muted-foreground'}`}>
                      {notif.title}
                    </p>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {notif.description}
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-[10px] text-muted-foreground">
                        {formatDistanceToNow(parseISO(notif.createdAt), { addSuffix: true, locale: ptBR })}
                      </span>
                      {notif.priority === 'Urgente' && !notif.isRead && (
                        <span className="text-[10px] font-medium text-destructive">Urgente</span>
                      )}
                    </div>
                  </div>
                  {!notif.isRead && (
                    <div className="shrink-0 flex items-center justify-center">
                      <div className="h-2 w-2 rounded-full bg-primary" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
