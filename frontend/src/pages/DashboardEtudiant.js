import React, { useEffect, useState } from 'react';
import { 
  User, Calendar, XCircle, CheckCircle, CreditCard,
  UserCheck, AlertTriangle, GraduationCap, TrendingUp,
  BookOpen, Clock, Award, Mail, Phone, UserCircle,
  Target, Activity, Star, CheckSquare, FileText,
  Database, Wifi, DollarSign, Users, X, AlertCircle,
  ArrowRight, Shield, FileCheck
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Sidebaretudiant from '../components/sidebaretudiant';
import Headeretudiant from '../components/Headeretudiant';
import ModalPaiementExpire from '../components/ModalPaiementExpire';
import SystemeTestLangue from '../components/SystemeTestLangue';
import ModalAnnonces from '../components/ModalAnnonces';

import './AdminDashboard.css';

const DashboardEtudiant = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const role = localStorage.getItem('role');
    if (role !== 'etudiant') {
      navigate('/');
    }
  }, [navigate]);

  const [etudiant, setEtudiant] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    totalPresences: 0,
    totalAbsences: 0,
    totalPaiements: 0,
    paiementsExpires: 0,
    coursInscrits: 0,
    tauxPresence: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  
  // États pour le système de test
  const [doitPasserTests, setDoitPasserTests] = useState(false);
  const [chargementTests, setChargementTests] = useState(true);
  
  // NOUVEAU : État pour le modal des informations obligatoires
  const [showInfoObligatoiresModal, setShowInfoObligatoiresModal] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Token manquant - veuillez vous reconnecter');
        setLoading(false);
        setChargementTests(false);
        return;
      }

      const headers = { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      console.log('🔄 Début de récupération des données étudiant...');

      const [profileRes, presencesRes, absencesRes, paiementsRes] = await Promise.all([
        fetch('http://195.179.229.230:5000/api2/etudiant/profile', { headers }),
        fetch('http://195.179.229.230:5000/api2/etudiant/presences', { headers }),
        fetch('http://195.179.229.230:5000/api2/etudiant/absences', { headers }),
        fetch('http://195.179.229.230:5000/api2/etudiant/paiements', { headers })
      ]);

      if (!profileRes.ok) throw new Error(`Erreur profil: ${profileRes.status}`);
      if (!presencesRes.ok) throw new Error(`Erreur présences: ${presencesRes.status}`);
      if (!absencesRes.ok) throw new Error(`Erreur absences: ${absencesRes.status}`);
      if (!paiementsRes.ok) throw new Error(`Erreur paiements: ${paiementsRes.status}`);

      const etudiantData = await profileRes.json();
      const presences = await presencesRes.json();
      const absences = await absencesRes.json();
      const paiements = await paiementsRes.json();

      console.log('📊 Données étudiant récupérées:', {
        etudiant: etudiantData,
        presences: presences.length,
        absences: absences.length,
        paiements: paiements.length
      });

      setEtudiant(etudiantData);

      // Vérifier si l'étudiant doit passer les tests
      if (etudiantData.nouvelleInscription) {
        try {
          const resTests = await fetch('http://195.179.229.230:5000/api2/tests/statut', { headers });
          if (resTests.ok) {
            const dataTests = await resTests.json();
            if (!dataTests.tousTermines) {
              setDoitPasserTests(true);
              setChargementTests(false);
              setLoading(false);
              return;
            }
          }
        } catch (err) {
          console.error('Erreur vérification tests:', err);
        }
      }
      
      setChargementTests(false);
      
      // NOUVEAU : Vérifier si le profil est incomplet
      const profilIncomplet = verifierProfilIncomplet(etudiantData);
      
      if (profilIncomplet) {
        // Toujours afficher le modal si le profil est incomplet
        setShowInfoObligatoiresModal(true);
      } else {
        // Afficher le modal de bienvenue seulement si le profil est complet
        const modalShown = localStorage.getItem('welcomeModalShownStudent');
        if (!modalShown) {
          setShowWelcomeModal(true);
        }
      }
      
      const presencesValid = Array.isArray(presences) ? presences : [];
      const absencesValid = Array.isArray(absences) ? absences : [];
      const paiementsValid = Array.isArray(paiements) ? paiements : [];

      const totalSeances = presencesValid.length + absencesValid.length;
      const tauxPresence = totalSeances > 0 ? Math.round((presencesValid.length / totalSeances) * 100) : 0;

      const today = new Date();
      const paiementsExpires = paiementsValid.filter(p => {
        if (!p.moisFin) return false;
        const dateFin = new Date(p.moisFin);
        return dateFin < today;
      });

      const coursInscrits = Array.isArray(etudiantData.cours) ? etudiantData.cours.length : 0;

      const dashboardStats = {
        totalPresences: presencesValid.length,
        totalAbsences: absencesValid.length,
        totalPaiements: paiementsValid.length,
        paiementsExpires: paiementsExpires.length,
        coursInscrits,
        tauxPresence
      };

      setDashboardData(dashboardStats);
      console.log('📈 Statistiques étudiant calculées:', dashboardStats);
      
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des données:', error);
      setError(`Erreur de connexion: ${error.message}`);
      setChargementTests(false);
    } finally {
      setLoading(false);
    }
  };

  // NOUVEAU : Fonction pour vérifier si le profil est incomplet
  const verifierProfilIncomplet = (etudiant) => {
    if (!etudiant) return false;
    
    // Vérifier les champs obligatoires importants
    const champsObligatoires = [
      'dateNaissance',
      'lieuNaissance',
      'nationalite',
      'adresse',
      'codePostal',
      'ville'
    ];
    
    return champsObligatoires.some(champ => !etudiant[champ] || etudiant[champ] === '');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('welcomeModalShownStudent');
    window.location.href = '/';
  };

  const closeWelcomeModal = () => {
    setShowWelcomeModal(false);
    localStorage.setItem('welcomeModalShownStudent', 'true');
  };

  // NOUVEAU : Modal pour les informations obligatoires
  const ModalInfoObligatoires = () => {
    if (!showInfoObligatoiresModal) return null;

    const handleCompleterProfil = () => {
      // Ne pas sauvegarder, le modal disparaîtra quand le profil sera complété
      navigate('/etudiant/profile');
    };

    const handlePlusTard = () => {
      setShowInfoObligatoiresModal(false);
      // Ne pas sauvegarder dans localStorage pour que le modal réapparaisse
    };

    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
        backdropFilter: 'blur(4px)'
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '40px',
          borderRadius: '20px',
          boxShadow: '0 25px 70px rgba(0, 0, 0, 0.3)',
          maxWidth: '600px',
          width: '90%',
          position: 'relative',
          animation: 'slideIn 0.3s ease-out'
        }}>
          {/* Badge Important */}
          <div style={{
            position: 'absolute',
            top: '-15px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: '#dc2626',
            color: 'white',
            padding: '8px 24px',
            borderRadius: '20px',
            fontSize: '14px',
            fontWeight: '600',
            boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <AlertCircle size={18} />
            ACTION REQUISE
          </div>

          {/* Icône principale */}
          <div style={{
            textAlign: 'center',
            marginTop: '20px',
            marginBottom: '20px'
          }}>
            <div style={{
              display: 'inline-flex',
              padding: '20px',
              backgroundColor: '#fef3c7',
              borderRadius: '50%',
              marginBottom: '15px'
            }}>
              <FileCheck size={48} color="#f59e0b" />
            </div>
          </div>

          {/* Titre */}
          <h2 style={{
            color: '#1f2937',
            marginBottom: '20px',
            fontSize: '26px',
            fontWeight: '700',
            textAlign: 'center',
            lineHeight: '1.3'
          }}>
            Complétez vos Informations Obligatoires
          </h2>

          {/* Message d'avertissement */}
          <div style={{
            backgroundColor: '#fef2f2',
            border: '2px solid #fca5a5',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '25px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px'
            }}>
              <Shield size={24} color="#dc2626" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <p style={{
                  color: '#991b1b',
                  fontSize: '15px',
                  fontWeight: '600',
                  marginBottom: '8px',
                  lineHeight: '1.5'
                }}>
                  ⚠️ Informations requises pour votre diplôme
                </p>
                <p style={{
                  color: '#7f1d1d',
                  fontSize: '14px',
                  lineHeight: '1.6',
                  marginBottom: '0'
                }}>
                  Les informations de votre profil seront utilisées pour établir votre diplôme officiel. 
                  Il est de <strong>votre responsabilité</strong> de vous assurer que toutes les données 
                  sont <strong>exactes et complètes</strong>.
                </p>
              </div>
            </div>
          </div>

          {/* Liste des informations requises */}
          <div style={{
            backgroundColor: '#f9fafb',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '25px'
          }}>
            <h3 style={{
              color: '#374151',
              fontSize: '16px',
              fontWeight: '600',
              marginBottom: '15px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <FileText size={20} color="#3b82f6" />
              Informations à renseigner :
            </h3>
            <ul style={{
              listStyle: 'none',
              padding: 0,
              margin: 0
            }}>
              {[
                'Date et lieu de naissance',
                'Nationalité',
                'Adresse complète (rue, code postal, ville)',
                'Informations de contact vérifiées'
              ].map((item, index) => (
                <li key={index} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 0',
                  borderBottom: index < 3 ? '1px solid #e5e7eb' : 'none',
                  color: '#4b5563',
                  fontSize: '14px'
                }}>
                  <CheckCircle size={18} color="#10b981" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Note importante */}
          <div style={{
            backgroundColor: '#fffbeb',
            border: '1px solid #fcd34d',
            borderRadius: '8px',
            padding: '12px 16px',
            marginBottom: '25px',
            fontSize: '13px',
            color: '#92400e',
            lineHeight: '1.5'
          }}>
            <strong>💡 Important :</strong> Ces informations ne peuvent être modifiées qu'une seule fois. 
            Assurez-vous de leur exactitude avant validation.
          </div>

          {/* Boutons d'action */}
          <div style={{
            display: 'flex',
            gap: '12px',
            flexDirection: 'column'
          }}>
            <button
              onClick={handleCompleterProfil}
              style={{
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                padding: '16px 24px',
                borderRadius: '10px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
              }}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = '#2563eb';
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 16px rgba(59, 130, 246, 0.4)';
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = '#3b82f6';
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
              }}
            >
              Compléter mon profil maintenant
              <ArrowRight size={20} />
            </button>
            
            <button
              onClick={handlePlusTard}
              style={{
                backgroundColor: 'transparent',
                color: '#6b7280',
                border: '2px solid #e5e7eb',
                padding: '14px 24px',
                borderRadius: '10px',
                fontSize: '15px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => {
                e.target.style.borderColor = '#9ca3af';
                e.target.style.color = '#374151';
              }}
              onMouseOut={(e) => {
                e.target.style.borderColor = '#e5e7eb';
                e.target.style.color = '#6b7280';
              }}
            >
              Je complèterai plus tard
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Modal de bienvenue
  const WelcomeModal = () => {
    if (!showWelcomeModal || !etudiant) return null;

    const currentDate = new Date().toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '40px',
          borderRadius: '20px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
          textAlign: 'center',
          maxWidth: '500px',
          width: '90%',
          position: 'relative',
          background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 25%, #f3e8ff 100%)'
        }}>
          <button
            onClick={closeWelcomeModal}
            style={{
              position: 'absolute',
              top: '15px',
              right: '15px',
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#6b7280',
              padding: '5px'
            }}
          >
            <X size={20} />
          </button>
          
          <div style={{
            fontSize: '48px',
            marginBottom: '20px'
          }}>
            🎓
          </div>
          
          <h2 style={{
            color: '#1f2937',
            marginBottom: '15px',
            fontSize: '28px',
            fontWeight: '600'
          }}>
            Bonjour {etudiant.nomComplet || 'Étudiant'} !
          </h2>
          
          <p style={{
            color: '#6b7280',
            fontSize: '16px',
            marginBottom: '10px'
          }}>
            {currentDate}
          </p>
          
          <div style={{
            backgroundColor: '#10b981',
            color: 'white',
            padding: '12px 25px',
            borderRadius: '25px',
            display: 'inline-block',
            fontSize: '16px',
            fontWeight: '500',
            marginBottom: '25px'
          }}>
            Connexion réussie
          </div>
          
          <p style={{
            color: '#6b7280',
            fontSize: '14px',
            marginBottom: '25px'
          }}>
            Bienvenue sur votre espace étudiant
          </p>
          
          <button
            onClick={closeWelcomeModal}
            style={{
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              padding: '12px 30px',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#2563eb'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#3b82f6'}
          >
            Commencer
          </button>
        </div>
      </div>
    );
  };

  if (chargementTests) {
    return (
      <div className="loading-container">
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <p className="loading-text">Vérification de votre profil...</p>
        </div>
      </div>
    );
  }

  if (doitPasserTests) {
    return <SystemeTestLangue etudiant={etudiant} />;
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <p className="loading-text">Chargement de votre tableau de bord...</p>
          <p className="loading-subtext">Récupération de vos données personnelles</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">        
        <div className="error-content">
          <AlertTriangle className="error-icon" />
          <h2 className="error-title">Erreur de Connexion</h2>
          <p className="error-message">{error}</p>
          <div className="error-actions">
            <button 
              onClick={fetchDashboardData}
              className="error-btn primary"
            >
              Réessayer
            </button>
            <button 
              onClick={handleLogout}
              className="error-btn secondary"
            >
              Se reconnecter
            </button>
          </div>
        </div>
      </div>
    );
  }

  const StatCard = ({ title, value, icon: Icon, colorClass, trend, subtitle }) => (
    <div className={`stat-card ${colorClass}`}>
      <div className="stat-card-content">
        <div className="stat-card-info">
          <p className="stat-card-title">{title}</p>
          <p className="stat-card-value">{value || 0}</p>
          {subtitle && (
            <p className="stat-card-subtitle">{subtitle}</p>
          )}
          {trend && (
            <p className="stat-card-trend">
              <TrendingUp />
              {trend}
            </p>
          )}
        </div>
        <div className="stat-card-icon">
          <Icon />
        </div>
      </div>
    </div>
  );

  const getAssiduitéIcon = (taux) => {
    if (taux >= 80) return <Award className="inline-icon" />;
    if (taux >= 60) return <CheckCircle className="inline-icon" />;
    if (taux >= 40) return <AlertTriangle className="inline-icon" />;
    return <XCircle className="inline-icon" />;
  };

  const getEngagementIcon = (coursCount) => {
    if (coursCount >= 3) return <Star className="inline-icon" />;
    if (coursCount >= 2) return <CheckSquare className="inline-icon" />;
    if (coursCount >= 1) return <BookOpen className="inline-icon" />;
    return <Clock className="inline-icon" />;
  };

  const getPaymentStatusIcon = (expired) => {
    return expired === 0 ? <CheckCircle className="inline-icon" /> : <AlertTriangle className="inline-icon" />;
  };

  return (
    <div className="admin-dashboard" style={{
      background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 25%, #f3e8ff 100%)'
    }}>
      <Headeretudiant />
      <ModalInfoObligatoires />
      <WelcomeModal />
      <ModalPaiementExpire />
            <ModalAnnonces />

      <Sidebaretudiant onLogout={handleLogout} />

      <div className="dashboard-container">
        <div className="dashboard-content">
          {etudiant && (
            <div className="summary-card" style={{ marginBottom: '2rem' }}>
              <h3 className="summary-header">
                <UserCircle className="inline-icon" style={{ marginRight: '8px' }} />
                Bonjour {etudiant.nomComplet}
              </h3>
              <div className="summary-grid">
                <div className="summary-item blue">
                  <p className="summary-item-label">
                    <Mail className="inline-icon" style={{ marginRight: '4px' }} />
                    Email
                  </p>
                  <p className="summary-item-value" style={{ fontSize: '1rem' }}>
                    {etudiant.email}
                  </p>
                </div>
                <div className="summary-item green">
                  <p className="summary-item-label">
                    <Phone className="inline-icon" style={{ marginRight: '4px' }} />
                    Téléphone
                  </p>
                  <p className="summary-item-value" style={{ fontSize: '1rem' }}>
                    {etudiant.telephone}
                  </p>
                </div>
                <div className="summary-item purple">
                  <p className="summary-item-label">
                    <Activity className="inline-icon" style={{ marginRight: '4px' }} />
                    Statut
                  </p>
                  <p className="summary-item-value" style={{ fontSize: '1rem' }}>
                    {etudiant.actif ? (
                      <>
                        <CheckCircle className="inline-icon" style={{ marginRight: '4px' }} />
                        Actif
                      </>
                    ) : (
                      <>
                        <XCircle className="inline-icon" style={{ marginRight: '4px' }} />
                        Inactif
                      </>
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="stats-grid">
            <StatCard
              title="Présences"
              value={dashboardData.totalPresences}
              icon={CheckCircle}
              colorClass="green"
              subtitle="Séances assistées"
            />
            <StatCard
              title="Absences"
              value={dashboardData.totalAbsences}
              icon={XCircle}
              colorClass="red"
              subtitle="Séances manquées"
            />
            <StatCard
              title="classe Inscrits"
              value={dashboardData.coursInscrits}
              icon={GraduationCap}
              colorClass="blue"
              subtitle="Formations suivies"
            />
            <StatCard
              title="Paiements"
              value={dashboardData.totalPaiements}
              icon={CreditCard}
              colorClass="yellow"
              subtitle="Total effectués"
            />
          </div>

          {dashboardData.paiementsExpires > 0 && (
            <div className="alert-section">
              <div className="alert-content">
                <AlertTriangle />
                <div className="alert-text">
                  <h3>
                    <AlertTriangle className="inline-icon" style={{ marginRight: '8px' }} />
                    Paiements Expirés
                  </h3>
                  <p>
                    Vous avez <strong>{dashboardData.paiementsExpires}</strong> paiement(s) expiré(s).
                    Veuillez contacter l'administration pour renouveler vos cotisations.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="summary-card">
            <h3 className="summary-header">
              <Target className="inline-icon" style={{ marginRight: '8px' }} />
              Votre Performance
            </h3>
            <div className="summary-grid">
              <div className="summary-item blue">
                <p className="summary-item-label">
                  <TrendingUp className="inline-icon" style={{ marginRight: '4px' }} />
                  Assiduité
                </p>
                <p className="summary-item-value">
                  {getAssiduitéIcon(dashboardData.tauxPresence)}
                  <span style={{ marginLeft: '4px' }}>
                    {dashboardData.tauxPresence >= 80 ? 'Excellent' : 
                     dashboardData.tauxPresence >= 60 ? 'Bien' : 
                     dashboardData.tauxPresence >= 40 ? 'À améliorer' : 'Insuffisant'}
                  </span>
                </p>
                <p className="summary-item-detail">
                  {dashboardData.totalPresences} présences / {dashboardData.totalPresences + dashboardData.totalAbsences} séances
                </p>
              </div>
              <div className="summary-item green">
                <p className="summary-item-label">
                  <Users className="inline-icon" style={{ marginRight: '4px' }} />
                  Engagement
                </p>
                <p className="summary-item-value">
                  {getEngagementIcon(dashboardData.coursInscrits)}
                  <span style={{ marginLeft: '4px' }}>
                    {dashboardData.coursInscrits >= 3 ? 'Très actif' : 
                     dashboardData.coursInscrits >= 2 ? 'Actif' : 
                     dashboardData.coursInscrits >= 1 ? 'En formation' : 'Débutant'}
                  </span>
                </p>
                <p className="summary-item-detail">
                  {dashboardData.coursInscrits} cours suivis
                </p>
              </div>
              <div className="summary-item purple">
                <p className="summary-item-label">
                  <DollarSign className="inline-icon" style={{ marginRight: '4px' }} />
                  Statut Paiements
                </p>
                <p className="summary-item-value">
                  {getPaymentStatusIcon(dashboardData.paiementsExpires)}
                  <span style={{ marginLeft: '4px' }}>
                    {dashboardData.paiementsExpires === 0 ? 'À jour' : 'Action requise'}
                  </span>
                </p>
                <p className="summary-item-detail">
                  {dashboardData.totalPaiements} paiements effectués
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardEtudiant;