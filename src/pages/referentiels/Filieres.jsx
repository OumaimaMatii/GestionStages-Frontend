import filiereService from '../../services/filiereService';
import TableLookup    from '../../components/TableLookup';

export default function Filieres() {
  return (
    <TableLookup
      titre          ="Filières"
      sousTitre      ="Gestion des spécialités académiques"
      colLabel       ="Nom de la Filière"
      champAffichage ="nom"
      champForm      ="nom"
      labelAjouter   =" Nouvelle Filière"
      labelModal     ="Nouvelle Filière"
      labelChamp     ="Nom de la filière *"
      importEndpoint ="/import/filieres"
      service        ={filiereService}
    />
  );
}