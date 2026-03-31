import niveauService from '../../services/niveauService';
import TableLookup   from '../../components/TableLookup';

export default function Niveaux() {
  return (
    <TableLookup
      titre          ="Niveaux"
      sousTitre      ="Gestion des niveaux d'études"
      colLabel       ="Libellé du Niveau"
      champAffichage ="libelle"
      champForm      ="libelle"
      labelAjouter   =" Ajouter un niveau"
      labelModal     ="Nouveau niveau"
      labelChamp     ="Libellé du niveau *"
      importEndpoint ="/import/niveaux"
      service        ={niveauService}
    />
  );
}