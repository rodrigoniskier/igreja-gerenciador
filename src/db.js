import Dexie from 'dexie';

export const db = new Dexie('IgrejaGestaoDB');

// Definimos a versão 4 para garantir que quem já rodou o app antes
// receba a nova estrutura de tabelas, especialmente para as Atas.
db.version(4).stores({
  membros: '++id, nome, cargo',
  tesouraria: '++id, data, tipo, categoria',
  atividades: '++id, data, nome',
  atas: '++id, data, numero, concilio', // Adicionamos índices para busca
  ebd: '++id, data, classe',
  configuracoes: 'id' // Tabela para salvar personalizações dos campos
});

// Configurações Padrão dos Formulários
// Aqui definimos os campos que aparecem em cada tela.
export const defaultConfigs = {
  membros: [
    { name: 'nome', label: 'Nome Completo', type: 'text', required: true },
    { name: 'cargo', label: 'Cargo', type: 'select', options: ['Membro', 'Diácono', 'Presbítero', 'Pastor', 'Músico'], required: true },
    { name: 'nascimento', label: 'Data Nascimento', type: 'date', required: false },
    { name: 'telefone', label: 'Telefone', type: 'tel', required: false },
    { name: 'endereco', label: 'Endereço', type: 'text', required: false }
  ],
  
  tesouraria: [
    { name: 'tipo', label: 'Tipo', type: 'select', options: ['Entrada (Dízimo)', 'Entrada (Oferta)', 'Saída (Pagamento)', 'Saída (Manutenção)'], required: true },
    { name: 'valor', label: 'Valor (R$)', type: 'number', required: true },
    { name: 'data', label: 'Data', type: 'date', required: true },
    { name: 'categoria', label: 'Categoria', type: 'text', required: true, placeholder: 'Ex: Luz, Água, Material Limpeza' },
    { name: 'descricao', label: 'Descrição Detalhada', type: 'text', required: true }
  ],
  
  atividades: [
    { name: 'nome', label: 'Nome do Evento', type: 'text', required: true },
    { name: 'data', label: 'Data', type: 'date', required: true },
    { name: 'lider', label: 'Líder Responsável', type: 'text', required: false },
    { name: 'obs', label: 'Observações', type: 'text', required: false }
  ],
  
  // MÓDULO DE ATAS (Atualizado conforme normas da IPB e Modelo DOCX)
  atas: [
    { name: 'numero', label: 'Número da Ata (Ex: 017)', type: 'text', required: true },
    { name: 'concilio', label: 'Nome do Concílio (Ex: CONSELHO DA IPB ALTIPLANO)', type: 'text', required: true },
    { name: 'data_extenso', label: 'Data por Extenso (Ex: aos dezessete dias de junho...)', type: 'text', required: true },
    { name: 'hora_inicio', label: 'Horário Início (Ex: vinte horas)', type: 'text', required: true },
    { name: 'local', label: 'Endereço Completo (Local)', type: 'text', required: true, placeholder: 'na Igreja Presbiteriana de...' },
    
    // Campo para descrever quem estava lá (Art. 10 §2º)
    { name: 'presenca', label: 'Presença (Ex: O Rev. Fulano, presidente, com os presbíteros...)', type: 'text', required: true },
    
    // Pauta (Assuntos)
    { name: 'pauta', label: 'Pauta (Liste os assuntos separados por pontuação)', type: 'text', required: true },
    
    // Deliberações (Onde se escreve "resolveu-se", "aprovou-se")
    { name: 'deliberacoes', label: 'Deliberações (Texto narrativo das decisões)', type: 'text', required: true },
    
    { name: 'hora_fim', label: 'Horário Encerramento (Ex: vinte e duas horas)', type: 'text', required: true },
    
    // Dados finais para assinatura
    { name: 'cidade_data', label: 'Cidade e Data Final (Ex: João Pessoa - PB, 18 de junho...)', type: 'text', required: true },
    { name: 'assinatura_secretario', label: 'Nome do Secretário (Para assinatura)', type: 'text', required: true, placeholder: 'Pb. Fulano de Tal' }
  ],
  
  ebd: [
    { name: 'classe', label: 'Classe', type: 'select', options: ['Berçário', 'Crianças', 'Jovens', 'Adultos', 'Novos Convertidos'], required: true },
    { name: 'data', label: 'Data da Aula', type: 'date', required: true },
    { name: 'tema', label: 'Tema da Lição', type: 'text', required: false },
    { name: 'matriculados', label: 'Nº Matriculados', type: 'number', required: false },
    { name: 'presentes', label: 'Nº Presentes', type: 'number', required: true },
    { name: 'biblias', label: 'Nº Bíblias', type: 'number', required: false },
    { name: 'oferta', label: 'Oferta (R$)', type: 'number', required: false }
  ]
};