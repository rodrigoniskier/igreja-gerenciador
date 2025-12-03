import Dexie from 'dexie';

export const db = new Dexie('IgrejaGestaoDB');

// Subimos para versão 6 para aplicar as mudanças
db.version(6).stores({
  membros: '++id, nome, cargo',
  tesouraria: '++id, data, tipo, categoria',
  atividades: '++id, data, nome',
  atas: '++id, data, numero, concilio',
  ebd: '++id, data, classe',
  configuracoes: 'id'
});

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
    { name: 'obs', label: 'Observações', type: 'textarea', rows: 4, required: false }
  ],
  
  // --- MÓDULO DE ATAS (TUDO COMO TEXTAREA) ---
  atas: [
    // Campos curtos (rows: 2)
    { name: 'numero', label: 'Número da Ata (Ex: 017)', type: 'textarea', rows: 2, required: true },
    { name: 'concilio', label: 'Nome do Concílio (Ex: CONSELHO DA IPB ALTIPLANO)', type: 'textarea', rows: 2, required: true },
    
    // Campos médios (rows: 3 ou 4)
    { name: 'data_extenso', label: 'Data por Extenso (Ex: aos dezessete dias de junho...)', type: 'textarea', rows: 3, required: true },
    { name: 'hora_inicio', label: 'Horário Início (Ex: vinte horas)', type: 'textarea', rows: 2, required: true },
    { name: 'local', label: 'Endereço Completo (Local)', type: 'textarea', rows: 3, required: true, placeholder: 'na Igreja Presbiteriana de...' },
    
    // Campos grandes (rows: 6 a 12)
    { name: 'presenca', label: 'Presença (Ex: O Rev. Fulano, presidente, com os presbíteros...)', type: 'textarea', rows: 6, required: true },
    { name: 'pauta', label: 'Pauta (Liste os assuntos separados por pontuação)', type: 'textarea', rows: 6, required: true },
    { name: 'deliberacoes', label: 'Deliberações (Texto narrativo das decisões)', type: 'textarea', rows: 12, required: true },
    
    // Encerramento
    { name: 'hora_fim', label: 'Horário Encerramento (Ex: vinte e duas horas)', type: 'textarea', rows: 2, required: true },
    { name: 'cidade_data', label: 'Cidade e Data Final (Ex: João Pessoa - PB, 18 de junho...)', type: 'textarea', rows: 2, required: true },
    { name: 'assinatura_secretario', label: 'Nome do Secretário (Para assinatura)', type: 'textarea', rows: 2, required: true }
  ]
  
  // EBD mantém igual...
  ,ebd: [
    { name: 'classe', label: 'Classe', type: 'select', options: ['Berçário', 'Crianças', 'Jovens', 'Adultos', 'Novos Convertidos'], required: true },
    { name: 'data', label: 'Data da Aula', type: 'date', required: true },
    { name: 'tema', label: 'Tema da Lição', type: 'text', required: false },
    { name: 'matriculados', label: 'Nº Matriculados', type: 'number', required: false },
    { name: 'presentes', label: 'Nº Presentes', type: 'number', required: true },
    { name: 'biblias', label: 'Nº Bíblias', type: 'number', required: false },
    { name: 'oferta', label: 'Oferta (R$)', type: 'number', required: false }
  ]
};
