import React from 'react';
import { db } from '../db';
import { useLiveQuery } from 'dexie-react-hooks';
import DynamicForm from '../components/DynamicForm';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { Trash2, FileSpreadsheet, FileText } from 'lucide-react';
import { generateAtaDocx } from '../utils/DocxGenerator'; // Importamos o gerador

export default function ModulePage({ title, tableName, fields }) {
  const records = useLiveQuery(() => db[tableName].toArray(), [tableName]);

  const handleAdd = async (data) => {
    try {
      await db[tableName].add(data);
      alert('Registro salvo com sucesso!');
    } catch (err) {
      alert('Erro ao salvar: ' + err);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Tem certeza que deseja apagar este item?')) {
      await db[tableName].delete(id);
    }
  };

  // Exportar Excel (Padrão para financeiro, membros, etc)
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
      <h2>{title}</h2>
      
      <div className="section-box">
        <h3>Novo Registro</h3>
        <DynamicForm fields={fields} onSubmit={handleAdd} />
      </div>

      <div className="action-bar">
        <h3>Registros ({records?.length || 0})</h3>
        
        {/* Lógica: Se for ATAS, mostra botão WORD. Se não, mostra EXCEL */}
        {tableName === 'atas' ? (
           <small style={{color: '#64748b'}}>Para baixar a Ata, clique no ícone azul na lista abaixo.</small>
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
              <th>Ação</th>
            </tr>
          </thead>
          <tbody>
            {records?.map(rec => (
              <tr key={rec.id}>
                <td width="50">{rec.id}</td>
                <td>
                  {/* Mostra um resumo inteligente dependendo da tabela */}
                  {rec.nome || rec.titulo || rec.numero + ' - ' + rec.concilio || rec.descricao}
                </td>
                <td style={{display: 'flex', gap: '10px'}}>
                  
                  {/* Botão Especial de Download DOCX para cada Ata individualmente */}
                  {tableName === 'atas' && (
                    <button onClick={() => generateAtaDocx(rec)} className="btn-save" title="Baixar DOCX Oficial">
                      <FileText size={16} /> DOCX
                    </button>
                  )}

                  <button onClick={() => handleDelete(rec.id)} className="btn-delete">
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