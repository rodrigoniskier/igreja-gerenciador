import Dexie from 'dexie';

export const db = new Dexie('IgrejaGestaoDB');

// Versão 7 para incluir os novos campos de ata
db.version(7).stores({
  membros: '++id, nome, cargo',
  tesouraria: '++id, data, tipo, categoria',
  atividades: '++id, data, nome',
  atas: '++id, data, numero, concilio',
  ebd: '++id, data, classe',
  configuracoes: 'id'
});

export const defaultConfigs = {
  // ... (membros, tesouraria, atividades, ebd MANTÊM IGUAL) ...
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
  ebd: [
    { name: 'classe', label: 'Classe', type: 'select', options: ['Berçário', 'Crianças', 'Jovens', 'Adultos', 'Novos Convertidos'], required: true },
    { name: 'data', label: 'Data da Aula', type: 'date', required: true },
    { name: 'tema', label: 'Tema da Lição', type: 'text', required: false },
    { name: 'matriculados', label: 'Nº Matriculados', type: 'number', required: false },
    { name: 'presentes', label: 'Nº Presentes', type: 'number', required: true },
    { name: 'biblias', label: 'Nº Bíblias', type: 'number', required: false },
    { name: 'oferta', label: 'Oferta (R$)', type: 'number', required: false }
  ],

  // --- MÓDULO DE ATAS OTIMIZADO ---
  atas: [
    // CABEÇALHO
    { name: 'numero', label: 'Número da Ata (Ex: 017)', type: 'textarea', rows: 1, required: true },
    { name: 'concilio', label: 'Nome do Concílio', type: 'textarea', rows: 1, required: true, defaultValue: 'CONSELHO DA IGREJA PRESBITERIANA DE ALTIPLANO' },
    
    // DATA E HORA
    { name: 'data_extenso', label: 'Data por Extenso (Ex: aos dezessete dias de junho...)', type: 'textarea', rows: 2, required: true },
    { name: 'hora_inicio', label: 'Horário Início (Ex: vinte horas)', type: 'textarea', rows: 1, required: true },
    
    // ENDEREÇO (FIXO - O usuário raramente muda)
    { name: 'local', label: 'Endereço Completo', type: 'textarea', rows: 3, required: true, defaultValue: 'nas dependências da Igreja Presbiteriana de Altiplano, situada na Rua Severino Garcia Galvão, n°85, bairro Cabo Branco, CEP: 58.045-205, João Pessoa- PB' },
    
    // PRESENÇA (FIXO - Lista padrão dos presbíteros [cite: 2, 3])
    { name: 'presenca', label: 'Presença (Edite apenas se alguém faltar)', type: 'textarea', rows: 4, required: true, defaultValue: 'O Rev. Adriano Cordeiro de Morais, presidente do Conselho, com os presbíteros, o Pb. Rodrigo Niskier Ferreira Barbosa, Vice-Presidente, e o Pb. Lourival Francisco de Jesus, Secretário do Conselho' },
    
    // PAUTA
    { name: 'pauta', label: 'Pauta (Liste os assuntos: 01 - ...; 02 - ...)', type: 'textarea', rows: 4, required: true },
    
    // DEVOCIONAL (NOVOS CAMPOS para automação)
    { name: 'texto_biblico', label: 'Texto Bíblico (Ex: Salmo 23)', type: 'textarea', rows: 1, required: true, placeholder: 'Ex: Colossenses 3.1-4' },
    { name: 'oracao_inicio', label: 'Quem orou no início? (Ex: Pb. Rodrigo)', type: 'textarea', rows: 1, required: true },

    // DELIBERAÇÕES
    { name: 'deliberacoes', label: 'Deliberações (Texto das decisões)', type: 'textarea', rows: 10, required: true },
    
    // ENCERRAMENTO
    { name: 'hora_fim', label: 'Horário Encerramento (Ex: vinte e duas horas)', type: 'textarea', rows: 1, required: true },
    { name: 'oracao_fim', label: 'Quem orou no fim? (Ex: Pb. Lourival Jesus)', type: 'textarea', rows: 1, required: true },

    // ASSINATURA
    { name: 'cidade_data', label: 'Cidade e Data (Rodapé)', type: 'textarea', rows: 1, required: true, defaultValue: 'João Pessoa - PB, ' },
    { name: 'assinatura_secretario', label: 'Secretário (Assinatura)', type: 'textarea', rows: 1, required: true, defaultValue: 'Pb. Lourival Francisco de Jesus' }
  ]
};
