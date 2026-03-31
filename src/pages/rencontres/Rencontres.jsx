import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import rencontreService from '../../services/rencontreService';
import stageService from '../../services/stageService';

export default function Rencontres() {
  const { stageId } = useParams();
  const navigate = useNavigate();
  
  // States pour stocker les données
  const [stage, setStage] = useState(null);
  const [rencontres, setRencontres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Charger les données au démarrage
  useEffect(() => {
    const getData = async () => {
      setLoading(true);
      try {
        // On récupère le stage et ses rencontres
        const resStage = await stageService.getById(stageId);
        const resRencontres = await rencontreService.getByStage(stageId);
        
        setStage(resStage.data);
        // On inverse pour avoir la plus récente en haut
        setRencontres((resRencontres.data || []).reverse());
      } catch (err) {
        console.error(err);
        setError("Erreur lors du chargement des données");
      } finally {
        setLoading(false);
      }
    };

    getData();
  }, [stageId]);

  // Fonction pour supprimer
  const supprimerRencontre = async (id) => {
    if (window.confirm("Voulez-vous vraiment supprimer cette rencontre ?")) {
      try {
        await rencontreService.delete(id);
        // Update local state
        setRencontres(rencontres.filter(item => item.id !== id));
      } catch (e) {
        alert("Erreur lors de la suppression");
      }
    }
  };

  if (loading) return <div style={{padding: '40px', textAlign: 'center'}}>Chargement en cours...</div>;

  return (
    <div style={{ padding: '25px', maxWidth: '950px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
      
      {/* Header section */}
      <div style={{ marginBottom: '30px' }}>
        <button 
          onClick={() => navigate('/stages')}
          style={{ cursor: 'pointer', border: 'none', background: 'none', color: '#555', marginBottom: '15px', padding: 0 }}
        >
          ← Retour à la liste des stages
        </button>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '24px' }}>Suivi des Rencontres</h1>
            <p style={{ color: '#666', margin: '5px 0 0' }}>{stage?.sujet?.titre}</p>
          </div>
          <button 
            onClick={() => navigate(`/stages/${stageId}/rencontres/nouvelle`)}
            style={{ 
              padding: '10px 20px', 
              backgroundColor: '#222', 
              color: 'white', 
              borderRadius: '6px', 
              border: 'none',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            + Nouvelle rencontre
          </button>
        </div>
      </div>

      {error && <div style={{ color: 'red', padding: '10px', border: '1px solid red', marginBottom: '20px' }}>{error}</div>}

      {/* Liste des rencontres */}
      {rencontres.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '50px', border: '1px dashed #ccc' }}>
          Aucune rencontre trouvée pour ce stage.
        </div>
      ) : (
        rencontres.map((r, index) => (
          <div key={r.id} style={{
            border: '1px solid #eee',
            borderRadius: '8px',
            padding: '20px',
            marginBottom: '15px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
            backgroundColor: '#fff'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontWeight: 'bold', fontSize: '16px' }}>Rencontre n°{rencontres.length - index}</span>
                  <span style={{ color: '#888', fontSize: '14px' }}>
                    Le {new Date(r.dateRencontre).toLocaleDateString('fr-FR')}
                  </span>
                </div>

                {r.description && (
                  <div style={{ fontSize: '14px', color: '#444', marginBottom: '15px', padding: '10px', background: '#fcfcfc', borderLeft: '3px solid #ddd' }}>
                    {r.description}
                  </div>
                )}

                <div style={{ display: 'flex', gap: '10px' }}>
                  <span style={{ fontSize: '12px', padding: '4px 10px', background: '#eef2f7', borderRadius: '15px' }}>
                    {r.taches?.length || 0} Tâches
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                  onClick={() => navigate(`/stages/${stageId}/rencontres/${r.id}`)}
                  style={{ cursor: 'pointer', padding: '7px 15px', border: '1px solid #ddd', borderRadius: '4px', background: 'white' }}
                >
                  Détails
                </button>
                <button 
                  onClick={() => supprimerRencontre(r.id)}
                  style={{ cursor: 'pointer', padding: '7px 15px', border: '1px solid #ff4d4f', color: '#ff4d4f', borderRadius: '4px', background: 'none' }}
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}