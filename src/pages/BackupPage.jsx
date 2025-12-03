import React, { useRef } from 'react';
import { db } from '../db';
import { saveAs } from 'file-saver';
import { Download, Upload } from 'lucide-react';

export default function BackupPage() {
  const fileInputRef = useRef(null);

  // 1. Exportar (Backup)
  const handleExport = async () => {
    const allData = {
      membros: await db.membros.toArray(),
      tesouraria: await db.tesouraria.toArray(),
      atividades: await db.atividades.toArray(),
      atas: await db.atas.toArray(),
      ebd: await db.ebd.toArray(),
      date: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(allData, null, 2)], { type: 'application/json' });
    saveAs(blob, `Backup_Igreja_${new Date().toLocaleDateString()}.json`);
  };

  // 2. Importar (Restaurar)
  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = JSON.parse(event.target.result);
        
        // Limpa e restaura cada tabela
        await db.transaction('rw', db.membros, db.tesouraria, db.atividades, db.atas, db.ebd, async () => {
          await db.membros.clear(); await db.membros.bulkAdd(data.membros || []);
          await db.tesouraria.clear(); await db.tesouraria.bulkAdd(data.tesouraria || []);
          await db.atividades.clear(); await db.atividades.bulkAdd(data.atividades || []);
          await db.atas.clear(); await db.atas.bulkAdd(data.atas || []);
          await db.ebd.clear(); await db.ebd.bulkAdd(data.ebd || []);
        });
        
        alert('Backup restaurado com sucesso! Seus dados estão de volta.');
      } catch (err) {
        alert('Erro ao restaurar backup. O arquivo pode estar corrompido.');
        console.error(err);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="page-container">
      <h2>Backup e Segurança</h2>
      <div className="section-box">
        <h3>☁️ Salvar na Nuvem (Google Drive)</h3>
        <p>O sistema funciona offline. Para segurança, baixe o arquivo de backup e salve no seu Google Drive manualmente.</p>
        <button onClick={handleExport} className="btn-save" style={{width: '100%'}}>
          <Download size={16} /> Baixar Arquivo de Backup (.json)
        </button>
      </div>

      <div className="section-box" style={{marginTop: '20px', borderColor: 'orange'}}>
        <h3>🔄 Restaurar Dados</h3>
        <p>Se mudou de computador, selecione o arquivo de backup para restaurar tudo.</p>
        <input 
          type="file" 
          accept=".json" 
          ref={fileInputRef} 
          onChange={handleImport} 
          style={{marginBottom: '10px'}}
        />
      </div>
    </div>
  );
}