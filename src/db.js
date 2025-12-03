import Dexie from 'dexie';

export const db = new Dexie('IgrejaGestaoDB');

db.version(5).stores({ // VAMOS PARA A VERSÃO 5
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
    { name: 'obs', label: 'Observações', type: 'textarea', required: false } // Obs também pode ser grande
  ],
  
  // --- MÓDULO DE ATAS ATUALIZADO ---
  atas: [
    { name: 'numero', label: 'Número da Ata (Ex: 017)', type: 'text', required: true },
    { name: 'concilio', label: 'Nome do Concílio (Ex: CONSELHO DA IPB ALTIPLANO)', type: 'text', required: true },
    { name: 'data_extenso', label: 'Data por Extenso (Ex: aos dezessete dias de junho...)', type: 'text', required: true },
    { name: 'hora_inicio', label: 'Horário Início (Ex: vinte horas)', type: 'text', required: true },
    { name: 'local', label: 'Endereço Completo (Local)', type: 'text', required: true, placeholder: 'na Igreja Presbiteriana de...' },
    
    // MUDAMOS AQUI PARA 'textarea'
    { name: 'presenca', label: 'Presença (Ex: O Rev. Fulano, presidente, com os presbíteros...)', type: 'textarea', required: true },
    
    // MUDAMOS AQUI PARA 'textarea'
    { name: 'pauta', label: 'Pauta (Liste os assuntos separados por pontuação)', type: 'textarea', required: true },
    
    // MUDAMOS AQUI PARA 'textarea'
    { name: 'deliberacoes', label: 'Deliberações (Texto narrativo das decisões)', type: 'textarea', required: true },
    
    { name: 'hora_fim', label: 'Horário Encerramento (Ex: vinte e duas horas)', type: 'text', required: true },
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
