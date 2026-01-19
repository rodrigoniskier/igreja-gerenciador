import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import ModulePage from './pages/ModulePage';
import BackupPage from './pages/BackupPage';
import SettingsPage from './pages/SettingsPage';
import LoginPage from './pages/LoginPage';
import MembersModule from './pages/MembersModule'; // <--- NOVA IMPORTAÇÃO
import { db, defaultConfigs } from './db';
import { Users, DollarSign, Calendar, BookOpen, Book, Cloud, Settings, LogOut } from 'lucide-react';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [configs, setConfigs] = useState(defaultConfigs);
  const [loading, setLoading] = useState(true);

  const loadConfigs = async () => {
    // Carrega configurações salvas ou usa as padrão
    const keys = Object.keys(defaultConfigs);
    let newConfigs = { ...defaultConfigs };
    
    for (const key of keys) {
      const saved = await db.configuracoes.get(key);
      if (saved) {
        newConfigs[key] = saved.fields;
      }
    }
    setConfigs(newConfigs);
    setLoading(false);
  };

  useEffect(() => { loadConfigs(); }, []);

  if (!isAuthenticated) {
    return <LoginPage onLogin={() => setIsAuthenticated(true)} />;
  }

  if (loading) return <div style={{padding: 20}}>Carregando sistema...</div>;

  const NavItem = ({ to, icon: Icon, label }) => (
    <Link to={to} className="nav-item"><Icon size={18} /> <span>{label}</span></Link>
  );

  return (
    <Router>
      <div className="app-layout">
        <nav className="sidebar">
          <h1 className="logo">Gestão Igreja</h1>
          <NavItem to="/membros" icon={Users} label="Secretaria" />
          <NavItem to="/tesouraria" icon={DollarSign} label="Tesouraria" />
          <NavItem to="/atividades" icon={Calendar} label="Atividades" />
          <NavItem to="/atas" icon={Book} label="Livro de Atas" />
          <NavItem to="/ebd" icon={BookOpen} label="EBD" />
          
          <div className="spacer"></div>
          <hr style={{borderColor: 'rgba(255,255,255,0.1)', width: '100%'}}/>
          <NavItem to="/configuracoes" icon={Settings} label="Configurações" />
          <NavItem to="/backup" icon={Cloud} label="Backup / Dados" />
          
          <button onClick={() => setIsAuthenticated(false)} style={{marginTop: '10px', background: 'rgba(255,255,255,0.1)', color: '#cbd5e1'}}>
            <LogOut size={16}/> Sair
          </button>
        </nav>

        <main className="content" style={{display: 'flex', flexDirection: 'column'}}>
          <div style={{flex: 1}}>
            <Routes>
              <Route path="/" element={<div className="welcome"><h2>Bem-vindo!</h2><p>Selecione um módulo no menu lateral.</p></div>} />
              
              {/* AQUI ESTÁ A MUDANÇA: Rota personalizada para Membros */}
              <Route path="/membros" element={<MembersModule fields={configs.membros} />} />
              
              <Route path="/tesouraria" element={<ModulePage title="Tesouraria" tableName="tesouraria" fields={configs.tesouraria} />} />
              <Route path="/atividades" element={<ModulePage title="Atividades" tableName="atividades" fields={configs.atividades} />} />
              <Route path="/atas" element={<ModulePage title="Livro de Atas" tableName="atas" fields={configs.atas} />} />
              <Route path="/ebd" element={<ModulePage title="Escola Bíblica" tableName="ebd" fields={configs.ebd} />} />
              <Route path="/configuracoes" element={<SettingsPage currentConfigs={configs} onUpdate={loadConfigs} />} />
              <Route path="/backup" element={<BackupPage />} />
            </Routes>
          </div>

          <footer style={{
            marginTop: '50px', 
            paddingTop: '20px', 
            borderTop: '1px solid #e2e8f0', 
            textAlign: 'center', 
            color: '#64748b',
            fontSize: '0.85rem'
          }}>
            <p><strong>Desenvolvido por:</strong> Rodrigo Niskier Ferreira Barbosa</p>
            <p style={{fontStyle: 'italic', marginTop: '5px', fontWeight: '500'}}>Soli Deo Gloria</p>
          </footer>

        </main>
      </div>
    </Router>
  );
}
