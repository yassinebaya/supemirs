import React from 'react';
import * as XLSX from 'xlsx';
import { FileDown } from 'lucide-react';

// Fonction principale d'export
export const exportToExcel = (etudiants, listeCommerciaux, listePartners) => {
  const getNomCommercial = (commercialId) => {
    if (!commercialId) return 'Aucun';
    const commercial = listeCommerciaux.find(c => c._id === commercialId);
    return commercial ? (commercial.nomComplet || commercial.nom) : 'Commercial supprimé';
  };

  const getNomPartner = (nomPartner) => {
    if (!nomPartner) return 'Aucun';
    if (typeof nomPartner === 'object' && nomPartner.nomPartner) {
      return nomPartner.nomPartner;
    }
    const partner = listePartners.find(p => p.id === nomPartner);
    return partner ? partner.nom : nomPartner;
  };

  const formatDate = (isoDate) => {
    if (!isoDate) return 'N/A';
    const date = new Date(isoDate);
    const jour = String(date.getDate()).padStart(2, '0');
    const mois = String(date.getMonth() + 1).padStart(2, '0');
    const annee = date.getFullYear();
    return `${jour}/${mois}/${annee}`;
  };

  const calculerAge = (dateNaissance) => {
    if (!dateNaissance) return 'N/A';
    const dob = new Date(dateNaissance);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    return age;
  };

  const dataToExport = etudiants.map(e => ({
    'Code Étudiant': e.codeEtudiant || 'N/A',
    'Prénom': e.prenom || 'N/A',
    'Nom de Famille': e.nomDeFamille || 'N/A',
    'Genre': e.genre || 'N/A',
    'Date de Naissance': formatDate(e.dateNaissance),
    'Âge': calculerAge(e.dateNaissance),
    'Téléphone': e.telephone || 'N/A',
    'Téléphone Responsable': e.telephoneResponsable || 'N/A',
    'Email': e.email || 'N/A',
    'CIN': e.cin || 'N/A',
    'Passeport': e.passeport || 'N/A',
    'Lieu de Naissance': e.lieuNaissance || 'N/A',
    'Pays': e.pays || 'N/A',
    'Année Scolaire': e.anneeScolaire || 'N/A',
    'Mode Formation': e.niveauFormation || 'N/A',
    'Filière': e.filiere || 'N/A',
    'Niveau': e.niveau || 'N/A',
    'Cycle': e.cycle || 'N/A',
    'Spécialité': e.specialite || 'N/A',
    'Option': e.option || 'N/A',
    'Spécialité Ingénieur': e.specialiteIngenieur || 'N/A',
    'Option Ingénieur': e.optionIngenieur || 'N/A',
    'Spécialité Licence Pro': e.specialiteLicencePro || 'N/A',
    'Option Licence Pro': e.optionLicencePro || 'N/A',
    'Spécialité Master Pro': e.specialiteMasterPro || 'N/A',
    'Option Master Pro': e.optionMasterPro || 'N/A',
    'Type Diplôme': e.typeDiplome || 'N/A',
    'Classes': e.cours ? e.cours.join(', ') : 'Aucun',
    'Diplôme Accès': e.diplomeAcces || 'N/A',
    'Spécialité Diplôme Accès': e.specialiteDiplomeAcces || 'N/A',
    'Mention': e.mention || 'N/A',
    'Lieu Obtention Diplôme': e.lieuObtentionDiplome || 'N/A',
    'Série Baccalauréat': e.serieBaccalaureat || 'N/A',
    'Année Baccalauréat': e.anneeBaccalaureat || 'N/A',
    'Code Baccalauréat': e.codeBaccalaureat || 'N/A',
    'Commercial': getNomCommercial(e.commercial),
    'Source Inscription': e.sourceInscription || 'N/A',
    'Date Inscription': formatDate(e.dateInscription),
    'Première Année Inscription': e.premiereAnneeInscription || 'N/A',
    'Prix Total': e.prixTotal || 'N/A',
    'Pourcentage Bourse': e.pourcentageBourse ? `${e.pourcentageBourse}%` : 'N/A',
    'Type Paiement': e.typePaiement || 'N/A',
    'Mode Paiement': e.modePaiement || 'N/A',
    'Situation': e.situation || 'N/A',
    'Date et Règlement': e.dateEtReglement || 'N/A',
    'Est Partenaire': e.isPartner ? 'Oui' : 'Non',
    'Nom Partenaire': e.isPartner ? getNomPartner(e.nomPartner) : 'N/A',
    'Prix Total Partner': e.prixTotalPartner || 'N/A',
    'Statut Validation': e.validationPedagogique?.statut || 'En attente',
    'Commentaire Validation': e.validationPedagogique?.commentaire || 'N/A',
    'Date Validation': formatDate(e.validationPedagogique?.dateValidation),
    'Actif': e.actif ? 'Oui' : 'Non',
    'Payé': e.paye ? 'Oui' : 'Non',
    'Nouvelle Inscription': e.nouvelleInscription ? 'Oui' : 'Non',
    'Handicapé': e.handicape ? 'Oui' : 'Non',
    'Résident': e.resident ? 'Oui' : 'Non',
    'Fonctionnaire': e.fonctionnaire ? 'Oui' : 'Non',
    'Mobilité': e.mobilite ? 'Oui' : 'Non',
    'Document CIN': e.documentCin ? 'Oui' : 'Non',
    'Document Bac': e.documentBacCommentaire ? 'Oui' : 'Non',
    'Relevé Notes Bac': e.documentReleveNoteBac ? 'Oui' : 'Non',
    'Document Passeport': e.documentPasseport ? 'Oui' : 'Non',
    'Document Diplôme': e.documentDiplomeCommentaire ? 'Oui' : 'Non',
    'Attestation Réussite': e.documentAttestationReussiteCommentaire ? 'Oui' : 'Non',
    'Relevé Notes Formation': e.documentReleveNotesFormationCommentaire ? 'Oui' : 'Non',
    'Commentaire CIN': e.commentaireCin || 'N/A',
    'Commentaire Bac': e.commentaireBacCommentaire || 'N/A',
    'Commentaire Relevé Bac': e.commentaireReleveNoteBac || 'N/A',
    'Commentaire Passeport': e.commentairePasseport || 'N/A',
    'Commentaire Diplôme': e.commentaireDiplomeCommentaire || 'N/A',
    'Dernière Connexion': formatDate(e.lastSeen),
    'Date Création': formatDate(e.createdAt),
    'Dernière Modification': formatDate(e.updatedAt)
  }));

  const ws = XLSX.utils.json_to_sheet(dataToExport);
  
  const colWidths = Array(70).fill({ wch: 20 });
  ws['!cols'] = colWidths;

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Étudiants');

  const dateNow = new Date();
  const dateString = `${dateNow.getDate()}-${dateNow.getMonth() + 1}-${dateNow.getFullYear()}`;
  const timeString = `${dateNow.getHours()}h${dateNow.getMinutes()}`;
  const fileName = `Etudiants_${dateString}_${timeString}.xlsx`;

  XLSX.writeFile(wb, fileName);
};

export const ExportButton = ({ etudiants, listeCommerciaux, listePartners, etudiantsFiltres }) => {
  const handleExport = () => {
    const dataToExport = etudiantsFiltres && etudiantsFiltres.length > 0 ? etudiantsFiltres : etudiants;
    
    if (dataToExport.length === 0) {
      alert('❌ Aucun étudiant à exporter');
      return;
    }
    
    exportToExcel(dataToExport, listeCommerciaux, listePartners);
    alert(`✅ Export réussi: ${dataToExport.length} étudiant(s) exporté(s)`);
  };

  return (
    <button 
      onClick={handleExport}
      className="btn-export-excel"
      title={`Exporter ${etudiantsFiltres?.length || etudiants.length} étudiant(s) vers Excel`}
    >
      <FileDown size={18} />
      <span>Exporter Excel</span>
      <span className="export-count">
        ({etudiantsFiltres?.length || etudiants.length})
      </span>
    </button>
  );
};