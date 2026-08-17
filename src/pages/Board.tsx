import React, { useState, useMemo } from 'react';
import { useStore } from '../store/useStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { Textarea } from '../components/ui/textarea';
import { PostType, Priority, BoardPost } from '../types';
import { Search, Filter, Plus, MessageSquare, AlertCircle, Clock, Trash2, Edit2, Pin } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

import { EmptyState } from '../components/ui/empty-state';

export function Board() {
  const { posts, family, addPost, updatePost, deletePost } = useStore();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState<PostType>('Aviso');
  const [priority, setPriority] = useState<Priority>('Normal');

  const resetForm = () => {
    setEditingId(null);
    setTitle('');
    setContent('');
    setType('Aviso');
    setPriority('Normal');
  };

  const handleEdit = (post: BoardPost) => {
    setEditingId(post.id);
    setTitle(post.title);
    setContent(post.content);
    setType(post.type);
    setPriority(post.priority);
    setOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;
    
    // Default author to first member if exists, else 'unknown'
    const authorId = family.members.length > 0 ? family.members[0].id : 'unknown';

    if (editingId) {
      updatePost(editingId, { title, content, type, priority });
      toast.success('Publicação atualizada!');
    } else {
      addPost({ title, content, type, priority, authorId, isRead: true });
      toast.success('Publicação criada!');
    }
    setOpen(false);
  };

  const filteredPosts = useMemo(() => {
    let filtered = posts;
    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter(p => p.title.toLowerCase().includes(s) || p.content.toLowerCase().includes(s));
    }
    if (typeFilter !== 'all') {
      filtered = filtered.filter(p => p.type === typeFilter);
    }
    // Sort: Urgente first, then by date descending
    return filtered.sort((a, b) => {
      if (a.priority === 'Urgente' && b.priority !== 'Urgente') return -1;
      if (b.priority === 'Urgente' && a.priority !== 'Urgente') return 1;
      return b.createdAt.localeCompare(a.createdAt);
    });
  }, [posts, search, typeFilter]);

  const getPriorityBadge = (p: Priority) => {
    if (p === 'Urgente') return <Badge variant="destructive" className="flex items-center gap-1"><AlertCircle className="h-3 w-3" /> Urgente</Badge>;
    if (p === 'Importante') return <Badge className="bg-amber-500 hover:bg-amber-600">Importante</Badge>;
    return <Badge variant="secondary">Normal</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mural da Família</h1>
          <p className="text-muted-foreground mt-1">Quadro de avisos e comunicados importantes.</p>
        </div>
        <Dialog open={open} onOpenChange={(val) => { setOpen(val); if(!val) resetForm(); }}>
          <DialogTrigger render={<Button><Plus className="h-4 w-4 mr-2" /> Nova Publicação</Button>} />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? 'Editar Publicação' : 'Nova Publicação'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSave} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Título</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="Ex: Reunião do condomínio" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <Select value={type} onValueChange={(v: PostType) => setType(v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Aviso">Aviso</SelectItem>
                      <SelectItem value="Lembrete">Lembrete</SelectItem>
                      <SelectItem value="Informação">Informação</SelectItem>
                      <SelectItem value="Comunicado">Comunicado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Prioridade</Label>
                  <Select value={priority} onValueChange={(v: Priority) => setPriority(v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Normal">Normal</SelectItem>
                      <SelectItem value="Importante">Importante</SelectItem>
                      <SelectItem value="Urgente">Urgente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Conteúdo</Label>
                <Textarea value={content} onChange={(e) => setContent(e.target.value)} required placeholder="Detalhes do aviso..." rows={5} />
              </div>
              <Button type="submit" className="w-full">Publicar</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-dashed bg-muted/30">
        <CardContent className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar no mural..." 
              className="pl-9 bg-background"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full md:w-[200px] bg-background">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <SelectValue placeholder="Tipo" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os tipos</SelectItem>
              <SelectItem value="Aviso">Aviso</SelectItem>
              <SelectItem value="Lembrete">Lembrete</SelectItem>
              <SelectItem value="Informação">Informação</SelectItem>
              <SelectItem value="Comunicado">Comunicado</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {filteredPosts.length === 0 ? (
        <EmptyState 
          icon={MessageSquare}
          title="Nenhuma publicação encontrada"
          description="O mural está vazio. Crie um aviso para comunicar algo à família."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredPosts.map(post => {
            const author = family.members.find(m => m.id === post.authorId);
            return (
              <Card key={post.id} className={`group flex flex-col relative overflow-hidden ${!post.isRead ? 'border-primary shadow-sm' : ''}`}>
                {post.priority === 'Urgente' && <div className="absolute top-0 left-0 w-1 h-full bg-destructive"></div>}
                {!post.isRead && post.priority !== 'Urgente' && <div className="absolute top-0 right-0 w-2 h-2 rounded-full bg-primary m-4"></div>}
                
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex gap-2 items-center">
                      <Badge variant="outline" className="font-normal text-xs">{post.type}</Badge>
                      {getPriorityBadge(post.priority)}
                    </div>
                  </div>
                  <CardTitle className="text-lg leading-tight">{post.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap flex-1">
                    {post.content}
                  </p>
                  
                  <div className="flex justify-between items-end mt-4 pt-4 border-t">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" />
                      <span>{format(parseISO(post.createdAt), "dd/MM 'às' HH:mm")}</span>
                      <span className="mx-1">•</span>
                      <span className="font-medium text-foreground">{author?.name || 'Autor Desconhecido'}</span>
                    </div>
                    <div className="flex opacity-0 group-hover:opacity-100 transition-opacity gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEdit(post)}>
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => deletePost(post.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  );
}
