import React, { useState, useEffect } from 'react';
import { Save, XCircle, RotateCcw } from 'lucide-react';

export default function DynamicForm({ fields, onSubmit, initialData, onCancel }) {
  const [formData, setFormData] = useState({});

  // EFEITO MÁGICO: Sempre que o "initialData" mudar (quando clicamos em Editar),
  // o formulário se preenche sozinho.
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
    // Não limpamos automaticamente aqui, deixamos o ModulePage decidir
    // para garantir que salvou no banco antes.
  };

  return (
    <form onSubmit={handleSubmit} className="form-card">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
        {fields.map((field) => (
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
        ))}
      </div>

      <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
        <button type="submit" className="btn-save" style={{ flex: 1 }}>
          {initialData ? (
            <><RotateCcw size={18} /> Atualizar Registro</>
          ) : (
            <><Save size={18} /> Salvar Novo</>
          )}
        </button>

        {/* Botão Cancelar só aparece se estivermos Editando */}
        {initialData && (
          <button type="button" onClick={onCancel} style={{ background: '#94a3b8', color: 'white' }}>
            <XCircle size={18} /> Cancelar
          </button>
        )}
      </div>
    </form>
  );
}
