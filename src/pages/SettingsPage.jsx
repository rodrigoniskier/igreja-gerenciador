import React, { useState } from 'react';
import { db } from '../db';
import { PlusCircle, Trash2, Save } from 'lucide-react';

export default function SettingsPage({ currentConfigs, onUpdate }) {
  const [selectedModule, setSelectedModule] = useState('membros');
  const [newField, setNewField] = useState({ label: '', type: 'text' });

  // Pega os campos do módulo selecionado
  const currentFields = currentConfigs[selectedModule] || [];

  const handleAddField = async () => {
    if (!newField.label) return alert('Dê um nome ao campo');
    
    // Cria um "name" técnico baseada no label (ex: "Data Batismo" vira "data_batismo")
    const technicalName = newField.label.toLowerCase().replace(/ /g, '_').normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    
    const fieldToAdd = {
      name: technicalName,
      label: newField.label,
      type: newField.type,
      required: false,
      options: [] // Futuramente poderíamos deixar editar opções
    };

    const updatedFields = [...currentFields, fieldToAdd];
    
    // Salva no banco
    await db.configuracoes.put({ id: selectedModule, fields: updatedFields });
    onUpdate(); // Avisa o App para recarregar
    setNewField({ label: '', type: 'text' });
    alert('Campo adicionado!');
  };

  const removeField = async (idx) => {
    if(!confirm("Remover este campo? Dados antigos podem ficar ocultos.")) return;
    const updatedFields = currentFields.filter((_, i) => i !== idx);
    await db.configuracoes.put({ id: selectedModule, fields: updatedFields });
    onUpdate();
  };

  return (
    <div className="page-container">
      <h2>Configurações do Sistema</h2>
      <p>Adicione campos personalizados aos formulários.</p>

      <div className="section-box">
        <label>Escolha o Módulo para editar:</label>
        <select value={selectedModule} onChange={(e) => setSelectedModule(e.target.value)}>
          <option value="membros">Secretaria / Membros</option>
          <option value="tesouraria">Tesouraria</option>
          <option value="atividades">Atividades</option>
          <option value="atas">Atas</option>
          <option value="ebd">EBD</option>
        </select>
      </div>

      <div className="section-box" style={{borderLeft: '4px solid #3b82f6'}}>
        <h3>Adicionar Novo Campo</h3>
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
                   {/* Protegemos os campos básicos de serem apagados para não quebrar o sistema */}
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