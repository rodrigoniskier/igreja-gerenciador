import React, { useState } from 'react';
import { db } from '../db';
import { PlusCircle, Trash2, Upload, FileSpreadsheet, AlertTriangle } from 'lucide-react';
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
    if(!confirm("Remover este campo? Dados antigos podem ficar ocultos.")) return;
    const updatedFields = currentFields.filter((_, i) => i !== idx);
    await db.configuracoes.put({ id: selectedModule, fields: updatedFields });
    onUpdate();
  };

  // --- NOVA FUNÇÃO DE LIMPEZA DE BANCO ---
  const handleClearMembros = async () => {
    if(confirm("ATENÇÃO: Isso apagará TODOS os registros de membros cadastrados. Deseja continuar?")) {
        await db.membros.clear();
        alert("Banco de dados de membros foi limpo com sucesso.");
        setImportStatus("");
    }
  };

  // --- FUNÇÃO DE IMPORTAÇÃO MELHORADA (Inteligente) ---
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = async (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        
        // Converte para JSON bruto
        const data = XLSX.utils.sheet_to_json(ws);

        if (data.length === 0) {
          alert("A planilha parece estar vazia.");
          return;
        }

        // --- LÓGICA DE MAPEAMENTO ---
        // Aqui cruzamos os nomes das colunas do Excel com os campos do sistema
        const formattedData = data.map(row => {
          const newRow = {};
          
          Object.keys(row).forEach(excelKey => {
            const cleanKey = excelKey.toLowerCase().trim(); // Ex: "Nome Completo " -> "nome completo"
            
            // 1. Tenta achar um campo nas configurações que tenha esse Label
            // Ex: Se configurou "Data de Batismo" no sistema, e o Excel tem "Data de Batismo"
            let systemField = currentConfigs.membros.find(f => f.label.toLowerCase() === cleanKey || f.name === cleanKey);
            
            // 2. Mapeamentos manuais para garantir os campos base
            if (cleanKey.includes('nome')) newRow['nome'] = row[excelKey];
            else if (cleanKey.includes('cargo')) newRow['cargo'] = row[excelKey];
            else if (cleanKey.includes('nascimento')) newRow['nascimento'] = row[excelKey]; // Formato deve ser YYYY-MM-DD ou texto
            else if (cleanKey.includes('telefone') || cleanKey.includes('celular') || cleanKey.includes('whatsapp')) newRow['telefone'] = row[excelKey];
            else if (cleanKey.includes('endereço') || cleanKey.includes('endereco')) newRow['endereco'] = row[excelKey];
            
            // 3. Se achou nas configs personalizadas, usa o nome técnico (ex: data_batismo)
            else if (systemField) {
                 newRow[systemField.name] = row[excelKey];
            } 
            // 4. Se não sabe o que é, salva com o nome original em minúsculo (snake_case) para não perder o dado
            else {
                 newRow[cleanKey.replace(/ /g, '_')] = row[excelKey];
            }
          });

          // Define padrão se falte algo obrigatório
          if (!newRow.cargo) newRow.cargo = 'Membro';
          
          return newRow;
        });

        await db.membros.bulkAdd(formattedData);
        
        setImportStatus(`Sucesso! ${formattedData.length} membros importados.`);
        alert(`${formattedData.length} registros importados com sucesso! Verifique na aba Secretaria.`);
        e.target.value = null; 

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

      {/* --- ÁREA DE IMPORTAÇÃO E GESTÃO DE DADOS --- */}
      <div className="section-box" style={{borderLeft: '4px solid #10b981', backgroundColor: '#f0fdf4'}}>
        <h3><FileSpreadsheet size={20} style={{marginBottom: -4}}/> Gestão de Dados de Membros</h3>
        <p style={{fontSize: '0.9rem', color: '#666'}}>
          Importe dados via Excel ou limpe a base de dados para recomeçar.
          <br/>Recomendado: Colunas do Excel devem conter <strong>Nome, Cargo, Telefone</strong>.
        </p>
        
        <div style={{marginTop: 15, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap'}}>
          <label className="btn-save" style={{cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5}}>
            <Upload size={16}/> Carregar Excel
            <input 
              type="file" 
              accept=".xlsx, .xls, .csv" 
              onChange={handleFileUpload} 
              style={{display: 'none'}} 
            />
          </label>

          <button onClick={handleClearMembros} className="btn-delete" style={{background: '#ef4444', border: 'none'}}>
            <AlertTriangle size={16}/> Limpar Base de Membros
          </button>
        </div>
        
        {importStatus && <p style={{color: '#059669', fontWeight: 'bold', marginTop: 10}}>{importStatus}</p>}
      </div>

      <hr style={{margin: '30px 0', borderColor: '#eee'}}/>

      {/* SELEÇÃO DE MÓDULO */}
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
