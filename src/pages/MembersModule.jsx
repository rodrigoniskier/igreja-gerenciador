import React, { useState, useEffect } from 'react';
import { db } from '../db';
import DynamicForm from '../components/DynamicForm';
import { Users, UserPlus, FileText, Search, ArrowLeft, Download, Filter } from 'lucide-react';
import * as XLSX from 'xlsx';

export default function MembersModule({ fields }) {
  // Estados de navegação: 'menu', 'list', 'form', 'reports'
  const [view, setView] = useState('menu');
  const [members, setMembers] = useState([]);
  const [editingMember, setEditingMember] = useState(null);

  // Carrega membros ao iniciar
  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    const data = await db.membros.toArray();
    setMembers(data);
  };

  // --- COMPONENTES INTERNOS ---

  // 1. MENU INICIAL (3 BOTÕES)
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
          <p>Filtros e exportação Excel</p>
        </button>
      </div>
    </div>
  );

  // 2. LISTA E PESQUISA
  const MemberList = () => {
    const [searchTerm, setSearchTerm] = useState('');

    const filtered = members.filter(m => {
      // Garante que buscamos mesmo que o campo seja nulo
      const name = m.nome?.toLowerCase() || '';
      return name.includes(searchTerm.toLowerCase());
    });

    return (
      <div className="module-container">
        <div className="header-action">
            <button onClick={() => setView('menu')} className="btn-back"><ArrowLeft size={16}/> Voltar</button>
            <h2>Pesquisar Membros</h2>
        </div>

        <div className="search-box">
            <Search size={18} color="#64748b"/>
            <input 
                placeholder="Digite o nome para buscar..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                autoFocus
            />
        </div>

        <div className="table-responsive">
            <table>
                <thead>
                    <tr>
                        <th>Nome</th>
                        <th>Cargo</th>
                        <th>Telefone</th>
                        <th>Ação</th>
                    </tr>
                </thead>
                <tbody>
                    {filtered.map(m => (
                        <tr key={m.id} onClick={() => { setEditingMember(m); setView('form'); }} style={{cursor: 'pointer'}}>
                            <td>{m.nome}</td>
                            <td>{m.cargo}</td>
                            <td>{m.telefone}</td>
                            <td><button className="btn-small">Abrir Ficha</button></td>
                        </tr>
                    ))}
                    {filtered.length === 0 && <tr><td colSpan="4" style={{textAlign: 'center'}}>Nenhum membro encontrado.</td></tr>}
                </tbody>
            </table>
        </div>
      </div>
    );
  };

  // 3. FORMULÁRIO (ADD / EDIT)
  const MemberFormWrapper = () => {
    const handleSubmit = async (formData) => {
        if (editingMember) {
            // Atualizar
            await db.membros.update(editingMember.id, formData);
            alert('Membro atualizado com sucesso!');
        } else {
            // Criar novo
            await db.membros.add(formData);
            alert('Membro cadastrado com sucesso!');
        }
        await loadMembers(); // Recarrega a lista
        setView('list'); // Volta para a lista
    };

    const handleDelete = async () => {
        if (confirm('Tem certeza que deseja excluir este membro?')) {
            await db.membros.delete(editingMember.id);
            await loadMembers();
            setView('list');
        }
    };

    return (
        <div className="module-container">
            <div className="header-action">
                <button onClick={() => setView('list')} className="btn-back"><ArrowLeft size={16}/> Voltar para Lista</button>
                <h2>{editingMember ? `Editando: ${editingMember.nome}` : 'Novo Membro'}</h2>
            </div>
            
            <DynamicForm 
                fields={fields} 
                initialData={editingMember} 
                onSubmit={handleSubmit}
                onCancel={() => setView('list')} 
            />
            
            {editingMember && (
                <div style={{marginTop: 20, textAlign: 'right'}}>
                    <button onClick={handleDelete} className="btn-delete">Excluir Membro</button>
                </div>
            )}
        </div>
    );
  };

  // 4. RELATÓRIOS AVANÇADOS
  const Reports = () => {
      const [filterCargo, setFilterCargo] = useState('');
      const [onlyBirthdays, setOnlyBirthdays] = useState(false);
      
      const generateReport = () => {
        // Lógica de filtragem
        let result = members.filter(m => {
            let pass = true;
            if (filterCargo && m.cargo !== filterCargo) pass = false;
            
            if (onlyBirthdays) {
                // Exemplo simples: verifica se tem data de nascimento preenchida
                // (Para aniversariantes do mês seria necessário lógica de data mais complexa)
                if (!m.nascimento) pass = false;
            }
            return pass;
        });

        if (result.length === 0) return alert('Nenhum membro encontrado com estes filtros.');

        // Gera o Excel
        const ws = XLSX.utils.json_to_sheet(result);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Relatorio");
        XLSX.writeFile(wb, "Relatorio_Membros.xlsx");
      };

      return (
        <div className="module-container">
            <div className="header-action">
                <button onClick={() => setView('menu')} className="btn-back"><ArrowLeft size={16}/> Voltar</button>
                <h2>Gerador de Relatórios</h2>
            </div>

            <div className="filter-card">
                <h3><Filter size={18}/> Filtros de Pesquisa</h3>
                
                <div className="form-group">
                    <label>Filtrar por Cargo:</label>
                    <select value={filterCargo} onChange={e => setFilterCargo(e.target.value)}>
                        <option value="">Todos os Cargos</option>
                        <option value="Membro">Membro</option>
                        <option value="Diácono">Diácono</option>
                        <option value="Presbítero">Presbítero</option>
                        <option value="Pastor">Pastor</option>
                    </select>
                </div>

                <div className="form-group" style={{flexDirection: 'row', alignItems: 'center', gap: 10}}>
                    <input 
                        type="checkbox" 
                        checked={onlyBirthdays} 
                        onChange={e => setOnlyBirthdays(e.target.checked)} 
                        id="chk_niver"
                    />
                    <label htmlFor="chk_niver" style={{marginBottom: 0}}>Apenas quem tem data de nascimento cadastrada</label>
                </div>

                <button onClick={generateReport} className="btn-save" style={{marginTop: 20, width: '100%'}}>
                    <Download size={18}/> Baixar Planilha Excel
                </button>
            </div>
            
            <p style={{marginTop: 20, color: '#64748b', fontSize: '0.9rem'}}>
                * O relatório incluirá todas as colunas disponíveis no cadastro.
            </p>
        </div>
      );
  };

  // RENDERIZAÇÃO PRINCIPAL
  return (
    <div className="page-container">
        {view === 'menu' && <Menu />}
        {view === 'list' && <MemberList />}
        {view === 'form' && <MemberFormWrapper />}
        {view === 'reports' && <Reports />}
    </div>
  );
}
