import { Recipe, Meal, Document, Contact, HomeItem, Maintenance, BoardPost, AppNotification } from '../types';

export const mockRecipes: Recipe[] = [
  {
    id: 'r1',
    name: 'Lasanha à Bolonhesa',
    category: 'Massa',
    ingredients: [
      '500g de massa para lasanha',
      '500g de carne moída',
      '1 cebola picada',
      '2 dentes de alho picados',
      '1 lata de molho de tomate',
      '400g de queijo mussarela fatiado',
      '400g de presunto fatiado',
      'Azeite, sal e pimenta a gosto'
    ],
    instructions: 'Refogue a cebola e o alho no azeite. Adicione a carne e doure. Coloque o molho de tomate e deixe cozinhar. Em um refratário, intercale camadas de molho, massa, presunto e queijo. Asse por 40 minutos a 200°C.',
    prepTime: 60,
    isFavorite: true,
    createdAt: new Date().toISOString(),
    photoUrl: 'https://images.unsplash.com/photo-1574894709920-11b28e7367e3?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'r2',
    name: 'Frango com Batata Doce',
    category: 'Saudável',
    ingredients: [
      '2 filés de peito de frango',
      '2 batatas doces médias',
      'Azeite, sal, páprica e orégano'
    ],
    instructions: 'Tempere o frango com sal e páprica. Grelhe em uma frigideira. Corte as batatas em palitos, tempere com orégano e azeite, e asse na airfryer por 20 minutos.',
    prepTime: 30,
    isFavorite: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'r3',
    name: 'Panqueca de Aveia',
    category: 'Café da Manhã',
    ingredients: [
      '1 ovo',
      '2 colheres de sopa de farelo de aveia',
      '1 banana amassada',
      'Canela a gosto'
    ],
    instructions: 'Misture todos os ingredientes. Aqueça uma frigideira antiaderente e doure a panqueca dos dois lados.',
    prepTime: 10,
    isFavorite: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'r4',
    name: 'Estrogonofe de Carne',
    category: 'Carnes',
    ingredients: [
      '500g de carne em tiras',
      '1 cebola',
      '1 dente de alho',
      '1 caixa de creme de leite',
      '2 colheres de ketchup',
      '1 colher de mostarda',
      'Champignon a gosto'
    ],
    instructions: 'Doure a carne com cebola e alho. Adicione o ketchup, mostarda e champignon. Desligue o fogo e incorpore o creme de leite.',
    prepTime: 40,
    notes: 'Servir com arroz branco e batata palha.',
    isFavorite: true,
    createdAt: new Date().toISOString(),
  }
];

// Create some mock meals for the current week
const today = new Date();
const formatDate = (date: Date) => date.toISOString().split('T')[0];
const addDays = (date: Date, days: number) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};
const subDays = (date: Date, days: number) => {
  const result = new Date(date);
  result.setDate(result.getDate() - days);
  return result;
};

export const mockMeals: Meal[] = [
  {
    id: 'm1',
    date: formatDate(today),
    type: 'breakfast',
    recipeId: 'r3', // Panqueca
  },
  {
    id: 'm2',
    date: formatDate(today),
    type: 'lunch',
    recipeId: 'r1', // Lasanha
  },
  {
    id: 'm3',
    date: formatDate(today),
    type: 'dinner',
    name: 'Sopa de Legumes',
  },
  {
    id: 'm4',
    date: formatDate(addDays(today, 1)),
    type: 'lunch',
    recipeId: 'r4', // Estrogonofe
  },
  {
    id: 'm5',
    date: formatDate(addDays(today, 2)),
    type: 'dinner',
    recipeId: 'r2', // Frango
  }
];

