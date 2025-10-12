import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Plus, Edit, Trash2, Eye, Calendar, AlertCircle,
  Check, X, Clock, MessageSquare, Users
} from 'lucide-react';
import SidebarProf from '../components/SidebarProf';

const GestionAnnonces = () => {
  const [annonces, setAnnonces] = useState([]);
  const [coursDisponibles, setCoursDisponibles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modeEdition, setModeEdition] = useState(false);
  const [annonceEnCours, setAnnonceEnCours] = useState(null);
  
  const [formData, setFormData] = useState({
    titre: '',
    description: '',
    cours: [],
    dateDebut: '',
    dateFin: '',
    priorite: 'normale'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const [annoncesRes, profilRes] = await Promise.all([
        axios.get('http://195.179.229.230:5000/api2/professeur/annonces', config),
        axios.get('http://195.179.229.230:5000/api2/professeur/profile', config)
      ]);
      
      setAnnonces(annoncesRes.data);
      setCoursDisponibles(profilRes.data.cours || []);
      
    } catch (err) {
      console.error('Erreur:', err);
      alert('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      if (modeEdition && annonceEnCours) {
        await axios.put(
          `http://195.179.229.230:5000/api2/professeur/annonces/${annonceEnCours._id}`,
          formData,
          config
        );
        alert('Annonce modifiée avec succès');
      } else {
        await axios.post(
          'http://195.179.229.230:5000/api2/professeur/annonces',
          formData,
          config
        );
        alert('Annonce créée avec succès');
      }
      
      resetForm();
      fetchData();
      
    } catch (err) {
      console.error('Erreur:', err);
      alert(err.response?.data?.message || 'Erreur lors de la sauvegarde');
    }
  };

  const handleEdit = (annonce) => {
    setModeEdition(true);
    setAnnonceEnCours(annonce);
    setFormData({
      titre: annonce.titre,
      description: annonce.description,
      cours: annonce.cours,
      dateDebut: annonce.dateDebut.split('T')[0],
      dateFin: annonce.dateFin.split('T')[0],
      priorite: annonce.priorite
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette annonce ?')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      await axios.delete(
        `http://195.179.229.230:5000/api2/professeur/annonces/${id}`,
        config
      );
      
      alert('Annonce supprimée avec succès');
      fetchData();
      
    } catch (err) {
      console.error('Erreur:', err);
      alert('Erreur lors de la suppression');
    }
  };

  const toggleActif = async (annonce) => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      await axios.put(
        `http://195.179.229.230:5000/api2/professeur/annonces/${annonce._id}`,
        { actif: !annonce.actif },
        config
      );
      
      fetchData();
      
    } catch (err) {
      console.error('Erreur:', err);
      alert('Erreur lors de la modification du statut');
    }
  };

  const resetForm = () => {
    setFormData({
      titre: '',
      description: '',
      cours: [],
      dateDebut: '',
      dateFin: '',
      priorite: 'normale'
    });
    setShowModal(false);
    setModeEdition(false);
    setAnnonceEnCours(null);
  };

  const handleCoursChange = (cours) => {
    const newCours = formData.cours.includes(cours)
      ? formData.cours.filter(c => c !== cours)
      : [...formData.cours, cours];
    setFormData({ ...formData, cours: newCours });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const estActive = (annonce) => {
    const maintenant = new Date();
    const debut = new Date(annonce.dateDebut);
    const fin = new Date(annonce.dateFin);
    return annonce.actif && debut <= maintenant && fin >= maintenant;
  };

  const getPrioriteColor = (priorite) => {
    switch(priorite) {
      case 'urgente': return '#dc2626';
      case 'importante': return '#f59e0b';
      default: return '#3b82f6';
    }
  };

  const getPrioriteLabel = (priorite) => {
    switch(priorite) {
      case 'urgente': return 'Urgente';
      case 'importante': return 'Importante';
      default: return 'Normale';
    }
  };

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 25%, #f3e8ff 100%)',
      padding: '20px',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    },
    content: {
      maxWidth: '1400px',
      margin: '0 auto'
    },
    header: {
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(10px)',
      borderRadius: '20px',
      padding: '30px',
      marginBottom: '30px',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: '20px'
    },
    title: {
      fontSize: '32px',
      fontWeight: '700',
      color: '#1f2937',
      margin: '0',
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    btnPrimary: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '12px 24px',
      background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
      color: 'white',
      border: 'none',
      borderRadius: '12px',
      fontSize: '16px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '20px',
      marginBottom: '30px'
    },
    statCard: {
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(10px)',
      borderRadius: '16px',
      padding: '24px',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      transition: 'all 0.3s ease'
    },
    statIcon: {
      width: '48px',
      height: '48px',
      borderRadius: '12px',
      background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white'
    },
    statValue: {
      fontSize: '28px',
      fontWeight: '700',
      color: '#1f2937',
      margin: '0'
    },
    statLabel: {
      fontSize: '14px',
      color: '#6b7280',
      margin: '4px 0 0 0'
    },
    annoncesGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
      gap: '24px'
    },
    annonceCard: {
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(10px)',
      borderRadius: '20px',
      padding: '24px',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      transition: 'all 0.3s ease',
      position: 'relative',
      overflow: 'hidden'
    },
    decorativeCircle: {
      position: 'absolute',
      top: '-50px',
      right: '-50px',
      width: '100px',
      height: '100px',
      borderRadius: '50%',
      background: 'linear-gradient(45deg, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1))',
      zIndex: 0
    },
    annonceHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '16px',
      position: 'relative',
      zIndex: 1
    },
    titleSection: {
      flex: 1
    },
    annonceTitle: {
      fontSize: '20px',
      fontWeight: '600',
      color: '#1f2937',
      margin: '0 0 8px 0',
      lineHeight: '1.3'
    },
    prioriteBadge: {
      display: 'inline-flex',
      alignItems: 'center',
      padding: '4px 12px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: '600',
      color: 'white'
    },
    actions: {
      display: 'flex',
      gap: '8px',
      flexShrink: 0
    },
    btnIcon: {
      width: '36px',
      height: '36px',
      borderRadius: '10px',
      border: 'none',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.3s ease',
      background: '#f3f4f6'
    },
    btnToggle: {
      width: '36px',
      height: '36px',
      borderRadius: '10px',
      border: 'none',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.3s ease',
      color: 'white'
    },
    description: {
      fontSize: '14px',
      color: '#4b5563',
      lineHeight: '1.6',
      marginBottom: '16px',
      position: 'relative',
      zIndex: 1
    },
    details: {
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      marginBottom: '16px',
      position: 'relative',
      zIndex: 1
    },
    detailItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      fontSize: '14px',
      color: '#4b5563'
    },
    coursContainer: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '8px',
      marginBottom: '16px',
      position: 'relative',
      zIndex: 1
    },
    coursTag: {
      padding: '6px 12px',
      background: 'linear-gradient(135deg, #e0f2fe 0%, #ddd6fe 100%)',
      borderRadius: '8px',
      fontSize: '13px',
      fontWeight: '500',
      color: '#1f2937'
    },
    statutBadge: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      padding: '6px 12px',
      borderRadius: '20px',
      fontSize: '13px',
      fontWeight: '600',
      position: 'relative',
      zIndex: 1
    },
    modalOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    },
    modalContent: {
      background: 'white',
      borderRadius: '20px',
      width: '100%',
      maxWidth: '600px',
      maxHeight: '90vh',
      overflow: 'auto',
      boxShadow: '0 25px 50px rgba(0, 0, 0, 0.3)'
    },
    modalHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '24px',
      borderBottom: '1px solid #e5e7eb'
    },
    modalTitle: {
      fontSize: '24px',
      fontWeight: '700',
      color: '#1f2937',
      margin: 0
    },
    btnClose: {
      width: '36px',
      height: '36px',
      borderRadius: '10px',
      border: 'none',
      background: '#f3f4f6',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.3s ease'
    },
    form: {
      padding: '24px'
    },
    formGroup: {
      marginBottom: '20px'
    },
    label: {
      display: 'block',
      fontSize: '14px',
      fontWeight: '600',
      color: '#374151',
      marginBottom: '8px'
    },
    input: {
      width: '100%',
      padding: '12px',
      border: '2px solid #e5e7eb',
      borderRadius: '12px',
      fontSize: '16px',
      outline: 'none',
      transition: 'all 0.3s ease',
      boxSizing: 'border-box'
    },
    textarea: {
      width: '100%',
      padding: '12px',
      border: '2px solid #e5e7eb',
      borderRadius: '12px',
      fontSize: '16px',
      outline: 'none',
      transition: 'all 0.3s ease',
      resize: 'vertical',
      fontFamily: 'inherit',
      boxSizing: 'border-box'
    },
    coursSelection: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
      gap: '12px'
    },
    checkboxLabel: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '10px',
      background: '#f9fafb',
      borderRadius: '8px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      border: '2px solid transparent'
    },
    formRow: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '16px'
    },
    select: {
      width: '100%',
      padding: '12px',
      border: '2px solid #e5e7eb',
      borderRadius: '12px',
      fontSize: '16px',
      outline: 'none',
      transition: 'all 0.3s ease',
      background: 'white',
      cursor: 'pointer',
      boxSizing: 'border-box'
    },
    formActions: {
      display: 'flex',
      gap: '12px',
      justifyContent: 'flex-end',
      marginTop: '24px'
    },
    btnSecondary: {
      padding: '12px 24px',
      background: '#f3f4f6',
      color: '#374151',
      border: 'none',
      borderRadius: '12px',
      fontSize: '16px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease'
    },
    emptyState: {
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(10px)',
      borderRadius: '16px',
      padding: '60px 40px',
      textAlign: 'center',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
      border: '1px solid rgba(255, 255, 255, 0.2)'
    },
    emptyText: {
      fontSize: '18px',
      color: '#6b7280',
      margin: '16px 0 0 0'
    },
    loading: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      fontSize: '20px',
      color: '#6b7280'
    }
  };

  const mediaQueries = `
    @media (hover: hover) {
      .btn-primary:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 20px rgba(59, 130, 246, 0.4);
      }
      .stat-card:hover {
        transform: translateY(-3px);
        box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
      }
      .annonce-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
      }
      .btn-icon:hover {
        background: #e5e7eb;
        transform: scale(1.1);
      }
      .btn-close:hover {
        background: #e5e7eb;
        transform: rotate(90deg);
      }
      .checkbox-label:hover {
        background: #f3f4f6;
        border-color: #3b82f6;
      }
      .input:focus, .textarea:focus, .select:focus {
        border-color: #3b82f6;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
      }
      .btn-secondary:hover {
        background: #e5e7eb;
      }
    }

    @media (max-width: 768px) {
      .header {
        flex-direction: column;
        align-items: stretch;
      }
      .annonces-grid {
        grid-template-columns: 1fr;
      }
      .form-row {
        grid-template-columns: 1fr;
      }
      .cours-selection {
        grid-template-columns: 1fr;
      }
    }
  `;

  if (loading) {
    return <div style={styles.loading}>Chargement...</div>;
  }

  return (
    <div style={styles.container}>
      <SidebarProf onLogout={() => {
        localStorage.removeItem('token');
        window.location.href = '/';
      }} />
      
      <style>{mediaQueries}</style>
      
      <div style={styles.content}>
        <div style={styles.header}>
          <h1 style={styles.title}>
            <MessageSquare size={32} />
            Gestion des Annonces
          </h1>
          <button 
            style={styles.btnPrimary}
            className="btn-primary"
            onClick={() => setShowModal(true)}
          >
            <Plus size={20} />
            Nouvelle Annonce
          </button>
        </div>

        <div style={styles.statsGrid}>
          <div style={styles.statCard} className="stat-card">
            <div style={styles.statIcon}>
              <MessageSquare size={24} />
            </div>
            <div>
              <p style={styles.statValue}>{annonces.length}</p>
              <p style={styles.statLabel}>Total Annonces</p>
            </div>
          </div>
          <div style={styles.statCard} className="stat-card">
            <div style={{...styles.statIcon, background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'}}>
              <Check size={24} />
            </div>
            <div>
              <p style={styles.statValue}>
                {annonces.filter(a => estActive(a)).length}
              </p>
              <p style={styles.statLabel}>Actives</p>
            </div>
          </div>
          <div style={styles.statCard} className="stat-card">
            <div style={{...styles.statIcon, background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'}}>
              <Clock size={24} />
            </div>
            <div>
              <p style={styles.statValue}>
                {annonces.filter(a => new Date(a.dateFin) < new Date()).length}
              </p>
              <p style={styles.statLabel}>Expirées</p>
            </div>
          </div>
        </div>

        {annonces.length === 0 ? (
          <div style={styles.emptyState}>
            <MessageSquare size={48} color="#9ca3af" />
            <p style={styles.emptyText}>Aucune annonce créée</p>
          </div>
        ) : (
          <div style={styles.annoncesGrid}>
            {annonces.map(annonce => (
              <div key={annonce._id} style={styles.annonceCard} className="annonce-card">
                <div style={styles.decorativeCircle}></div>
                
                <div style={styles.annonceHeader}>
                  <div style={styles.titleSection}>
                    <h3 style={styles.annonceTitle}>{annonce.titre}</h3>
                    <span 
                      style={{
                        ...styles.prioriteBadge,
                        backgroundColor: getPrioriteColor(annonce.priorite)
                      }}
                    >
                      {getPrioriteLabel(annonce.priorite)}
                    </span>
                  </div>
                  <div style={styles.actions}>
                    <button
                      onClick={() => toggleActif(annonce)}
                      style={{
                        ...styles.btnToggle,
                        backgroundColor: annonce.actif ? '#10b981' : '#6b7280'
                      }}
                      title={annonce.actif ? 'Désactiver' : 'Activer'}
                      className="btn-icon"
                    >
                      {annonce.actif ? <Check size={16} /> : <X size={16} />}
                    </button>
                    <button
                      onClick={() => handleEdit(annonce)}
                      style={styles.btnIcon}
                      className="btn-icon"
                    >
                      <Edit size={18} color="#3b82f6" />
                    </button>
                    <button
                      onClick={() => handleDelete(annonce._id)}
                      style={styles.btnIcon}
                      className="btn-icon"
                    >
                      <Trash2 size={18} color="#dc2626" />
                    </button>
                  </div>
                </div>

                <p style={styles.description}>{annonce.description}</p>

                <div style={styles.details}>
                  <div style={styles.detailItem}>
                    <Calendar size={16} color="#3b82f6" />
                    <span>
                      Du {formatDate(annonce.dateDebut)} au {formatDate(annonce.dateFin)}
                    </span>
                  </div>
                  <div style={styles.detailItem}>
                    <Users size={16} color="#10b981" />
                    <span>{annonce.cours.length} cours concerné(s)</span>
                  </div>
                  <div style={styles.detailItem}>
                    <Eye size={16} color="#f59e0b" />
                    <span>{annonce.vuesPar?.length || 0} vue(s)</span>
                  </div>
                </div>

                <div style={styles.coursContainer}>
                  {annonce.cours.map((cours, index) => (
                    <span key={index} style={styles.coursTag}>{cours}</span>
                  ))}
                </div>

                <div>
                  {estActive(annonce) ? (
                    <span style={{
                      ...styles.statutBadge,
                      background: '#d1fae5',
                      color: '#065f46'
                    }}>
                      <Check size={14} /> Active
                    </span>
                  ) : new Date(annonce.dateFin) < new Date() ? (
                    <span style={{
                      ...styles.statutBadge,
                      background: '#fee2e2',
                      color: '#991b1b'
                    }}>
                      <Clock size={14} /> Expirée
                    </span>
                  ) : (
                    <span style={{
                      ...styles.statutBadge,
                      background: '#fef3c7',
                      color: '#92400e'
                    }}>
                      <Clock size={14} /> En attente
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div style={styles.modalOverlay} onClick={resetForm}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>
                {modeEdition ? 'Modifier l\'annonce' : 'Nouvelle annonce'}
              </h2>
              <button onClick={resetForm} style={styles.btnClose} className="btn-close">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Titre *</label>
                <input
                  type="text"
                  value={formData.titre}
                  onChange={(e) => setFormData({...formData, titre: e.target.value})}
                  required
                  placeholder="Ex: Examen reporté, Nouvelle documentation..."
                  style={styles.input}
                  className="input"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Description *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  required
                  rows="4"
                  placeholder="Décrivez votre annonce en détail..."
                  style={styles.textarea}
                  className="textarea"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Cours concernés *</label>
                <div style={styles.coursSelection}>
                  {coursDisponibles.map(cours => (
                    <label 
                      key={cours} 
                      style={{
                        ...styles.checkboxLabel,
                        borderColor: formData.cours.includes(cours) ? '#3b82f6' : 'transparent',
                        background: formData.cours.includes(cours) ? '#eff6ff' : '#f9fafb'
                      }}
                      className="checkbox-label"
                    >
                      <input
                        type="checkbox"
                        checked={formData.cours.includes(cours)}
                        onChange={() => handleCoursChange(cours)}
                      />
                      <span>{cours}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Date de début *</label>
                  <input
                    type="date"
                    value={formData.dateDebut}
                    onChange={(e) => setFormData({...formData, dateDebut: e.target.value})}
                    required
                    style={styles.input}
                    className="input"
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Date de fin *</label>
                  <input
                    type="date"
                    value={formData.dateFin}
                    onChange={(e) => setFormData({...formData, dateFin: e.target.value})}
                    required
                    style={styles.input}
                    className="input"
                  />
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Priorité</label>
                <select
                  value={formData.priorite}
                  onChange={(e) => setFormData({...formData, priorite: e.target.value})}
                  style={styles.select}
                  className="select"
                >
                  <option value="normale">Normale</option>
                  <option value="importante">Importante</option>
                  <option value="urgente">Urgente</option>
                </select>
              </div>

              <div style={styles.formActions}>
                <button 
                  type="button" 
                  onClick={resetForm} 
                  style={styles.btnSecondary}
                  className="btn-secondary"
                >
                  Annuler
                </button>
                <button 
                  type="submit" 
                  style={styles.btnPrimary}
                  className="btn-primary"
                >
                  {modeEdition ? 'Modifier' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionAnnonces;