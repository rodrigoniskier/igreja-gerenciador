import React, { useState } from 'react';
import { db } from '../db';
import { PlusCircle, Trash2, Upload, FileSpreadsheet, AlertTriangle, RefreshCcw } from 'lucide-react';
import * as XLSX from 'xlsx';

export default function SettingsPage({ currentConfigs, onUpdate }) {
  const [selectedModule, setSelectedModule] = useState('membros');
  const [newField, setNewField] = useState({ label: '', type: 'text' });
  const [importStatus, setImportStatus] = useState('');

  // Pega os campos do módulo selecionado
  const currentFields = currentConfigs[selectedModule] || [];

  const handleAddField = async () => {
    if (!newField.label) return alert('Dê um nome ao campo');
    
    const technicalName = newField.label.toLowerCase().replace(/ /g, '_').normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    
    const fieldToAdd = {
      name: technicalName,
      label: newField.label,
      type: newField.type,
      required: false,
      options: []
    };

    const updatedFields = [...currentFields, fieldToAdd];
    await db.configuracoes.put({ id: selectedModule, fields: updatedFields });
    onUpdate();
    setNewField({ label: '', type: 'text' });
    alert('Campo adicionado!');
  };

  const removeField = async (idx) => {
    if(!confirm("Tem certeza? Dados antigos nesse campo deixarão de aparecer no formulário.")) return;
    const updatedFields = currentFields.filter((_, i) => i !== idx);
    await db.configuracoes.put({ id: selectedModule, fields: updatedFields });
    onUpdate();
  };

  // --- NOVA FUNÇÃO: RESTAURAR PADRÕES ---
  // Isso resolve o problema de campos que sumiram do formulário
  const handleResetModule = async () => {
    if (confirm(`Deseja restaurar os campos originais de "${selectedModule.toUpperCase()}"? \nIsso trará de volta campos como Cargo, Telefone, etc, caso tenham sumido.`)) {
      // Deletar a configuração personalizada faz o App.jsx carregar o padrão do código (db.js)
      await db.configuracoes.delete(selectedModule);
      await onUpdate();
      alert('Campos restaurados com sucesso!');
    }
  };

  const handleClearMembros = async () => {
    if(confirm("ATENÇÃO: Isso apagará TODOS os registros de membros cadastrados. Deseja continuar?")) {
        await db.membros.clear();
        alert("Banco de dados de membros foi limpo com sucesso.");
        setImportStatus("");
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = async (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(ws);

        if (data.length === 0) {
          alert("A planilha parece estar vazia.");
          return;
        }

        const formattedData = data.map(row => {
          const newRow = {};
          
          Object.keys(row).forEach(excelKey => {
            const cleanKey = excelKey.toLowerCase().trim();
            
            let systemField = currentConfigs.membros.find(f => f.label.toLowerCase() === cleanKey || f.name === cleanKey);
            
            if (cleanKey.includes('nome')) newRow['nome'] = row[excelKey];
            else if (cleanKey.includes('cargo')) newRow['cargo'] = row[excelKey];
            else if (cleanKey.includes('nascimento')) newRow['nascimento'] = row[excelKey];
            else if (cleanKey.includes('telefone') || cleanKey.includes('celular') || cleanKey.includes('whatsapp')) newRow['telefone'] = row[excelKey];
            else if (cleanKey.includes('endereço') || cleanKey.includes('endereco')) newRow['endereco'] = row[excelKey];
            else if (systemField) {
                 newRow[systemField.name] = row[excelKey];
            } else {
                 newRow[cleanKey.replace(/ /g, '_')] = row[excelKey];
            }
          });

          if (!newRow.cargo) newRow.cargo = 'Membro';
          return newRow;
        });

        await db.membros.bulkAdd(formattedData);
        setImportStatus(`Sucesso! ${formattedData.length} membros importados.`);
        alert(`${formattedData.length} registros importados!`);
        e.target.value = null; 

      } catch (error) {
        console.error("Erro na importação:", error);
        alert("Erro ao ler o arquivo.");
      }
    };

    reader.readAsBinaryString(file);
  };

  // Lista de campos que não devem ser apagados para evitar bugs
  const protectedFields = ['nome', 'cargo', 'telefone', 'nascimento', 'endereco', 'tipo', 'valor', 'data', 'numero', 'concilio'];

  return (
    <div className="page-container">
      <h2>Configurações do Sistema</h2>
      <p>Gerencie campos e dados do sistema.</p>

      {/* --- ÁREA DE GESTÃO DE DADOS --- */}
      <div className="section-box" style={{borderLeft: '4px solid #10b981', backgroundColor: '#f0fdf4'}}>
        <h3><FileSpreadsheet size={20} style={{marginBottom: -4}}/> Gestão de Dados</h3>
        <p style={{fontSize: '0.9rem', color: '#666'}}>
          Importe dados via Excel ou limpe a base de dados.
        </p>
        
        <div style={{marginTop: 15, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap'}}>
          <label className="btn-save" style={{cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5}}>
            <Upload size={16}/> Carregar Excel
            <input type="file" accept=".xlsx, .xls, .csv" onChange={handleFileUpload} style={{display: 'none'}} />
          </label>

          <button onClick={handleClearMembros} className="btn-delete" style={{background: '#ef4444', border: 'none'}}>
            <AlertTriangle size={16}/> Limpar Base Membros
          </button>
        </div>
        
        {importStatus && <p style={{color: '#059669', fontWeight: 'bold', marginTop: 10}}>{importStatus}</p>}
      </div>

      <hr style={{margin: '30px 0', borderColor: '#eee'}}/>

      {/* SELEÇÃO DE MÓDULO */}
      <div className="section-box">
        <label>Módulo para editar campos:</label>
        <div style={{display: 'flex', gap: 10}}>
            <select value={selectedModule} onChange={(e) => setSelectedModule(e.target.value)} style={{flex: 1}}>
            <option value="membros">Secretaria / Membros</option>
            <option value="tesouraria">Tesouraria</option>
            <option value="atividades">Atividades</option>
            <option value="atas">Atas</option>
            <option value="ebd">EBD</option>
            </select>
            
            {/* BOTÃO DE RESTAURAR PADRÕES */}
            <button onClick={handleResetModule} className="btn-save" style={{background: '#64748b', width: 'auto'}} title="Reverter para campos originais">
                <RefreshCcw size={16}/> Restaurar Padrão
            </button>
        </div>
      </div>

      <div className="section-box" style={{borderLeft: '4px solid #3b82f6'}}>
        <h3>Adicionar Novo Campo</h3>
        <div style={{display: 'flex', gap: '10px', alignItems: 'flex-end'}}>
          <div style={{flex: 1}}>
            <label>Nome (Ex: Data Batismo)</label>
            <input value={newField.label} onChange={e => setNewField({...newField, label: e.target.value})} />
          </div>
          <div style={{width: '150px'}}>
            <label>Tipo</label>
            <select value={newField.type} onChange={e => setNewField({...newField, type: e.target.value})}>
              <option value="text">Texto</option>
              <option value="date">Data</option>
              <option value="number">Número</option>
              <option value="tel">Telefone</option>
            </select>
          </div>
          <button onClick={handleAddField} className="btn-save"><PlusCircle size={16}/> Adicionar</button>
        </div>
      </div>

      <div className="section-box">
        <h3>Campos Atuais em "{selectedModule.toUpperCase()}"</h3>
        <table className="table-responsive">
          <thead><tr><th>Nome</th><th>Tipo</th><th>Ação</th></tr></thead>
          <tbody>
            {currentFields.map((f, idx) => (
              <tr key={idx}>
                <td>{f.label}</td>
                <td>{f.type}</td>
                <td>
                   {/* Proteção para não apagar campos essenciais */}
                   {protectedFields.includes(f.name) ? 
                    <small style={{color: '#94a3b8'}}>Padrão (Fixo)</small> : 
                    <button onClick={() => removeField(idx)} className="btn-delete"><Trash2 size={14}/></button>
                   }
                </td>
              </tr>
            ))}
            {currentFields.length === 0 && <tr><td colSpan="3" style={{textAlign:'center', color:'red'}}>Nenhum campo configurado! Clique em "Restaurar Padrão" acima.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
