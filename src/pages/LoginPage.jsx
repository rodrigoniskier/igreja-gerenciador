import React, { useState, useEffect } from 'react';
import { Lock, Unlock, ShieldCheck } from 'lucide-react';

export default function LoginPage({ onLogin }) {
  const [password, setPassword] = useState('');
  const [hasPassword, setHasPassword] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Verifica se já existe senha cadastrada
    const savedPass = localStorage.getItem('app_password');
    if (savedPass) setHasPassword(true);
  }, []);

  const handleAction = (e) => {
    e.preventDefault();
    if (!password) return;

    if (!hasPassword) {
      // Criar senha pela primeira vez
      localStorage.setItem('app_password', password);
      alert('Senha criada com sucesso! Não a esqueça.');
      onLogin();
    } else {
      // Verificar senha
      const savedPass = localStorage.getItem('app_password');
      if (password === savedPass) {
        onLogin();
      } else {
        setError('Senha incorreta.');
      }
    }
  };

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
      height: '100vh', background: 'var(--metal-dark)', color: 'white'
    }}>
      <div className="section-box" style={{maxWidth: '400px', width: '90%', textAlign: 'center'}}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px', color: '#3b82f6' }}>
          {hasPassword ? <Lock size={48} /> : <ShieldCheck size={48} />}
        </div>
        
        <h2>{hasPassword ? 'Sistema Bloqueado' : 'Bem-vindo'}</h2>
        <p style={{color: '#64748b', marginBottom: '20px'}}>
          {hasPassword 
            ? 'Digite sua senha para acessar.' 
            : 'Defina uma senha de acesso para proteger seus dados offline.'}
        </p>

        <form onSubmit={handleAction}>
          <div className="form-group">
            <input
              type="password"
              placeholder={hasPassword ? "Sua Senha" : "Crie uma Senha"}
              value={password}
              onChange={(e) => {setPassword(e.target.value); setError('');}}
              style={{textAlign: 'center', fontSize: '1.2rem'}}
            />
          </div>
          {error && <p style={{color: '#ef4444', marginBottom: '10px'}}>{error}</p>}
          
          <button type="submit" className="btn-save" style={{width: '100%'}}>
            {hasPassword ? 'Entrar' : 'Criar Senha e Entrar'} <Unlock size={18}/>
          </button>
        </form>
      </div>
    </div>
  );
}