export const mockDocuments: Document[] = [
  {
    id: 'doc1',
    name: 'Certidão de Casamento',
    category: 'Documentos pessoais',
    description: 'Certidão original',
    documentDate: '2015-10-15',
    status: 'no_expiration',
    mimeType: 'application/pdf',
    fileSize: 1024 * 1024 * 2.5, // 2.5 MB
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'doc2',
    name: 'Seguro do Carro - Honda Civic',
    category: 'Seguros',
    documentDate: formatDate(subDays(today, 60)),
    expirationDate: formatDate(addDays(today, 15)),
    status: 'expiring_soon',
    mimeType: 'application/pdf',
    fileSize: 1024 * 1024 * 1.2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'doc3',
    name: 'Contrato de Aluguel',
    category: 'Contratos',
    documentDate: '2022-01-10',
    expirationDate: formatDate(addDays(today, 300)),
    status: 'valid',
    mimeType: 'application/pdf',
    fileSize: 1024 * 1024 * 5.1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'doc4',
    name: 'Garantia da Geladeira',
    category: 'Garantias',
    documentDate: '2021-05-20',
    expirationDate: '2022-05-20',
    status: 'expired',
    mimeType: 'image/jpeg',
    fileSize: 1024 * 500,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'doc5',
    name: 'Boletim Escolar',
    category: 'Escola',
    documentDate: formatDate(subDays(today, 5)),
    status: 'no_expiration',
    mimeType: 'application/pdf',
    fileSize: 1024 * 800,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const mockContacts: Contact[] = [
  {
    id: 'c1',
    name: 'Assistência Técnica Brastemp',
    category: 'Serviços',
    phone: '(11) 99999-1111',
    company: 'Brastemp Autorizada',
    notes: 'Atende em horário comercial',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'c2',
    name: 'Escola do João',
    category: 'Escola',
    phone: '(11) 3333-4444',
    email: 'secretaria@escola.com',
    address: 'Rua das Flores, 123',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'c3',
    name: 'Dr. Silva (Pediatra)',
    category: 'Seguros',
    phone: '(11) 98888-2222',
    address: 'Av. Paulista, 1000 - Sala 50',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const mockHomeItems: HomeItem[] = [
  {
    id: 'hi1',
    name: 'Geladeira Frost Free 400L',
    category: 'Eletrodomésticos',
    location: 'Cozinha',
    purchaseDate: '2022-05-20',
    value: 3500,
    supplierId: 'c1',
    warrantyEndDate: '2023-05-20', // Expired
    documentId: 'doc4',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'hi2',
    name: 'Ar Condicionado Split 9000 BTUs',
    category: 'Equipamentos',
    location: 'Quarto Casal',
    purchaseDate: formatDate(subDays(today, 100)),
    value: 1800,
    warrantyEndDate: formatDate(addDays(today, 265)), // Valid
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const mockMaintenances: Maintenance[] = [
  {
    id: 'mt1',
    serviceName: 'Limpeza de Filtro',
    homeItemId: 'hi2',
    location: 'Quarto Casal',
    date: formatDate(subDays(today, 10)),
    isCompleted: true,
    cost: 150,
    nextMaintenanceDate: formatDate(addDays(today, 170)),
    notes: 'Limpeza padrão de 6 meses',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'mt2',
    serviceName: 'Revisão Elétrica',
    location: 'Quadro de Força Geral',
    date: formatDate(addDays(today, 5)),
    isCompleted: false,
    nextMaintenanceDate: undefined,
    notes: 'Verificar disjuntor caindo',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'mt3',
    serviceName: 'Troca de Borracha',
    homeItemId: 'hi1',
    date: formatDate(subDays(today, 5)),
    isCompleted: false,
    supplierId: 'c1',
    notes: 'Borracha da porta não está vedando',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const mockPosts: BoardPost[] = [
  {
    id: 'post1',
    authorId: 'user1',
    title: 'Dedetização no prédio',
    content: 'O síndico avisou que a dedetização ocorrerá nesta sexta-feira às 14h. Precisamos fechar as janelas.',
    type: 'Aviso',
    priority: 'Importante',
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: 'post2',
    authorId: 'user2',
    title: 'Reunião de Pais',
    content: 'A reunião da escola do João foi remarcada para a próxima quarta-feira.',
    type: 'Comunicado',
    priority: 'Normal',
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
  },
];

export const mockNotifications: AppNotification[] = [
  {
    id: 'notif1',
    type: 'document',
    title: 'Seguro do Carro vencendo',
    description: 'O seguro do Honda Civic vence em 15 dias.',
    priority: 'Importante',
    isRead: false,
    linkTo: '/documentos',
    referenceId: 'doc2',
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 mins ago
  },
  {
    id: 'notif2',
    type: 'home',
    title: 'Manutenção Atrasada',
    description: 'A troca de borracha da geladeira está atrasada.',
    priority: 'Urgente',
    isRead: false,
    linkTo: '/casa',
    referenceId: 'mt3',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
  },
  {
    id: 'notif3',
    type: 'task',
    title: 'Tarefa Concluída',
    description: 'Comprar material escolar foi finalizado.',
    priority: 'Normal',
    isRead: true,
    linkTo: '/',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
  },
  {
    id: 'notif4',
    type: 'board',
    title: 'Novo aviso no Mural',
    description: 'Dedetização no prédio.',
    priority: 'Normal',
    isRead: false,
    linkTo: '/mural',
    referenceId: 'post1',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
  }
];


export const mockIntegrations: any[] = [
  { provider: 'drive', status: 'disconnected' },
  { provider: 'calendar', status: 'disconnected' },
  { provider: 'maps', status: 'disconnected' },
  { provider: 'photos', status: 'disconnected' },
  { provider: 'sheets', status: 'disconnected' },
];

export const mockMemories: any[] = [
  {
    id: 'mem1',
    title: 'Viagem para a Praia',
    photoCount: 45,
    date: '2023-12-28',
    googleAlbumId: 'album_123',
    googleAlbumUrl: 'https://photos.google.com/album/123',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'mem2',
    title: 'Aniversário do João',
    photoCount: 120,
    date: '2023-05-15',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];
