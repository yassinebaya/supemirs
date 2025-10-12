import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebarpaiment';
import {
  DollarSign,
  Users,
  Edit2,
  X,
  Check,
  AlertCircle,
  Calendar,
  BookOpen,
  TrendingUp,
  RefreshCw,
  Filter,
  Search
} from 'lucide-react';

const API_BASE_URL = 'http://195.179.229.230:5000/api2';

const EtudiantsSansPrix = () => {
  const [etudiants, setEtudiants] = useState([]);
  const [filteredEtudiants, setFilteredEtudiants] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedEtudiant, setSelectedEtudiant] = useState(null);
  const [formData, setFormData] = useState({
    prixTotal: '',
    modePaiement: 'mensuel'
  });
  const [message, setMessage] = useState({ text: '', type: '' });
  const [submitting, setSubmitting] = useState(false);
  const [statistiques, setStatistiques] = useState(null);
  const [filtreAnneeScolaire, setFiltreAnneeScolaire] = useState('2025/2026');

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/';
  };

  const getAuthConfig = () => {
    const token = localStorage.getItem('token');
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 5000);
  };

  const fetchStatistiques = async () => {
    try {
      const config = getAuthConfig();
      const { data } = await axios.get(
        `${API_BASE_URL}/paiement/etudiants/statistiques?anneeScolaire=${filtreAnneeScolaire}`,
        config
      );
      setStatistiques(data);
    } catch (err) {
      console.error('Erreur chargement statistiques:', err);
    }
  };

  const fetchEtudiantsSansPrix = async () => {
    setLoading(true);
    try {
      const config = getAuthConfig();
      const { data } = await axios.get(
        `${API_BASE_URL}/paiement/etudiants/sans-prix?anneeScolaire=${filtreAnneeScolaire}`,
        config
      );
      setEtudiants(data);
      setFilteredEtudiants(data);
    } catch (err) {
      console.error('Erreur chargement:', err);
      showMessage('❌ Erreur lors du chargement des étudiants', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEtudiantsSansPrix();
    fetchStatistiques();
  }, [filtreAnneeScolaire]);

  const handleOpenModal = (etudiant) => {
    setSelectedEtudiant(etudiant);
    setFormData({
      prixTotal: '',
      modePaiement: 'mensuel'
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedEtudiant(null);
    setFormData({ prixTotal: '', modePaiement: 'mensuel' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.prixTotal || parseFloat(formData.prixTotal) <= 0) {
      showMessage('❌ Le prix total doit être supérieur à 0', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const config = getAuthConfig();
      await axios.put(
        `${API_BASE_URL}/paiement/etudiants/${selectedEtudiant._id}/prix`,
        {
          prixTotal: parseFloat(formData.prixTotal),
          modePaiement: formData.modePaiement
        },
        config
      );

      showMessage('✅ Prix total mis à jour avec succès', 'success');
      handleCloseModal();
      fetchEtudiantsSansPrix();
      fetchStatistiques();
    } catch (err) {
      console.error('Erreur mise à jour:', err);
      const errorMsg = err.response?.data?.error || 'Erreur lors de la mise à jour';
      showMessage(`❌ ${errorMsg}`, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    if (!term.trim()) {
      setFilteredEtudiants(etudiants);
      return;
    }

    const filtered = etudiants.filter(etudiant => {
      const searchLower = term.toLowerCase();
      return (
        etudiant.nomComplet?.toLowerCase().includes(searchLower) ||
        etudiant.email?.toLowerCase().includes(searchLower) ||
        etudiant.typeFormation?.toLowerCase().includes(searchLower) ||
        etudiant.specialite?.toLowerCase().includes(searchLower) ||
        etudiant.specialiteLicencePro?.toLowerCase().includes(searchLower) ||
        etudiant.specialiteMasterPro?.toLowerCase().includes(searchLower) ||
        etudiant.niveau?.toString().includes(searchLower) ||
        etudiant.anneeScolaire?.toLowerCase().includes(searchLower)
      );
    });
    setFilteredEtudiants(filtered);
  };

  const handleRefresh = () => {
    fetchEtudiantsSansPrix();
    fetchStatistiques();
    setSearchTerm('');
    showMessage('🔄 Données actualisées', 'success');
  };

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f0f9ff 0%, #a6dbff 25%, #f3e8ff 100%)',
      padding: '20px'
    },
    mainContent: {
      maxWidth: '1400px',
      margin: '0 auto'
    },
    header: {
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '24px',
      marginBottom: '24px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
    },
    headerTop: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: '16px'
    },
    title: {
      fontSize: '28px',
      fontWeight: 'bold',
      color: '#1f2937',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      marginBottom: '8px'
    },
    subtitle: {
      color: '#6b7280',
      fontSize: '14px'
    },
    headerActions: {
      display: 'flex',
      gap: '12px',
      alignItems: 'center'
    },
    filterSelect: {
      padding: '10px 16px',
      borderRadius: '8px',
      border: '1px solid #d1d5db',
      fontSize: '14px',
      backgroundColor: 'white',
      cursor: 'pointer',
      outline: 'none'
    },
    refreshButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      backgroundColor: '#3b82f6',
      color: 'white',
      border: 'none',
      padding: '10px 16px',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.2s ease'
    },
    statsContainer: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '16px',
      marginBottom: '24px'
    },
    statCard: {
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '20px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      display: 'flex',
      alignItems: 'center',
      gap: '16px'
    },
    statIcon: {
      width: '48px',
      height: '48px',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    statContent: {
      flex: 1
    },
    statLabel: {
      fontSize: '14px',
      color: '#6b7280',
      marginBottom: '4px'
    },
    statValue: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#1f2937'
    },
    tableContainer: {
      backgroundColor: 'white',
      borderRadius: '12px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      overflow: 'hidden'
    },
    tableWrapper: {
      overflowX: 'auto'
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      minWidth: '900px'
    },
    th: {
      backgroundColor: '#f9fafb',
      padding: '16px',
      textAlign: 'left',
      fontSize: '14px',
      fontWeight: '600',
      color: '#374151',
      borderBottom: '2px solid #e5e7eb',
      whiteSpace: 'nowrap'
    },
    td: {
      padding: '16px',
      borderBottom: '1px solid #e5e7eb',
      fontSize: '14px',
      color: '#1f2937'
    },
    actionButton: {
      backgroundColor: '#3b82f6',
      color: 'white',
      border: 'none',
      padding: '8px 16px',
      borderRadius: '6px',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      transition: 'all 0.2s ease',
      whiteSpace: 'nowrap'
    },
    modal: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    },
    modalContent: {
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '32px',
      width: '100%',
      maxWidth: '500px',
      maxHeight: '90vh',
      overflowY: 'auto',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
    },
    modalHeader: {
      fontSize: '20px',
      fontWeight: 'bold',
      color: '#1f2937',
      marginBottom: '24px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    etudiantInfo: {
      backgroundColor: '#f9fafb',
      padding: '16px',
      borderRadius: '8px',
      marginBottom: '24px'
    },
    etudiantName: {
      fontWeight: '600',
      marginBottom: '8px',
      fontSize: '16px'
    },
    etudiantDetail: {
      fontSize: '14px',
      color: '#6b7280',
      marginBottom: '4px',
      display: 'flex',
      alignItems: 'center',
      gap: '6px'
    },
    formGroup: {
      marginBottom: '20px'
    },
    label: {
      display: 'block',
      fontSize: '14px',
      fontWeight: '500',
      color: '#374151',
      marginBottom: '8px'
    },
    input: {
      width: '100%',
      padding: '12px',
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      fontSize: '14px',
      outline: 'none',
      transition: 'all 0.2s ease',
      boxSizing: 'border-box'
    },
    select: {
      width: '100%',
      padding: '12px',
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      fontSize: '14px',
      outline: 'none',
      backgroundColor: 'white',
      cursor: 'pointer',
      boxSizing: 'border-box'
    },
    modeInfo: {
      backgroundColor: '#eff6ff',
      border: '1px solid #bfdbfe',
      borderRadius: '6px',
      padding: '12px',
      fontSize: '13px',
      color: '#1e40af',
      marginTop: '8px'
    },
    buttonGroup: {
      display: 'flex',
      gap: '12px',
      justifyContent: 'flex-end',
      marginTop: '24px'
    },
    cancelButton: {
      backgroundColor: '#e5e7eb',
      color: '#374151',
      border: 'none',
      padding: '10px 20px',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.2s ease'
    },
    submitButton: {
      backgroundColor: '#10b981',
      color: 'white',
      border: 'none',
      padding: '10px 20px',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      transition: 'all 0.2s ease'
    },
    emptyState: {
      textAlign: 'center',
      padding: '60px 20px',
      color: '#6b7280'
    },
    emptyIcon: {
      marginBottom: '16px',
      display: 'flex',
      justifyContent: 'center'
    },
    emptyTitle: {
      fontSize: '18px',
      fontWeight: '600',
      marginBottom: '8px',
      color: '#1f2937'
    },
    message: {
      padding: '16px',
      borderRadius: '8px',
      marginBottom: '20px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      fontSize: '14px',
      fontWeight: '500'
    },
    messageSuccess: {
      backgroundColor: '#d1fae5',
      color: '#065f46',
      border: '1px solid #6ee7b7'
    },
    messageError: {
      backgroundColor: '#fee2e2',
      color: '#991b1b',
      border: '1px solid #fca5a5'
    },
    badge: {
      display: 'inline-block',
      padding: '4px 8px',
      borderRadius: '4px',
      fontSize: '12px',
      fontWeight: '500'
    },
    badgeInfo: {
      backgroundColor: '#dbeafe',
      color: '#1e40af'
    },
    searchContainer: {
      position: 'relative',
      maxWidth: '400px'
    },
    searchInput: {
      width: '100%',
      padding: '10px 40px 10px 16px',
      borderRadius: '8px',
      border: '1px solid #d1d5db',
      fontSize: '14px',
      outline: 'none',
      transition: 'all 0.2s ease',
      boxSizing: 'border-box'
    },
    searchIcon: {
      position: 'absolute',
      right: '12px',
      top: '50%',
      transform: 'translateY(-50%)',
      pointerEvents: 'none'
    },
    searchStats: {
      backgroundColor: '#f3f4f6',
      padding: '12px 16px',
      borderRadius: '8px',
      marginBottom: '16px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '14px',
      color: '#374151'
    }
  };

  const getModesPaiementInfo = () => {
    const modes = {
      mensuel: { tranches: 10, description: '10 mensualités' },
      trimestriel: { tranches: 3, description: '3 paiements trimestriels' },
      semestriel: { tranches: 2, description: '2 paiements semestriels' },
      annuel: { tranches: 1, description: '1 paiement annuel' }
    };
    return modes[formData.modePaiement] || modes.mensuel;
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <Sidebar onLogout={handleLogout} />
        <div style={styles.mainContent}>
          <div style={{ ...styles.tableContainer, padding: '40px', textAlign: 'center' }}>
            <RefreshCw size={32} color="#3b82f6" style={{ animation: 'spin 1s linear infinite' }} />
            <p style={{ marginTop: '16px', color: '#6b7280' }}>Chargement des données...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <Sidebar onLogout={handleLogout} />

      <div style={styles.mainContent}>
        {message.text && (
          <div style={{
            ...styles.message,
            ...(message.type === 'error' ? styles.messageError : styles.messageSuccess)
          }}>
            {message.type === 'error' ? <AlertCircle size={20} /> : <Check size={20} />}
            {message.text}
          </div>
        )}

        <div style={styles.header}>
          <div style={styles.headerTop}>
            <div>
              <h1 style={styles.title}>
                Étudiants Sans Prix Total
              </h1>
              <p style={styles.subtitle}>
                Gérez les étudiants qui n'ont pas encore de prix total défini
              </p>
            </div>

            <div style={styles.headerActions}>
              <div style={styles.searchContainer}>
                <input
                  type="text"
                  placeholder="Rechercher par nom, email, formation..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  style={styles.searchInput}
                  onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                  onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                />
                <div style={styles.searchIcon}>
                  <Search size={16} color="#6b7280" />
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Filter size={16} color="#6b7280" />
                <select
                  value={filtreAnneeScolaire}
                  onChange={(e) => setFiltreAnneeScolaire(e.target.value)}
                  style={styles.filterSelect}
                >
                  <option value="2024/2025">2024/2025</option>
                  <option value="2025/2026">2025/2026</option>
                  <option value="2026/2027">2026/2027</option>
                </select>
              </div>

              <button onClick={handleRefresh} style={styles.refreshButton}>
                <RefreshCw size={16} />
                Actualiser
              </button>
            </div>
          </div>
        </div>

        {statistiques && (
          <div style={styles.statsContainer}>
            <div style={styles.statCard}>
              <div style={{ ...styles.statIcon, backgroundColor: '#dbeafe' }}>
                <Users size={24} color="#3b82f6" />
              </div>
              <div style={styles.statContent}>
                <div style={styles.statLabel}>Total Étudiants</div>
                <div style={styles.statValue}>{statistiques.totalEtudiants}</div>
              </div>
            </div>

            <div style={styles.statCard}>
              <div style={{ ...styles.statIcon, backgroundColor: '#fef3c7' }}>
                <AlertCircle size={24} color="#f59e0b" />
              </div>
              <div style={styles.statContent}>
                <div style={styles.statLabel}>Sans Prix</div>
                <div style={styles.statValue}>{statistiques.etudiantsSansPrix}</div>
              </div>
            </div>

            <div style={styles.statCard}>
              <div style={{ ...styles.statIcon, backgroundColor: '#d1fae5' }}>
                <Check size={24} color="#10b981" />
              </div>
              <div style={styles.statContent}>
                <div style={styles.statLabel}>Avec Prix</div>
                <div style={styles.statValue}>{statistiques.etudiantsAvecPrix}</div>
              </div>
            </div>

            <div style={styles.statCard}>
              <div style={{ ...styles.statIcon, backgroundColor: '#e0e7ff' }}>
                <TrendingUp size={24} color="#6366f1" />
              </div>
              <div style={styles.statContent}>
                <div style={styles.statLabel}>Chiffre d'Affaires</div>
                <div style={styles.statValue}>
                  {statistiques.totalChiffreAffaire.toLocaleString()} MAD
                </div>
              </div>
            </div>
          </div>
        )}

        <div style={styles.tableContainer}>
          {searchTerm && (
            <div style={styles.searchStats}>
              <Search size={16} color="#6b7280" />
              {filteredEtudiants.length} résultat(s) trouvé(s) pour "{searchTerm}"
              {filteredEtudiants.length !== etudiants.length && (
                <span style={{ color: '#6b7280' }}>
                  sur {etudiants.length} étudiants au total
                </span>
              )}
            </div>
          )}

          {filteredEtudiants.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>
                {searchTerm ? <Search size={64} color="#6b7280" /> : <Check size={64} color="#10b981" />}
              </div>
              <h3 style={styles.emptyTitle}>
                {searchTerm ? 'Aucun résultat trouvé' : 'Aucun étudiant sans prix'}
              </h3>
              <p>
                {searchTerm 
                  ? `Aucun étudiant ne correspond à votre recherche "${searchTerm}"`
                  : `Tous les étudiants de l'année ${filtreAnneeScolaire} ont un prix total défini`
                }
              </p>
            </div>
          ) : (
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Nom Complet</th>
                    <th style={styles.th}>Email</th>
                    <th style={styles.th}>Formation</th>
                    <th style={styles.th}>Niveau</th>
                    <th style={styles.th}>Année Scolaire</th>
                    <th style={styles.th}>Date Inscription</th>
                    <th style={styles.th}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEtudiants.map((etudiant) => (
                    <tr key={etudiant._id} style={{ transition: 'background-color 0.2s' }}>
                      <td style={styles.td}>
                        <strong>{etudiant.nomComplet}</strong>
                      </td>
                      <td style={styles.td}>{etudiant.email}</td>
                      <td style={styles.td}>
                        <div>{etudiant.typeFormation || 'Non défini'}</div>
                        {etudiant.specialite && (
                          <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                            {etudiant.specialite}
                          </div>
                        )}
                        {etudiant.specialiteLicencePro && (
                          <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                            {etudiant.specialiteLicencePro}
                          </div>
                        )}
                        {etudiant.specialiteMasterPro && (
                          <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                            {etudiant.specialiteMasterPro}
                          </div>
                        )}
                      </td>
                      <td style={styles.td}>
                        {etudiant.niveau ? (
                          <span style={{ ...styles.badge, ...styles.badgeInfo }}>
                            Niveau {etudiant.niveau}
                          </span>
                        ) : (
                          <span style={{ color: '#9ca3af' }}>-</span>
                        )}
                      </td>
                      <td style={styles.td}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Calendar size={16} color="#6b7280" />
                          {etudiant.anneeScolaire || 'Non défini'}
                        </div>
                      </td>
                      <td style={styles.td}>
                        {etudiant.dateInscription 
                          ? new Date(etudiant.dateInscription).toLocaleDateString('fr-FR')
                          : '-'
                        }
                      </td>
                      <td style={styles.td}>
                        <button
                          onClick={() => handleOpenModal(etudiant)}
                          style={styles.actionButton}
                          onMouseEnter={(e) => e.target.style.backgroundColor = '#2563eb'}
                          onMouseLeave={(e) => e.target.style.backgroundColor = '#3b82f6'}
                        >
                          <Edit2 size={16} />
                          Définir Prix
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {showModal && selectedEtudiant && (
          <div style={styles.modal} onClick={handleCloseModal}>
            <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
              <div style={styles.modalHeader}>
                <span>Définir le Prix Total</span>
                <button
                  onClick={handleCloseModal}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                  onMouseEnter={(e) => e.target.style.opacity = '0.7'}
                  onMouseLeave={(e) => e.target.style.opacity = '1'}
                >
                  <X size={24} color="#6b7280" />
                </button>
              </div>

              <div style={styles.etudiantInfo}>
                <div style={styles.etudiantName}>
                  {selectedEtudiant.nomComplet}
                </div>
                <div style={styles.etudiantDetail}>
                  {selectedEtudiant.email}
                </div>
                {selectedEtudiant.typeFormation && (
                  <div style={styles.etudiantDetail}>
                    <BookOpen size={16} />
                    {selectedEtudiant.typeFormation}
                  </div>
                )}
                {selectedEtudiant.specialite && (
                  <div style={styles.etudiantDetail}>
                    Spécialité: {selectedEtudiant.specialite}
                  </div>
                )}
                {selectedEtudiant.specialiteLicencePro && (
                  <div style={styles.etudiantDetail}>
                    Spécialité: {selectedEtudiant.specialiteLicencePro}
                  </div>
                )}
                {selectedEtudiant.specialiteMasterPro && (
                  <div style={styles.etudiantDetail}>
                    Spécialité: {selectedEtudiant.specialiteMasterPro}
                  </div>
                )}
                {selectedEtudiant.niveau && (
                  <div style={styles.etudiantDetail}>
                    Niveau: {selectedEtudiant.niveau}
                  </div>
                )}
                {selectedEtudiant.anneeScolaire && (
                  <div style={styles.etudiantDetail}>
                    <Calendar size={16} />
                    Année: {selectedEtudiant.anneeScolaire}
                  </div>
                )}
              </div>

              <form onSubmit={handleSubmit}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>
                    Prix Total (MAD) *
                  </label>
                  <input
                    type="number"
                    value={formData.prixTotal}
                    onChange={(e) => setFormData({ ...formData, prixTotal: e.target.value })}
                    placeholder="Ex: 35000"
                    min="1"
                    step="0.01"
                    required
                    style={styles.input}
                    onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                    onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                  />
                  <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                    Entrez le prix total de la formation pour cet étudiant
                  </div>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>
                    Mode de Paiement *
                  </label>
                  <select
                    value={formData.modePaiement}
                    onChange={(e) => setFormData({ ...formData, modePaiement: e.target.value })}
                    required
                    style={styles.select}
                    onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                    onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                  >
                    <option value="mensuel">Mensuel (10 tranches)</option>
                    <option value="trimestriel">Trimestriel (3 tranches)</option>
                    <option value="semestriel">Semestriel (2 tranches)</option>
                    <option value="annuel">Annuel (1 tranche)</option>
                  </select>

                  {formData.prixTotal && (
                    <div style={styles.modeInfo}>
                      <strong>{getModesPaiementInfo().description}</strong>
                      <div style={{ marginTop: '4px' }}>
                        Montant par tranche: {' '}
                        <strong>
                          {(parseFloat(formData.prixTotal) / getModesPaiementInfo().tranches).toLocaleString('fr-FR', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          })} MAD
                        </strong>
                      </div>
                    </div>
                  )}
                </div>

                <div style={styles.buttonGroup}>
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    style={styles.cancelButton}
                    disabled={submitting}
                    onMouseEnter={(e) => !submitting && (e.target.style.backgroundColor = '#d1d5db')}
                    onMouseLeave={(e) => !submitting && (e.target.style.backgroundColor = '#e5e7eb')}
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    style={{
                      ...styles.submitButton,
                      opacity: submitting ? 0.5 : 1,
                      cursor: submitting ? 'not-allowed' : 'pointer'
                    }}
                    disabled={submitting}
                    onMouseEnter={(e) => !submitting && (e.target.style.backgroundColor = '#059669')}
                    onMouseLeave={(e) => !submitting && (e.target.style.backgroundColor = '#10b981')}
                  >
                    <Check size={16} />
                    {submitting ? 'Enregistrement...' : 'Enregistrer'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }

          table tbody tr:hover {
            background-color: #f9fafb;
          }
        `}
      </style>
    </div>
  );
};

export default EtudiantsSansPrix;