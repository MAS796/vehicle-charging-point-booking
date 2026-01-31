import { useParams, useLocation } from "react-router-dom";
import evCompanies from "../data/evCompanies";
import { useEffect, useState } from "react";
import api from "../services/api";
import "../styles/company-detail.css";

const CompanyDetail = () => {
  const { id } = useParams();
  const location = useLocation();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchCompanyDetails();
  }, [id]);

  const fetchCompanyDetails = async () => {
    setLoading(true);
    try {
      // If company data was passed via navigation state, use it
      if (location.state) {
        setCompany(location.state);
        setLoading(false);
        return;
      }

      // Try to fetch from API using numeric ID
      try {
        const res = await api.get(`/companies/${id}`);
        if (res.data) {
          setCompany(res.data);
        } else {
          setCompany(null);
        }
      } catch (apiErr) {
        console.error("Error fetching company:", apiErr);
        
        // Fallback: check if it's in the local data (string IDs like "siemens")
        const localCompany = evCompanies.find(
          (c) => c.id.toLowerCase() === id.toLowerCase()
        );
        
        if (localCompany) {
          setCompany(localCompany);
        } else {
          setCompany(null);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <p>Loading company details...</p>
      </div>
    );
  }

  if (!company) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <h2>Company Not Found</h2>
        <p>The company you're looking for doesn't exist.</p>
      </div>
    );
  }

  return (
    <div className="company-detail-container">
      <div className="company-detail-header">
        <h1>{company.name}</h1>
        <p className="detail-category">{company.category}</p>
      </div>

      <div className="company-detail-content">
        {/* Basic Information */}
        <section className="detail-section">
          <h2>📋 Company Information</h2>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Country:</span>
              <span className="info-value">{company.country || "N/A"}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Category:</span>
              <span className="info-value">{company.category || "N/A"}</span>
            </div>
            {company.founded && (
              <div className="info-item">
                <span className="info-label">Founded:</span>
                <span className="info-value">{company.founded}</span>
              </div>
            )}
          </div>
        </section>

        {/* Overview/Description */}
        <section className="detail-section">
          <h2>🌍 Company Overview</h2>
          <p className="overview-text">{company.description || company.overview || "No description available"}</p>
        </section>

        {/* Core Solutions */}
        {(company.solutions || company.solutions?.length > 0) && (
          <section className="detail-section">
            <h2>💡 Core Solutions</h2>
            <div className="solutions-grid">
              {(company.solutions || []).map((item, index) => (
                <div key={index} className="solution-card">
                  <span className="solution-icon">✓</span>
                  <span className="solution-text">{item}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Industries Served */}
        {(company.industries || company.industries?.length > 0) && (
          <section className="detail-section">
            <h2>🏢 Industries Served</h2>
            <div className="industries-grid">
              {(company.industries || []).map((item, index) => (
                <div key={index} className="industry-badge">
                  {item}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Competitive Advantages */}
        {(company.advantages || company.advantages?.length > 0) && (
          <section className="detail-section">
            <h2>⭐ Competitive Advantages</h2>
            <ul className="advantages-list">
              {(company.advantages || []).map((item, index) => (
                <li key={index}>
                  <span className="advantage-icon">★</span>
                  {item}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Website & Contact */}
        <section className="detail-section">
          <h2>🔗 Learn More</h2>
          <div className="contact-section">
            {company.website && (
              <a
                href={company.website}
                target="_blank"
                rel="noopener noreferrer"
                className="cta-button"
              >
                Visit Company Website →
              </a>
            )}
            {company.officialLink && !company.website && (
              <a
                href={company.officialLink}
                target="_blank"
                rel="noopener noreferrer"
                className="cta-button"
              >
                Visit Official Page →
              </a>
            )}
          </div>
        </section>

        {/* Stats */}
        {(company.views !== undefined || company.employees || company.revenue) && (
          <section className="detail-section stats-section">
            <h2>📊 Quick Stats</h2>
            <div className="stats-grid">
              {company.views !== undefined && (
                <div className="stat-item">
                  <span className="stat-label">Views</span>
                  <span className="stat-value">{company.views || 0}</span>
                </div>
              )}
              {company.employees && (
                <div className="stat-item">
                  <span className="stat-label">Employees</span>
                  <span className="stat-value">{company.employees}</span>
                </div>
              )}
              {company.revenue && (
                <div className="stat-item">
                  <span className="stat-label">Revenue</span>
                  <span className="stat-value">{company.revenue}</span>
                </div>
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default CompanyDetail;
