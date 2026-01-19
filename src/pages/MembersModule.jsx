import React, { useState, useEffect } from 'react';
import { db } from '../db';
import DynamicForm from '../components/DynamicForm';
import { Users, UserPlus, FileText, Search, ArrowLeft, Download, CheckSquare, Square } from 'lucide-react';
import * as XLSX from 'xlsx';

export default function MembersModule({ fields }) {
  const [view, setView] = useState('menu');
  const [members, setMembers] = useState([]);
  const [editingMember, setEditingMember] = useState(null);

  useEffect(() => { loadMembers(); }, []);

  const loadMembers = async () => {
    const data = await db.membros.toArray();
    setMembers(data);
  };

  const Menu = () => (
    <div className="dashboard-menu">
      <h2 style={{width: '100%', textAlign: 'center', marginBottom: 30}}>Gestão de Secretaria</h2>
      <div className="menu-grid">
        <button className="menu-card" onClick={() => setView('list')}>
          <Search size={40} />
          <h3>Pesquisar Membros</h3>
          <p>Lista completa e busca</p>
        </button>
        <button className="menu-card" onClick={() => { setEditingMember(null); setView('form'); }}>
          <UserPlus size={40} />
          <h3>Adicionar Membro</h3>
          <p>Cadastrar nova ficha</p>
        </button>
        <button className="menu-card" onClick={() => setView('reports')}>
          <FileText size={40} />
          <h3>Gerar Relatórios</h3>
          <p>Relatórios Personalizados</p>
        </button>
      </div>
    </div>
  );

  const MemberList = () => {
    const [searchTerm, setSearchTerm] = useState('');

    const filtered = members.filter(m => {
      // Busca segura: verifica se nome existe, senão string vazia
      const name = m.nome ? m.nome.toLowerCase() : '';
      return name.includes(searchTerm.toLowerCase());
    });

    const downloadFullList = () => {
        const ws = XLSX.utils.json_to_sheet(members);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Membros_Completo");
        XLSX.writeFile(wb, "Lista_Completa_Membros.xlsx");
    };

    return (
      <div className="module-container">
        <div className="header-action">
            <button onClick={() => setView('menu')} className="btn-back"><ArrowLeft size={16}/> Voltar</button>
            <h2>Pesquisar Membros</h2>
        </div>

        <div style={{display:'flex', gap: 10, marginBottom: 20}}>
            <div className="search-box" style={{flex: 1, marginBottom: 0}}>
                <Search size={18} color="#64748b"/>
                <input 
                    placeholder="Busque por nome..." 
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    autoFocus
                />
            </div>
            <button onClick={downloadFullList} className="btn-save" style={{background: '#10b981'}}>
                <Download size={16}/> Baixar Tudo
            </button>
        </div>

        <div className="table-responsive">
            <table>
                <thead><tr><th>Nome</th><th>Cargo</th><th>Telefone</th><th>Ação</th></tr></thead>
                <tbody>
                    {filtered.map(m => (
                        <tr key={m.id} onClick={() => { setEditingMember(m); setView('form'); }} style={{cursor: 'pointer'}}>
                            <td>{m.nome || <span style={{color:'red'}}>(Sem Nome)</span>}</td>
                            <td>{m.cargo}</td>
                            <td>{m.telefone}</td>
                            <td><button className="btn-small">Abrir Ficha</button></td>
                        </tr>
                    ))}
                    {filtered.length === 0 && <tr><td colSpan="4" style={{textAlign: 'center', padding: 20}}>Nenhum membro encontrado.</td></tr>}
                </tbody>
            </table>
        </div>
      </div>
    );
  };

  const MemberFormWrapper = () => {
    const handleSubmit = async (formData) => {
        if (editingMember) {
            await db.membros.update(editingMember.id, formData);
            alert('Atualizado com sucesso!');
        } else {
            await db.membros.add(formData);
            alert('Cadastrado com sucesso!');
        }
        await loadMembers();
        setView('list');
    };

    const handleDelete = async () => {
        if (confirm('Excluir este membro?')) {
            await db.membros.delete(editingMember.id);
            await loadMembers();
            setView('list');
        }
    };

    return (
        <div className="module-container">
            <div className="header-action">
                <button onClick={() => setView('list')} className="btn-back"><ArrowLeft size={16}/> Voltar</button>
                <h2>{editingMember ? `Editando: ${editingMember.nome}` : 'Novo Cadastro'}</h2>
            </div>
            
            <DynamicForm 
                fields={fields} 
                initialData={editingMember} 
                onSubmit={handleSubmit}
                onCancel={() => setView('list')}
                saveLabel="Salvar Novo Membro" 
            />
            
            {editingMember && (
                <div style={{marginTop: 20, textAlign: 'right'}}>
                    <button onClick={handleDelete} className="btn-delete">Excluir Membro</button>
                </div>
            )}
        </div>
    );
  };

  // --- NOVO GERADOR DE RELATÓRIOS COM SELEÇÃO DE COLUNAS ---
  const Reports = () => {
      // Cria lista de colunas baseada na configuração + campos extras que possam existir nos dados
      const getAllKeys = () => {
          const configKeys = fields.map(f => ({ key: f.name, label: f.label }));
          return configKeys;
      };

      const availableColumns = getAllKeys();
      // Inicialmente seleciona todas as colunas
      const [selectedCols, setSelectedCols] = useState(availableColumns.map(c => c.key));

      const toggleColumn = (key) => {
          if (selectedCols.includes(key)) {
              setSelectedCols(selectedCols.filter(k => k !== key));
          } else {
              setSelectedCols([...selectedCols, key]);
          }
      };

      const generateCustomReport = () => {
          if (selectedCols.length === 0) return alert("Selecione pelo menos uma coluna.");

          // Mapeia os dados para ter apenas as colunas escolhidas
          const dataToExport = members.map(member => {
              const row = {};
              selectedCols.forEach(colKey => {
                  // Tenta achar o label bonito para o cabeçalho do Excel
                  const fieldConfig = availableColumns.find(c => c.key === colKey);
                  const headerName = fieldConfig ? fieldConfig.label : colKey;
                  
                  row[headerName] = member[colKey] || ''; 
              });
              return row;
          });

          const ws = XLSX.utils.json_to_sheet(dataToExport);
          const wb = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(wb, ws, "Relatorio_Personalizado");
          XLSX.writeFile(wb, "Relatorio_Personalizado.xlsx");
      };

      return (
        <div className="module-container">
            <div className="header-action">
                <button onClick={() => setView('menu')} className="btn-back"><ArrowLeft size={16}/> Voltar</button>
                <h2>Gerador de Relatórios Personalizados</h2>
            </div>

            <div className="filter-card" style={{maxWidth: '100%'}}>
                <h3>Selecione as informações para o relatório:</h3>
                
                <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 15, margin: '20px 0'}}>
                    {availableColumns.map(col => (
                        <div key={col.key} 
                             onClick={() => toggleColumn(col.key)}
                             style={{
                                 display: 'flex', alignItems: 'center', gap: 10, 
                                 cursor: 'pointer', padding: 10, borderRadius: 8,
                                 border: selectedCols.includes(col.key) ? '1px solid #3b82f6' : '1px solid #e2e8f0',
                                 background: selectedCols.includes(col.key) ? '#eff6ff' : 'white'
                             }}>
                            {selectedCols.includes(col.key) ? <CheckSquare size={20} color="#3b82f6"/> : <Square size={20} color="#94a3b8"/>}
                            <span>{col.label}</span>
                        </div>
                    ))}
                </div>

                <div style={{borderTop: '1px solid #eee', paddingTop: 20}}>
                    <button onClick={generateCustomReport} className="btn-save" style={{width: '100%', padding: 15, fontSize: '1.1rem'}}>
                        <Download size={20}/> Baixar Planilha Personalizada
                    </button>
                </div>
            </div>
        </div>
      );
  };

  return (
    <div className="page-container">
        {view === 'menu' && <Menu />}
        {view === 'list' && <MemberList />}
        {view === 'form' && <MemberFormWrapper />}
        {view === 'reports' && <Reports />}
    </div>
  );
}
