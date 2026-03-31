import dureeService from '../../services/dureeService';
import TableLookup  from '../../components/TableLookup';

export default function Durees() {
  return (
    <TableLookup
      titre          ="Durées de Stage"
      sousTitre      ="Gestion des périodes de stage référencées"
      colLabel       ="Valeur de la Durée"
      champAffichage ="libelle"
      champForm      ="libelle"
      labelAjouter   =" Nouvelle Durée"
      labelModal     ="Nouvelle Durée"
      labelChamp     ="Valeur (ex: 2 mois) *"
      importEndpoint ="/import/durees"
      service        ={dureeService}
    />
  );
}