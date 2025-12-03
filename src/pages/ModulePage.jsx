import React, { useState } from 'react';
import { db } from '../db';
import { useLiveQuery } from 'dexie-react-hooks';
import DynamicForm from '../components/DynamicForm';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { Trash2, FileSpreadsheet, FileText, Pencil } from 'lucide-react';
import { generateAtaDocx } from '../utils/DocxGenerator';

export default function ModulePage({ title, tableName, fields }) {
  const records = useLiveQuery(() => db[tableName].toArray(), [tableName]);
  
  // ESTADO DE EDIÇÃO: Guarda qual item estamos editando no momento
  const [editingRecord, setEditingRecord] = useState(null);

  // Função Inteligente: Salvar ou Atualizar
  const handleSave = async (data) => {
    try {
      if (editingRecord) {
        // --- MODO ATUALIZAÇÃO ---
        // Atualiza usando o ID do registro que está sendo editado
        await db[tableName].update(editingRecord.id, data);
        alert('Registro atualizado com sucesso!');
        setEditingRecord(null); // Sai do modo edição
      } else {
        // --- MODO CRIAÇÃO ---
        await db[tableName].add(data);
        alert('Novo registro salvo!');
      }
      
      // Limpa o formulário (o DynamicForm observa o editingRecord ficar null)
    } catch (err) {
      alert('Erro ao salvar: ' + err);
    }
  };

  // Prepara a edição
  const handleEdit = (record) => {
    setEditingRecord(record);
    // Rola a página para o topo para ver o formulário
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Cancela a edição
  const handleCancelEdit = () => {
    setEditingRecord(null);
  };

  const handleDelete = async (id) => {
    if (confirm('Tem certeza que deseja apagar este item permanentemente?')) {
      await db[tableName].delete(id);
      // Se apagarmos o item que estava sendo editado, limpamos o form
      if (editingRecord && editingRecord.id === id) {
        setEditingRecord(null);
      }
    }
  };

  const exportExcel = () => {
    if (!records || records.length === 0) return alert('Nenhum dado para exportar.');
    const worksheet = XLSX.utils.json_to_sheet(records);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, title);
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(data, `${title}_${new Date().toLocaleDateString()}.xlsx`);
  };

  return (
    <div className="page-container">
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <h2>{title}</h2>
        {/* Mostra aviso se estiver editando */}
        {editingRecord && (
          <span style={{background: '#fef3c7', color: '#d97706', padding: '5px 10px', borderRadius: '4px', fontWeight: 'bold'}}>
            ✏️ Editando Registro #{editingRecord.id}
          </span>
        )}
      </div>
      
      <div className="section-box" style={{ borderLeft: editingRecord ? '5px solid #f59e0b' : '5px solid #3b82f6' }}>
        <h3>{editingRecord ? 'Editar Registro' : 'Novo Lançamento'}</h3>
        <DynamicForm 
          fields={fields} 
          onSubmit={handleSave} 
          initialData={editingRecord} // Passa os dados para o form
          onCancel={handleCancelEdit} // Passa a função de cancelar
        />
      </div>

      <div className="action-bar">
        <h3>Registros ({records?.length || 0})</h3>
        
        {tableName === 'atas' ? (
           <small style={{color: '#64748b'}}>Clique no botão DOCX para gerar o documento.</small>
        ) : (
          <button onClick={exportExcel} className="btn-excel">
            <FileSpreadsheet size={16} /> Baixar Relatório Excel
          </button>
        )}
      </div>

      <div className="table-responsive">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Resumo / Nome</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {records?.map(rec => (
              <tr key={rec.id} style={{background: editingRecord?.id === rec.id ? '#fffbeb' : 'transparent'}}>
                <td width="50">{rec.id}</td>
                <td>
                  <div style={{fontWeight: 'bold'}}>
                    {rec.nome || rec.titulo || (rec.numero ? `Ata ${rec.numero}` : null) || rec.descricao}
                  </div>
                  <div style={{fontSize: '0.85rem', color: '#64748b'}}>
                     {rec.data || rec.data_extenso} {rec.concilio ? ` - ${rec.concilio}` : ''}
                  </div>
                </td>
                <td style={{display: 'flex', gap: '8px'}}>
                  
                  {/* Botão DOCX (Apenas Atas) */}
                  {tableName === 'atas' && (
                    <button onClick={() => generateAtaDocx(rec)} className="btn-save" title="Baixar DOCX" style={{padding: '8px'}}>
                      <FileText size={16} />
                    </button>
                  )}

                  {/* Botão EDITAR (Novo) */}
                  <button onClick={() => handleEdit(rec)} className="btn-save" style={{background: '#f59e0b', padding: '8px'}} title="Editar">
                    <Pencil size={16} />
                  </button>

                  {/* Botão EXCLUIR */}
                  <button onClick={() => handleDelete(rec.id)} className="btn-delete" title="Excluir">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
