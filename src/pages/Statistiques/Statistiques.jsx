import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, CartesianGrid } from 'recharts';
import stageService from '../../services/stageService';
import stagiaireService from '../../services/stagiaireService';

const COLORS = ['#3b82f6', '#22c55e', '#eab308', '#8b5cf6', '#ef4444'];

export default function StatistiquesCompletes() {
  const [data, setData] = useState({ stages: [], stagiaires: [], loading: true });

  useEffect(() => {
    Promise.all([stageService.getAll(), stagiaireService.getAll()])
      .then(([s, st]) => setData({ stages: s.data || [], stagiaires: st.data || [], loading: false }))
      .catch(() => setData(prev => ({ ...prev, loading: false })));
  }, []);

  if (data.loading) return <div style={{ padding: '50px', textAlign: 'center', color: '#64748b' }}>Chargement des statistiques...</div>;

 
  const statusCounts = {
    'Planifié': data.stages.filter(s => s.statut === 'Planifie').length,
    'En cours': data.stages.filter(s => s.statut === 'EnCours' || !s.statut).length,
    'Terminé': data.stages.filter(s => s.statut === 'Termine').length
  };
  const pieStatusData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));

 
  const typesCount = {
    'Individuel': data.stages.filter(s => s.typeStage !== 'Groupe').length,
    'Groupe': data.stages.filter(s => s.typeStage === 'Groupe').length
  };
  const pieTypeData = Object.entries(typesCount).map(([name, value]) => ({ name, value }));

  
  const etabMap = {};
  data.stagiaires.forEach(st => {
    const nom = st.etablissement?.nom || 'Autre';
    etabMap[nom] = (etabMap[nom] || 0) + 1;
  });
  const barEtabData = Object.entries(etabMap)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count).slice(0, 5);

  const cardStyle = { backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px' };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', fontFamily: 'Inter, sans-serif', padding: '20px' }}>
      <h2 style={{ marginBottom: '25px', fontSize: '22px', fontWeight: 700, color: '#0f172a' }}>Tableau de Bord des Stages</h2>

     
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
        
      
        <div style={cardStyle}>
          <h3 style={{ fontSize: '14px', color: '#64748b', marginBottom: '15px', fontWeight: 600 }}>Répartition par Statut</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={pieStatusData} innerRadius={50} outerRadius={75} dataKey="value" paddingAngle={5}>
                <Cell fill="#eab308" /> {/* Planifié */}
                <Cell fill="#3b82f6" /> {/* En cours */}
                <Cell fill="#22c55e" /> {/* Terminé */}
              </Pie>
              <Tooltip />
              <Legend iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </div>

       
        <div style={cardStyle}>
          <h3 style={{ fontSize: '14px', color: '#64748b', marginBottom: '15px', fontWeight: 600 }}>Type de Stage (%)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={pieTypeData} outerRadius={75} dataKey="value" label={({percent}) => `${(percent*100).toFixed(0)}%`}>
                <Cell fill="#8b5cf6" />
                <Cell fill="#ec4899" />
              </Pie>
              <Tooltip />
              <Legend iconType="rect" />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

     
      <div style={cardStyle}>
        <h3 style={{ fontSize: '14px', color: '#64748b', marginBottom: '20px', fontWeight: 600 }}>Top 5 Établissements (Nombre de Stagiaires)</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={barEtabData} margin={{ left: 20, right: 20 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
            <Tooltip cursor={{fill: '#f8fafc'}} />
            <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={50} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div style={{ marginTop: '20px', display: 'flex', gap: '15px' }}>
        <div style={{ ...cardStyle, flex: 1, textAlign: 'center', padding: '15px' }}>
          <div style={{ fontSize: '24px', fontWeight: 800 }}>{data.stages.length}</div>
          <div style={{ fontSize: '11px', color: '#94a3b8' }}>TOTAL STAGES</div>
        </div>
        <div style={{ ...cardStyle, flex: 1, textAlign: 'center', padding: '15px' }}>
          <div style={{ fontSize: '24px', fontWeight: 800 }}>{data.stagiaires.length}</div>
          <div style={{ fontSize: '11px', color: '#94a3b8' }}>TOTAL STAGIAIRES</div>
        </div>
      </div>
    </div>
  );
}