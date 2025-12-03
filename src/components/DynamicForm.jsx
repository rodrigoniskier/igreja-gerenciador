import React, { useState } from 'react';
import { Save } from 'lucide-react';

export default function DynamicForm({ fields, onSubmit }) {
  const [formData, setFormData] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({}); // Limpa o formulário após salvar
    // Opcional: Limpar campos visualmente se necessário
    document.querySelectorAll('input, select').forEach(input => input.value = '');
  };

  return (
    <form onSubmit={handleSubmit} className="form-card">
      {fields.map((field) => (
        <div key={field.name} className="form-group">
          <label>{field.label}:</label>
          {field.type === 'select' ? (
            <select name={field.name} onChange={handleChange} required={field.required}>
              <option value="">Selecione...</option>
              {field.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          ) : (
            <input
              type={field.type}
              name={field.name}
              placeholder={field.placeholder || ''}
              onChange={handleChange}
              required={field.required}
            />
          )}
        </div>
      ))}
      <button type="submit" className="btn-save">
        <Save size={16} /> Salvar Registro
      </button>
    </form>
  );
}