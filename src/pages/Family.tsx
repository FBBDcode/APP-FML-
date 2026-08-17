import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { Trash2, UserPlus, Users } from 'lucide-react';
import { toast } from 'sonner';

export function Family() {
  const { family, updateFamilyName, addMember, removeMember } = useStore();
  const [open, setOpen] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberRole, setNewMemberRole] = useState<'admin' | 'member'>('member');
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempFamilyName, setTempFamilyName] = useState(family.name);

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim()) return;
    
    addMember({
      name: newMemberName,
      role: newMemberRole
    });
    
    setNewMemberName('');
    setNewMemberRole('member');
    setOpen(false);
    toast.success('Membro adicionado com sucesso!');
  };

  const handleUpdateFamilyName = () => {
    if (tempFamilyName.trim() && tempFamilyName !== family.name) {
      updateFamilyName(tempFamilyName);
      toast.success('Nome da família atualizado!');
    } else {
      setTempFamilyName(family.name);
    }
    setIsEditingName(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          {isEditingName ? (
            <div className="flex items-center gap-2">
              <Input 
                value={tempFamilyName}
                onChange={(e) => setTempFamilyName(e.target.value)}
                className="max-w-[200px] h-10 text-xl font-bold"
                autoFocus
                onBlur={handleUpdateFamilyName}
                onKeyDown={(e) => e.key === 'Enter' && handleUpdateFamilyName()}
              />
            </div>
          ) : (
            <h1 
              className="text-3xl font-bold tracking-tight cursor-pointer hover:text-muted-foreground transition-colors"
              onClick={() => setIsEditingName(true)}
              title="Clique para editar o nome"
            >
              {family.name}
            </h1>
          )}
          <p className="text-muted-foreground mt-1">Gerencie os membros e configurações.</p>
        </div>
        <Dialog open={open} onOpenChange={(val) => {
          setOpen(val);
          if (!val) {
            setNewMemberName('');
            setNewMemberRole('member');
          }
        }}>
          <DialogTrigger render={<Button />}>
            <UserPlus className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Novo Membro</span>
            <span className="inline sm:hidden">Membro</span>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Membro</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddMember} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input 
                  id="name" 
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  placeholder="Ex: João"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Papel</Label>
                <Select value={newMemberRole} onValueChange={(val: 'admin' | 'member') => setNewMemberRole(val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o papel" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Administrador</SelectItem>
                    <SelectItem value="member">Membro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full">Adicionar</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="h-5 w-5" />
            Membros da Família
          </CardTitle>
          <CardDescription>Pessoas com acesso à Central da Família.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2">
            {family.members.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-4 border rounded-xl hover:bg-muted/50 transition-colors group">
                <div className="flex items-center gap-4 min-w-0">
                  <Avatar>
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {member.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate">{member.name}</p>
                    <Badge variant="secondary" className="mt-1 text-[10px] font-normal uppercase tracking-wider">
                      {member.role === 'admin' ? 'Administrador' : 'Membro'}
                    </Badge>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-destructive opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                  onClick={() => {
                    removeMember(member.id);
                    toast.success('Membro removido');
                  }}
                  disabled={family.members.length === 1}
                  title={family.members.length === 1 ? 'Não é possível remover o único membro' : 'Remover membro'}
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Remover membro</span>
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
