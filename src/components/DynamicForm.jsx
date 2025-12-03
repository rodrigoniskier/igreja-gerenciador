import React, { useState, useEffect } from 'react';
import { Save, XCircle, RotateCcw } from 'lucide-react';

export default function DynamicForm({ fields, onSubmit, initialData, onCancel }) {
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({});
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="form-card">
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr', // Força TODOS a serem largura total (coluna única)
        gap: '20px' 
      }}>
        {fields.map((field) => {
          return (
            <div key={field.name} className="form-group">
              <label>{field.label}:</label>
              
              {field.type === 'select' ? (
                <select
                  name={field.name}
                  value={formData[field.name] || ''}
                  onChange={handleChange}
                  required={field.required}
                >
                  <option value="">Selecione...</option>
                  {field.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              ) : field.type === 'textarea' ? (
                <textarea
                  name={field.name}
                  value={formData[field.name] || ''}
                  placeholder={field.placeholder || ''}
                  onChange={handleChange}
                  required={field.required}
                  // Se definirmos 'rows' na config, usa ele. Se não, padrão é 4.
                  rows={field.rows || 4} 
                  style={{ resize: 'vertical' }}
                />
              ) : (
                <input
                  type={field.type}
                  name={field.name}
                  value={formData[field.name] || ''}
                  placeholder={field.placeholder || ''}
                  onChange={handleChange}
                  required={field.required}
                />
              )}
            </div>
          );
        })}
      </div>

      <div style={{ display: 'flex', gap: '10px', marginTop: '20px', borderTop: '1px solid #e2e8f0', paddingTop: '15px' }}>
        <button type="submit" className="btn-save" style={{ flex: 1 }}>
          {initialData ? (
            <><RotateCcw size={18} /> Atualizar Registro</>
          ) : (
            <><Save size={18} /> Salvar Novo</>
          )}
        </button>

        {initialData && (
          <button type="button" onClick={onCancel} style={{ background: '#94a3b8', color: 'white' }}>
            <XCircle size={18} /> Cancelar
          </button>
        )}
      </div>
    </form>
  );
}
