import React, { useState, useEffect } from 'react';
import { 
  Globe, MapPin, Filter, RefreshCw, Users, 
  TrendingUp, BarChart3, AlertCircle
} from 'lucide-react';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import Sidebar from '../components/Sidebar';

const AnalysesGeographie = () => {
  const [etudiants, setEtudiants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [anneeScolaireFilter, setAnneeScolaireFilter] = useState('2025/2026');
  const [anneesDisponibles, setAnneesDisponibles] = useState([]);
  const [paysData, setPaysData] = useState([]);
  const [statsGlobales, setStatsGlobales] = useState({
    totalEtudiants: 0,
    totalPays: 0,
    totalCA: 0,
    tauxPaiement: 0,
    etudiantsMaroc: 0,
    caMaroc: 0,
    etudiantsAutresPays: 0,
    caAutresPays: 0
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');

      const etudiantsRes = await fetch('http://195.179.229.230:5000/api2/etudiants', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!etudiantsRes.ok) {
        throw new Error('Erreur lors du chargement des données');
      }

      const etudiantsData = await etudiantsRes.json();
      setEtudiants(etudiantsData);

      const annees = [...new Set(etudiantsData.map((e) => e.anneeScolaire).filter(Boolean))]
        .sort()
        .reverse();
      setAnneesDisponibles(annees);

      if (!anneeScolaireFilter && annees.length > 0) {
        setAnneeScolaireFilter(annees.includes('2025/2026') ? '2025/2026' : annees[0]);
      }

      calculerStatistiquesGeo(etudiantsData, anneeScolaireFilter);
      
    } catch (err) {
      console.error('Erreur:', err);
      setError('Impossible de charger les données');
    } finally {
      setLoading(false);
    }
  };

  const calculerStatistiquesGeo = (data, anneeFilter) => {
    const etudiantsFiltres = anneeFilter === 'toutes' 
      ? data 
      : data.filter(e => e.anneeScolaire === anneeFilter);

    // Grouper par pays
    const paysStats = {};
    
    etudiantsFiltres.forEach(e => {
      const pays = e.pays || 'Non défini';
      if (!paysStats[pays]) {
        paysStats[pays] = { 
          etudiants: [], 
          total: 0, 
          payes: 0, 
          ca: 0, 
          residents: 0, 
          fonctionnaires: 0 
        };
      }
      
      paysStats[pays].etudiants.push(e);
      paysStats[pays].total += 1;
      if (e.paye) paysStats[pays].payes += 1;
      paysStats[pays].ca += parseFloat(e.prixTotal) || 0;
      if (e.resident) paysStats[pays].residents += 1;
      if (e.fonctionnaire) paysStats[pays].fonctionnaires += 1;
    });

    const paysArray = Object.entries(paysStats).map(([pays, stats]) => ({
      pays,
      ...stats,
      tauxReussite: stats.total > 0 ? ((stats.payes / stats.total) * 100).toFixed(1) : 0,
      tauxResidents: stats.total > 0 ? ((stats.residents / stats.total) * 100).toFixed(1) : 0
    })).sort((a, b) => b.total - a.total);

    setPaysData(paysArray);

    const totalCA = etudiantsFiltres.reduce((sum, e) => sum + (parseFloat(e.prixTotal) || 0), 0);
    const totalPayes = etudiantsFiltres.filter(e => e.paye).length;
    
    // Calculer statistiques Maroc vs Autres pays
    const etudiantsMaroc = etudiantsFiltres.filter(e => (e.pays || '').toLowerCase().includes('maroc'));
    const etudiantsAutres = etudiantsFiltres.filter(e => !(e.pays || '').toLowerCase().includes('maroc'));
    
    const caMaroc = etudiantsMaroc.reduce((sum, e) => sum + (parseFloat(e.prixTotal) || 0), 0);
    const caAutres = etudiantsAutres.reduce((sum, e) => sum + (parseFloat(e.prixTotal) || 0), 0);
    
    setStatsGlobales({
      totalEtudiants: etudiantsFiltres.length,
      totalPays: paysArray.length,
      totalCA: totalCA,
      tauxPaiement: etudiantsFiltres.length > 0 ? ((totalPayes / etudiantsFiltres.length) * 100).toFixed(1) : 0,
      etudiantsMaroc: etudiantsMaroc.length,
      caMaroc: caMaroc,
      etudiantsAutresPays: etudiantsAutres.length,
      caAutresPays: caAutres
    });
  };

  const formatMoney = (amount) =>
    new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/';
  };

  const handleAnneeChange = (nouvelleAnnee) => {
    setAnneeScolaireFilter(nouvelleAnnee);
    calculerStatistiquesGeo(etudiants, nouvelleAnnee);
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f8fafc' }}>
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              border: '4px solid #e2e8f0',
              borderTop: '4px solid #2563eb',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 1rem'
            }}
          ></div>
          <p style={{ color: '#64748b', fontSize: '1.1rem' }}>Chargement des analyses géographiques...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
            <Sidebar onLogout={handleLogout} />
      
      <div style={{ padding: '2rem' }}>
        {/* Header */}
        <div
          style={{
            background: '#fff',
            borderRadius: '8px',
            padding: '2rem',
            marginBottom: '2rem',
            border: '1px solid #e5e7eb'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div>
              <h1
                style={{
                  fontSize: '1.75rem',
                  fontWeight: 'bold',
                  color: '#1f2937',
                  margin: '0 0 0.5rem 0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem'
                }}
              >
                <Globe size={28} />
                Analyses Géographiques {anneeScolaireFilter}
              </h1>
              <p style={{ color: '#6b7280', margin: 0 }}>
                Répartition des étudiants par pays et statistiques détaillées
              </p>
            </div>
            <button
              onClick={fetchData}
              style={{
                background: '#374151',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                padding: '0.75rem 1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                cursor: 'pointer',
                fontSize: '0.9rem'
              }}
            >
              <RefreshCw size={16} />
              Actualiser
            </button>
          </div>

          {/* Filtre année scolaire */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              padding: '1rem',
              background: '#f9fafb',
              borderRadius: '6px',
              border: '1px solid #e5e7eb'
            }}
          >
            <Filter size={18} />
            <span style={{ fontWeight: '600', color: '#374151', fontSize: '0.9rem' }}>Année scolaire:</span>
            <select
              value={anneeScolaireFilter}
              onChange={(e) => handleAnneeChange(e.target.value)}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '4px',
                border: '1px solid #d1d5db',
                backgroundColor: 'white',
                fontSize: '0.9rem',
                cursor: 'pointer'
              }}
            >
              <option value="toutes">Toutes les années</option>
              {anneesDisponibles.map((annee) => (
                <option key={annee} value={annee}>
                  {annee}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Statistiques globales */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          <div style={{
            background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
            color: 'white',
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <Users size={32} />
              <div>
                <h3 style={{ margin: 0, fontSize: '0.9rem', opacity: 0.9 }}>Total Étudiants</h3>
                <p style={{ margin: 0, fontSize: '1.8rem', fontWeight: 'bold' }}>{statsGlobales.totalEtudiants}</p>
              </div>
            </div>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
            color: 'white',
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <Globe size={32} />
              <div>
                <h3 style={{ margin: 0, fontSize: '0.9rem', opacity: 0.9 }}>Pays Représentés</h3>
                <p style={{ margin: 0, fontSize: '1.8rem', fontWeight: 'bold' }}>{statsGlobales.totalPays}</p>
              </div>
            </div>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
            color: 'white',
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow: '0 4px 15px rgba(139, 92, 246, 0.3)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <BarChart3 size={32} />
              <div>
                <h3 style={{ margin: 0, fontSize: '0.9rem', opacity: 0.9 }}>CA Total</h3>
                <p style={{ margin: 0, fontSize: '1.3rem', fontWeight: 'bold' }}>{formatMoney(statsGlobales.totalCA)} MAD</p>
              </div>
            </div>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            color: 'white',
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow: '0 4px 15px rgba(245, 158, 11, 0.3)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <TrendingUp size={32} />
              <div>
                <h3 style={{ margin: 0, fontSize: '0.9rem', opacity: 0.9 }}>Taux de Paiement</h3>
                <p style={{ margin: 0, fontSize: '1.8rem', fontWeight: 'bold' }}>{statsGlobales.tauxPaiement}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Cartes Maroc vs Autres Pays */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
          {/* Card Maroc */}
          <div style={{
            background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
            color: 'white',
            borderRadius: '12px',
            padding: '2rem',
            boxShadow: '0 4px 15px rgba(220, 38, 38, 0.3)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <MapPin size={36} />
              <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold' }}>Maroc</h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
              <div>
                <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.9 }}>Étudiants</p>
                <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold' }}>{statsGlobales.etudiantsMaroc}</p>
                <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.8 }}>
                  {statsGlobales.totalEtudiants > 0 ? ((statsGlobales.etudiantsMaroc / statsGlobales.totalEtudiants) * 100).toFixed(1) : 0}% du total
                </p>
              </div>
              <div>
                <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.9 }}>Chiffre d'Affaires</p>
                <p style={{ margin: 0, fontSize: '1.3rem', fontWeight: 'bold' }}>{formatMoney(statsGlobales.caMaroc)}</p>
                <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.8 }}>MAD</p>
              </div>
            </div>
          </div>

          {/* Card Autres Pays */}
          <div style={{
            background: 'linear-gradient(135deg, #0891b2 0%, #0e7490 100%)',
            color: 'white',
            borderRadius: '12px',
            padding: '2rem',
            boxShadow: '0 4px 15px rgba(8, 145, 178, 0.3)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <Globe size={36} />
              <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold' }}>Autres Pays</h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
              <div>
                <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.9 }}>Étudiants</p>
                <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold' }}>{statsGlobales.etudiantsAutresPays}</p>
                <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.8 }}>
                  {statsGlobales.totalEtudiants > 0 ? ((statsGlobales.etudiantsAutresPays / statsGlobales.totalEtudiants) * 100).toFixed(1) : 0}% du total
                </p>
              </div>
              <div>
                <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.9 }}>Chiffre d'Affaires</p>
                <p style={{ margin: 0, fontSize: '1.3rem', fontWeight: 'bold' }}>{formatMoney(statsGlobales.caAutresPays)}</p>
                <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.8 }}>MAD</p>
              </div>
            </div>
          </div>
        </div>

        {/* Graphiques */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
          {/* Graphique Pie - Répartition par Pays */}
          <div style={{
            background: '#fff',
            borderRadius: '8px',
            padding: '1.5rem',
            border: '1px solid #e5e7eb'
          }}>
            <h3 style={{
              fontSize: '1.125rem',
              fontWeight: '600',
              color: '#1f2937',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <BarChart3 size={20} />
              Répartition par Pays (Étudiants)
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={paysData.slice(0, 8)}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="total"
                  label={({pays, total}) => `${pays}: ${total}`}
                >
                  {paysData.slice(0, 8).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={['#2563eb', '#059669', '#7c3aed', '#dc2626', '#ea580c', '#0891b2', '#9333ea', '#ca8a04'][index % 8]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Graphique Bar - CA par Pays */}
          <div style={{
            background: '#fff',
            borderRadius: '8px',
            padding: '1.5rem',
            border: '1px solid #e5e7eb'
          }}>
            <h3 style={{
              fontSize: '1.125rem',
              fontWeight: '600',
              color: '#1f2937',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <BarChart3 size={20} />
              Chiffre d'Affaires par Pays
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={paysData.slice(0, 8)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis 
                  dataKey="pays" 
                  angle={-45} 
                  textAnchor="end" 
                  height={100}
                  fontSize={11}
                  stroke="#64748b"
                />
                <YAxis stroke="#64748b" />
                <Tooltip formatter={(value) => `${formatMoney(value)} MAD`} />
                <Bar dataKey="ca" fill="#059669" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tableau des pays */}
        <div
          style={{
            background: '#fff',
            borderRadius: '8px',
            padding: '2rem',
            border: '1px solid #e5e7eb'
          }}
        >
          <h2
            style={{
              fontSize: '1.25rem',
              fontWeight: 'bold',
              color: '#1f2937',
              marginBottom: '2rem',
              textAlign: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}
          >
            <MapPin size={24} />
            Répartition par Pays
          </h2>

          {paysData.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '3rem',
              color: '#6b7280',
              fontSize: '1.1rem'
            }}>
              <AlertCircle size={48} style={{ margin: '0 auto 1rem', display: 'block' }} />
              Aucune donnée disponible
            </div>
          ) : (
            <div style={{ overflowX: 'auto', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white' }}>
                <thead style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)' }}>
                  <tr>
                    <th style={{ 
                      padding: '1rem 1.25rem', 
                      textAlign: 'left', 
                      fontWeight: '700', 
                      color: '#374151', 
                      fontSize: '0.875rem',
                      borderBottom: '2px solid #e5e7eb'
                    }}>Pays</th>
                    <th style={{ 
                      padding: '1rem 1.25rem', 
                      textAlign: 'center', 
                      fontWeight: '700', 
                      color: '#374151', 
                      fontSize: '0.875rem',
                      borderBottom: '2px solid #e5e7eb'
                    }}>Total Étudiants</th>
                    <th style={{ 
                      padding: '1rem 1.25rem', 
                      textAlign: 'center', 
                      fontWeight: '700', 
                      color: '#374151', 
                      fontSize: '0.875rem',
                      borderBottom: '2px solid #e5e7eb'
                    }}>Étudiants Payés</th>
                    <th style={{ 
                      padding: '1rem 1.25rem', 
                      textAlign: 'center', 
                      fontWeight: '700', 
                      color: '#374151', 
                      fontSize: '0.875rem',
                      borderBottom: '2px solid #e5e7eb'
                    }}>Taux Réussite</th>
                    <th style={{ 
                      padding: '1rem 1.25rem', 
                      textAlign: 'center', 
                      fontWeight: '700', 
                      color: '#374151', 
                      fontSize: '0.875rem',
                      borderBottom: '2px solid #e5e7eb'
                    }}>CA Total</th>
                    <th style={{ 
                      padding: '1rem 1.25rem', 
                      textAlign: 'center', 
                      fontWeight: '700', 
                      color: '#374151', 
                      fontSize: '0.875rem',
                      borderBottom: '2px solid #e5e7eb'
                    }}>Résidents</th>
                    <th style={{ 
                      padding: '1rem 1.25rem', 
                      textAlign: 'center', 
                      fontWeight: '700', 
                      color: '#374151', 
                      fontSize: '0.875rem',
                      borderBottom: '2px solid #e5e7eb'
                    }}>Fonctionnaires</th>
                  </tr>
                </thead>
                <tbody>
                  {paysData.map((pays, index) => (
                    <tr key={index} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '1rem 1.25rem', verticalAlign: 'middle' }}>
                        <span style={{ fontWeight: '600', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <MapPin size={16} style={{ color: '#3b82f6' }} />
                          {pays.pays}
                        </span>
                      </td>
                      <td style={{ padding: '1rem 1.25rem', textAlign: 'center', verticalAlign: 'middle' }}>
                        <span style={{
                          background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                          color: 'white',
                          padding: '0.375rem 0.75rem',
                          borderRadius: '9999px',
                          fontSize: '0.875rem',
                          fontWeight: '600'
                        }}>
                          {pays.total}
                        </span>
                      </td>
                      <td style={{ padding: '1rem 1.25rem', textAlign: 'center', verticalAlign: 'middle' }}>
                        <span style={{
                          background: 'linear-gradient(135deg, #10b981, #047857)',
                          color: 'white',
                          padding: '0.375rem 0.75rem',
                          borderRadius: '9999px',
                          fontSize: '0.875rem',
                          fontWeight: '600'
                        }}>
                          {pays.payes}
                        </span>
                      </td>
                      <td style={{ padding: '1rem 1.25rem', textAlign: 'center', verticalAlign: 'middle' }}>
                        <span style={{
                          padding: '0.375rem 0.75rem',
                          borderRadius: '9999px',
                          fontSize: '0.875rem',
                          fontWeight: '600',
                          background: parseFloat(pays.tauxReussite) >= 70 ? '#dcfce7' : '#fef3c7',
                          color: parseFloat(pays.tauxReussite) >= 70 ? '#166534' : '#92400e'
                        }}>
                          {pays.tauxReussite}%
                        </span>
                      </td>
                      <td style={{ padding: '1rem 1.25rem', textAlign: 'center', verticalAlign: 'middle' }}>
                        <span style={{
                          fontFamily: 'SF Mono, Monaco, Cascadia Code, monospace',
                          fontSize: '0.9rem',
                          fontWeight: '600',
                          color: '#047857'
                        }}>
                          {formatMoney(pays.ca)} MAD
                        </span>
                      </td>
                      <td style={{ padding: '1rem 1.25rem', textAlign: 'center', verticalAlign: 'middle' }}>
                        <div>
                          <span style={{
                            background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                            color: 'white',
                            padding: '0.375rem 0.75rem',
                            borderRadius: '9999px',
                            fontSize: '0.875rem',
                            fontWeight: '600'
                          }}>
                            {pays.residents}
                          </span>
                          <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
                            ({pays.tauxResidents}%)
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '1rem 1.25rem', textAlign: 'center', verticalAlign: 'middle' }}>
                        <span style={{
                          background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                          color: 'white',
                          padding: '0.375rem 0.75rem',
                          borderRadius: '9999px',
                          fontSize: '0.875rem',
                          fontWeight: '600'
                        }}>
                          {pays.fonctionnaires}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot style={{ background: '#f9fafb', borderTop: '2px solid #e5e7eb' }}>
                  <tr>
                    <td style={{ padding: '1rem 1.25rem', fontWeight: 'bold', color: '#374151' }}>
                      TOTAL
                    </td>
                    <td style={{ padding: '1rem 1.25rem', textAlign: 'center', fontWeight: 'bold', color: '#1f2937' }}>
                      {statsGlobales.totalEtudiants}
                    </td>
                    <td style={{ padding: '1rem 1.25rem', textAlign: 'center', fontWeight: 'bold', color: '#059669' }}>
                      {paysData.reduce((sum, p) => sum + p.payes, 0)}
                    </td>
                    <td style={{ padding: '1rem 1.25rem', textAlign: 'center', fontWeight: 'bold', color: '#1f2937' }}>
                      {statsGlobales.tauxPaiement}%
                    </td>
                    <td style={{ padding: '1rem 1.25rem', textAlign: 'center', fontWeight: 'bold', color: '#047857', fontSize: '1.1rem' }}>
                      {formatMoney(statsGlobales.totalCA)} MAD
                    </td>
                    <td style={{ padding: '1rem 1.25rem', textAlign: 'center', fontWeight: 'bold', color: '#1f2937' }}>
                      {paysData.reduce((sum, p) => sum + p.residents, 0)}
                    </td>
                    <td style={{ padding: '1rem 1.25rem', textAlign: 'center', fontWeight: 'bold', color: '#1f2937' }}>
                      {paysData.reduce((sum, p) => sum + p.fonctionnaires, 0)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>

        {/* Message d'erreur */}
        {error && (
          <div
            style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#dc2626',
              padding: '1rem',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginTop: '2rem'
            }}
          >
            <AlertCircle size={20} />
            {error}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @media (max-width: 1024px) {
          div[style*="grid-template-columns: repeat(auto-fit, minmax(250px, 1fr))"] {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        
        @media (max-width: 768px) {
          div[style*="grid-template-columns: repeat(auto-fit, minmax(250px, 1fr))"] {
            grid-template-columns: 1fr !important;
          }
          table { font-size: 0.8rem; }
          th, td { padding: 0.5rem !important; }
        }
      `}</style>
    </div>
  );
};

export default AnalysesGeographie;