import etablissementService from '../../services/etablissementService';
import TableLookup          from '../../components/TableLookup';

export default function Etablissements() {
  return (
    <TableLookup
      titre          ="Établissements"
      sousTitre      ="Gestion des écoles et centres de formation"
      colLabel       ="Nom de l'Établissement"
      champAffichage ="nom"
      champForm      ="nom"
      labelAjouter   ="Nouvel Établissement"
      labelModal     ="Nouvel Établissement"
      labelChamp     ="Nom de l'établissement *"
      importEndpoint ="/import/etablissements"
      service        ={etablissementService}
    />
  );
}