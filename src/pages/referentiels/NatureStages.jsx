import natureStageService from '../../services/natureStageService';
import TableLookup        from '../../components/TableLookup';

export default function NatureStages() {
  return (
    <TableLookup
      titre          ="Nature des Stages"
      sousTitre      ="Configuration des types de stages"
      colLabel       ="Nature de stage"
      champAffichage ="libelle"
      champForm      ="libelle"
      labelAjouter   =" Nouvelle Nature"
      labelModal     ="Nouvelle Nature"
      labelChamp     ="Libellé de la nature *"
      importEndpoint ="/import/naturestages"
      service        ={natureStageService}
    />
  );
}