import React, { useState } from 'react';
import { db } from '../db';
import { PlusCircle, Trash2, Upload, FileSpreadsheet } from 'lucide-react';
import * as XLSX from 'xlsx'; // Importamos a biblioteca que já tinhas instalada

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
    if(!confirm("Remover este campo? Dados antigos podem ficar ocultos.")) return;
    const updatedFields = currentFields.filter((_, i) => i !== idx);
    await db.configuracoes.put({ id: selectedModule, fields: updatedFields });
    onUpdate();
  };

  // --- NOVA FUNÇÃO DE IMPORTAÇÃO ---
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = async (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        
        // Pega a primeira aba da planilha
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        
        // Converte para JSON
        const data = XLSX.utils.sheet_to_json(ws);

        if (data.length === 0) {
          alert("A planilha parece estar vazia.");
          return;
        }

        // Normalização de dados (ajusta nomes das colunas)
        const formattedData = data.map(row => {
          const newRow = {};
          // Tenta encontrar campos equivalentes ignorando maiúsculas/minúsculas
          Object.keys(row).forEach(key => {
            const lowerKey = key.toLowerCase().trim();
            
            // Mapeamento simples (Adicione mais conforme necessário)
            if (lowerKey.includes('nome')) newRow.nome = row[key];
            else if (lowerKey.includes('cargo')) newRow.cargo = row[key];
            else if (lowerKey.includes('nascimento')) newRow.nascimento = row[key]; // Formato deve ser YYYY-MM-DD
            else if (lowerKey.includes('telefone') || lowerKey.includes('celular')) newRow.telefone = row[key];
            else if (lowerKey.includes('endereço') || lowerKey.includes('endereco')) newRow.endereco = row[key];
            else {
              // Se for um campo extra, mantém o nome original em minúsculo
              newRow[lowerKey] = row[key];
            }
          });

          // Define padrões caso falte algo obrigatório
          if (!newRow.cargo) newRow.cargo = 'Membro';
          
          return newRow;
        });

        // Salva no Banco de Dados (Tabela Membros)
        // Usamos bulkAdd para ser rápido
        await db.membros.bulkAdd(formattedData);
        
        setImportStatus(`Sucesso! ${formattedData.length} membros importados.`);
        alert(`${formattedData.length} registos importados com sucesso!`);
        e.target.value = null; // Limpa o input

      } catch (error) {
        console.error("Erro na importação:", error);
        alert("Erro ao ler o arquivo. Verifique se é um Excel válido.");
      }
    };

    reader.readAsBinaryString(file);
  };

  return (
    <div className="page-container">
      <h2>Configurações do Sistema</h2>
      <p>Gerencie campos e dados do sistema.</p>

      {/* --- NOVA ÁREA DE IMPORTAÇÃO --- */}
      <div className="section-box" style={{borderLeft: '4px solid #10b981', backgroundColor: '#f0fdf4'}}>
        <h3><FileSpreadsheet size={20} style={{marginBottom: -4}}/> Importar Membros (Excel/CSV)</h3>
        <p style={{fontSize: '0.9rem', color: '#666'}}>
          Faça upload de uma planilha para cadastrar vários membros de uma vez. 
          <br/>Certifique-se que a planilha tem cabeçalhos como: <strong>Nome, Cargo, Telefone, Nascimento</strong>.
        </p>
        
        <div style={{marginTop: 15, display: 'flex', alignItems: 'center', gap: 10}}>
          <label className="btn-save" style={{cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5}}>
            <Upload size={16}/> Escolher Arquivo Excel
            <input 
              type="file" 
              accept=".xlsx, .xls, .csv" 
              onChange={handleFileUpload} 
              style={{display: 'none'}} 
            />
          </label>
          {importStatus && <span style={{color: '#059669', fontWeight: 'bold'}}>{importStatus}</span>}
        </div>
      </div>

      <hr style={{margin: '30px 0', borderColor: '#eee'}}/>

      {/* SELEÇÃO DE MÓDULO (Código Antigo Mantido Abaixo) */}
      <div className="section-box">
        <label>Escolha o Módulo para editar campos:</label>
        <select value={selectedModule} onChange={(e) => setSelectedModule(e.target.value)}>
          <option value="membros">Secretaria / Membros</option>
          <option value="tesouraria">Tesouraria</option>
          <option value="atividades">Atividades</option>
          <option value="atas">Atas</option>
          <option value="ebd">EBD</option>
        </select>
      </div>

      <div className="section-box" style={{borderLeft: '4px solid #3b82f6'}}>
        <h3>Adicionar Novo Campo Personalizado</h3>
        <div style={{display: 'flex', gap: '10px', alignItems: 'flex-end'}}>
          <div style={{flex: 1}}>
            <label>Nome do Campo (Ex: Data de Batismo)</label>
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
                   {['nome', 'tipo', 'valor', 'titulo'].includes(f.name) ? <small>Padrão</small> : 
                    <button onClick={() => removeField(idx)} className="btn-delete"><Trash2 size={14}/></button>
                   }
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
