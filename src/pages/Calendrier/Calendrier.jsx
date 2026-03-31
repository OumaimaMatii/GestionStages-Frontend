import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import stageService from '../../services/stageService';


const toDate = (s) => { const d = new Date(s); d.setHours(0,0,0,0); return d; };
const sameDay = (a,b) => a && b && a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate();

// Couleurs uniques par stage (cycle sur 10 couleurs)
const colorForId = (id) => {
  const colors = [
    '#f87171','#34d399','#60a5fa','#facc15','#a78bfa','#f97316','#22d3ee','#f472b6','#a3e635','#38bdf8'
  ];
  return colors[id % colors.length];
};

export default function Calendrier() {
  const navigate = useNavigate();
  const [stages, setStages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [activeMonth, setActiveMonth] = useState(new Date());

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const res = await stageService.getAll();
      setStages(res.data || []);
    } catch (err) {
      console.error('Erreur de chargement', err);
    } finally {
      setLoading(false);
    }
  };

  const getStagesByDate = (date) => {
    const d = toDate(date);
    return stages.filter(s => d >= toDate(s.dateDebut) && d <= toDate(s.dateFin));
  };

  const stagesDuMois = stages.filter(s => {
    const start = new Date(activeMonth.getFullYear(), activeMonth.getMonth(), 1);
    const end = new Date(activeMonth.getFullYear(), activeMonth.getMonth()+1, 0);
    return toDate(s.dateDebut) <= end && toDate(s.dateFin) >= start;
  });

  const tileContent = ({ date, view }) => {
    if(view!=='month') return null;
    const list = getStagesByDate(date);
    if(!list.length) return null;

    return (
      <div style={{ display:'flex', flexDirection:'column', gap:'2px', marginTop:'4px' }}>
        {list.slice(0,2).map(s => (
          <div key={s.id} style={{
            fontSize:'9px', fontWeight:700, padding:'1px 4px', borderRadius:'3px',
            backgroundColor: colorForId(s.id)+'33',
            color: colorForId(s.id),
            border: `1px solid ${colorForId(s.id)}`,
            overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'
          }}>
            {s.nomGroupe || s.sujet?.titre} - {s.utilisateur?.nomComplet || '-'}
          </div>
        ))}
        {list.length>2 && <div style={{ fontSize:'9px', color:'#94a3b8' }}>+{list.length-2}</div>}
      </div>
    );
  };

  return (
    <div style={{ padding:'30px', maxWidth:'1250px', margin:'0 auto', fontFamily:'Inter, system-ui, sans-serif' }}>
      <style>{`
        .react-calendar { width: 100%; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05); }
        .react-calendar__tile { height: 90px; display: flex; flex-direction: column; align-items: stretch; padding: 8px; border-bottom: 1px solid #f3f4f6; }
        .react-calendar__tile--now { background: #f8fafc !important; }
        .react-calendar__tile--active { background: #eff6ff !important; outline: 2px solid #3b82f6; z-index: 1; }
        .react-calendar__navigation { background: #fff; border-bottom: 1px solid #e5e7eb; padding: 10px; }
        .react-calendar__navigation button { font-weight: 600; color: #111827; }
        .react-calendar__month-view__weekdays { font-size: 11px; font-weight: 700; color: #9ca3af; text-transform: uppercase; padding-bottom: 8px; }
      `}</style>

      {loading ? (
        <div style={{ textAlign:'center', padding:'100px', color:'#6b7280' }}>Chargement...</div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'1fr 450px', gap:'24px', alignItems:'start' }}>
          
          {/* Colonne gauche: calendrier */}
          <Calendar
            locale="fr-FR"
            onClickDay={(d)=>setSelected(sameDay(d,selected)?null:d)}
            onActiveStartDateChange={({activeStartDate})=>setActiveMonth(activeStartDate)}
            tileContent={tileContent}
            value={selected}
          />

          {/* Colonne droite: détails du jour et stages du mois */}
          <div style={{ display:'flex', flexDirection:'column', gap:'20px' }}>

            {/* Détails du jour sélectionné */}
            {selected && (
              <div style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:'12px', padding:'20px' }}>
                <h3 style={{ margin:'0 0 16px 0', fontSize:'15px', color:'#111827' }}>
                  {selected.toLocaleDateString('fr-FR', { weekday:'long', day:'2-digit', month:'long' })}
                </h3>
                {getStagesByDate(selected).length===0 ? (
                  <p style={{ color:'#9ca3af', fontSize:'13px', textAlign:'center' }}>Aucun stage prévu</p>
                ) : getStagesByDate(selected).map(s => (
                  <div key={s.id} style={{
                    padding:'12px', borderRadius:'8px', border:`1px solid ${colorForId(s.id)}`,
                    backgroundColor: colorForId(s.id)+'33', marginBottom:'10px'
                  }}>
                    <div style={{ fontWeight:700, color:'#111827', fontSize:'14px', marginBottom:'4px' }}>
                      {s.nomGroupe || s.sujet?.titre}
                    </div>
                    <div style={{ fontSize:'12px', color:'#4b5563', marginBottom:'4px' }}>Projet: {s.sujet?.titre}</div>
                    <div style={{ fontSize:'12px', color:'#4b5563' }}>Collaborateur: {s.utilisateur?.nomComplet || '-'}</div>
                    <button 
                      onClick={()=>navigate(`/stages/${s.id}/rencontres`)}
                      style={{ width:'100%', padding:'8px', borderRadius:'6px', border:'none', backgroundColor:'#111827', color:'#fff', fontSize:'12px', fontWeight:600, cursor:'pointer', marginTop:'8px' }}
                    >
                      Voir les rencontres
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Liste des stages du mois */}
            <div style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:'12px', padding:'20px' }}>
              <h3 style={{ margin:'0 0 12px 0', fontSize:'14px', color:'#6b7280', textTransform:'uppercase', letterSpacing:'0.05em' }}>Stages du mois</h3>
              {stagesDuMois.map(s => (
                <div key={s.id} style={{ display:'flex', alignItems:'center', gap:'10px', padding:'10px 0', borderBottom:'1px solid #f3f4f6' }}>
                  <div style={{ width:'6px', height:'6px', borderRadius:'50%', backgroundColor: colorForId(s.id) }}></div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:'13px', fontWeight:600, color:'#111827' }}>{s.nomGroupe || s.sujet?.titre}</div>
                    <div style={{ fontSize:'11px', color:'#9ca3af' }}>{new Date(s.dateDebut).toLocaleDateString('fr-FR')}</div>
                  </div>
                  <span style={{ fontSize:'10px', fontWeight:700, color: colorForId(s.id) }}>Stage</span>
                </div>
              ))}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}