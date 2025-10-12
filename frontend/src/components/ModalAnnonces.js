import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  X, AlertCircle, Calendar, User, CheckCircle, 
  MessageSquare, Clock, Bell
} from 'lucide-react';
import './ModalAnnonces.css';

const ModalAnnonces = () => {
  const [annonces, setAnnonces] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [annoncesNonVues, setAnnoncesNonVues] = useState(0);

  useEffect(() => {
    fetchAnnonces();
    // Vérifier les nouvelles annonces toutes les 5 minutes
    const interval = setInterval(fetchAnnonces, 300000);
    return () => clearInterval(interval);
  }, []);

  const fetchAnnonces = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const [annoncesRes, countRes] = await Promise.all([
        axios.get('http://195.179.229.230:5000/api2/etudiant/annonces', config),
        axios.get('http://195.179.229.230:5000/api2/etudiant/annonces/non-vues/count', config)
      ]);
      
      setAnnonces(annoncesRes.data);
      setAnnoncesNonVues(countRes.data.count);
      
      // Afficher le modal automatiquement s'il y a des annonces non vues
      if (countRes.data.count > 0) {
        setShowModal(true);
      }
      
    } catch (err) {
      console.error('Erreur récupération annonces:', err);
    } finally {
      setLoading(false);
    }
  };

  const marquerCommeVue = async (annonceId) => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      await axios.post(
        `http://195.179.229.230:5000/api2/etudiant/annonces/${annonceId}/vue`,
        {},
        config
      );
      
      // Mettre à jour le compteur
      setAnnoncesNonVues(prev => Math.max(0, prev - 1));
      
    } catch (err) {
      console.error('Erreur marquage vue:', err);
    }
  };

  const handleClose = () => {
    // Marquer toutes les annonces comme vues
    annonces.forEach(annonce => {
      marquerCommeVue(annonce._id);
    });
    setShowModal(false);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPrioriteColor = (priorite) => {
    switch(priorite) {
      case 'urgente': return '#dc2626';
      case 'importante': return '#f59e0b';
      default: return '#3b82f6';
    }
  };

  const getPrioriteIcon = (priorite) => {
    switch(priorite) {
      case 'urgente': return <AlertCircle size={20} />;
      case 'importante': return <Bell size={20} />;
      default: return <MessageSquare size={20} />;
    }
  };

  const getPrioriteLabel = (priorite) => {
    switch(priorite) {
      case 'urgente': return 'URGENT';
      case 'importante': return 'Important';
      default: return 'Information';
    }
  };

  if (!showModal || annonces.length === 0) {
    return null;
  }

  return (
    <div className="modal-annonces-overlay">
      <div className="modal-annonces-container">
        <div className="modal-annonces-header">
          <div className="header-left">
            <Bell size={24} className="header-icon" />
            <h2>Nouvelles Annonces</h2>
            {annoncesNonVues > 0 && (
              <span className="badge-non-vues">{annoncesNonVues}</span>
            )}
          </div>
          <button onClick={handleClose} className="btn-close-modal">
            <X size={24} />
          </button>
        </div>

        <div className="modal-annonces-content">
          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Chargement des annonces...</p>
            </div>
          ) : (
            <div className="annonces-list">
              {annonces.map((annonce, index) => (
                <div 
                  key={annonce._id} 
                  className="annonce-item"
                  style={{ 
                    borderLeftColor: getPrioriteColor(annonce.priorite),
                    animation: `slideIn 0.3s ease-out ${index * 0.1}s both`
                  }}
                >
                  <div className="annonce-item-header">
                    <div 
                      className="priorite-badge"
                      style={{ backgroundColor: getPrioriteColor(annonce.priorite) }}
                    >
                      {getPrioriteIcon(annonce.priorite)}
                      <span>{getPrioriteLabel(annonce.priorite)}</span>
                    </div>
                  </div>

                  <h3 className="annonce-titre">{annonce.titre}</h3>
                  
                  <p className="annonce-description">{annonce.description}</p>

                  <div className="annonce-meta">
                    <div className="meta-item">
                      <User size={16} />
                      <span>Prof. {annonce.professeur?.nom || 'N/A'}</span>
                    </div>
                    <div className="meta-item">
                      <Calendar size={16} />
                      <span>Jusqu'au {formatDate(annonce.dateFin)}</span>
                    </div>
                  </div>

                  <div className="annonce-cours-tags">
                    {annonce.cours.map((cours, idx) => (
                      <span key={idx} className="cours-tag-mini">
                        {cours}
                      </span>
                    ))}
                  </div>

                  <button 
                    onClick={() => marquerCommeVue(annonce._id)}
                    className="btn-marquer-vue"
                  >
                    <CheckCircle size={16} />
                    Marquer comme lu
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="modal-annonces-footer">
          <button onClick={handleClose} className="btn-tout-compris">
            Tout compris
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalAnnonces;