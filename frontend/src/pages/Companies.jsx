import { useState, useEffect } from "react";
import api from "../services/api";
import { getErrorMessage } from "../utils/error";
import { useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import evCompanies from "../data/evCompanies";
import "../styles/companies.css";

export default function Companies() {
  const [companies, setCompanies] = useState([]);
  const [filteredCompanies, setFilteredCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [countries, setCountries] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCompany, setNewCompany] = useState({
    name: "",
    description: "",
    country: "",
    category: "",
    website: "",
    logo_url: ""
  });
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    fetchCompanies();
    fetchCountries();
  }, []);

  useEffect(() => {
    filterCompanies();
  }, [companies, searchTerm, selectedCountry]);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      // Try to fetch from API, but fallback to local EV companies data
      try {
        const res = await api.get("/companies/");
        setCompanies(res.data);
      } catch (apiErr) {
        // If API fails, use the local EV companies data
        console.log("Using local EV companies data");
        setCompanies(evCompanies);
      }
    } catch (err) {
      setError("Failed to load companies: " + (err.message));
      // Fallback to local data on complete error
      setCompanies(evCompanies);
    } finally {
      setLoading(false);
    }
  };

  const fetchCountries = async () => {
    try {
      const res = await api.get("/companies/meta/countries");
      setCountries(res.data.countries || []);
    } catch (err) {
      console.error("Failed to load countries:", err);
    }
  };

  const filterCompanies = () => {
    let filtered = companies;

    if (searchTerm) {
      filtered = filtered.filter(
        (company) =>
          company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (company.description && company.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (selectedCountry) {
      filtered = filtered.filter((company) => company.country === selectedCountry);
    }

    setFilteredCompanies(filtered);
  };

  const trackView = async (companyId) => {
    try {
      await api.post(`/analytics/track-view/${companyId}`);
    } catch (err) {
      console.error("Error tracking view:", err);
    }
  };

  const handleViewCompany = (company) => {
    trackView(company.id);
    navigate(`/company/${company.id}`, { state: company });
  };

  const handleAddCompany = async (e) => {
    e.preventDefault();
    if (!user.is_admin) {
      setError("Only admins can add companies");
      return;
    }

    try {
      await api.post("/companies/", newCompany);
      setNewCompany({
        name: "",
        description: "",
        country: "",
        category: "",
        website: "",
        logo_url: ""
      });
      setShowAddForm(false);
      fetchCompanies();
      alert("Company added successfully!");
    } catch (err) {
      setError("Failed to add company: " + getErrorMessage(err));
    }
  };

  if (loading) return <div className="container"><p>Loading companies...</p></div>;

  return (
    <>
      <Helmet>
        <title>EV Charging Companies | Directory</title>
        <meta name="description" content="Browse and explore EV charging companies and service providers worldwide." />
      </Helmet>

      <div className="companies-page">
        <h1>🏢 EV Charging Companies Directory</h1>
        <p className="subtitle">Explore verified charging solution providers</p>

        {error && <div className="alert alert-error">{error}</div>}

        {/* Search and Filters */}
        <div className="search-filters">
          <input
            type="text"
            placeholder="Search companies by name or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />

          <select
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            className="filter-select"
          >
            <option value="">All Countries</option>
            {countries.map((country) => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </select>

          {user.is_admin && (
            <button
              className="btn-add"
              onClick={() => setShowAddForm(!showAddForm)}
            >
              {showAddForm ? "Cancel" : "➕ Add Company"}
            </button>
          )}
        </div>

        {/* Add Company Form */}
        {showAddForm && user.is_admin && (
          <form className="add-company-form" onSubmit={handleAddCompany}>
            <h3>Add New Company</h3>
            <input
              type="text"
              placeholder="Company Name"
              value={newCompany.name}
              onChange={(e) => setNewCompany({ ...newCompany, name: e.target.value })}
              required
            />
            <textarea
              placeholder="Description"
              value={newCompany.description}
              onChange={(e) => setNewCompany({ ...newCompany, description: e.target.value })}
              rows="3"
            />
            <input
              type="text"
              placeholder="Country"
              value={newCompany.country}
              onChange={(e) => setNewCompany({ ...newCompany, country: e.target.value })}
              required
            />
            <input
              type="text"
              placeholder="Category"
              value={newCompany.category}
              onChange={(e) => setNewCompany({ ...newCompany, category: e.target.value })}
            />
            <input
              type="url"
              placeholder="Website"
              value={newCompany.website}
              onChange={(e) => setNewCompany({ ...newCompany, website: e.target.value })}
            />
            <input
              type="url"
              placeholder="Logo URL"
              value={newCompany.logo_url}
              onChange={(e) => setNewCompany({ ...newCompany, logo_url: e.target.value })}
            />
            <button type="submit" className="btn-submit">Add Company</button>
          </form>
        )}

        {/* Results Info */}
        <p className="results-count">
          {filteredCompanies.length} company{filteredCompanies.length !== 1 ? "ies" : ""} found
        </p>

        {/* Companies Grid */}
        <div className="companies-grid">
          {filteredCompanies.length === 0 ? (
            <p className="no-results">No companies found. Try adjusting your filters.</p>
          ) : (
            filteredCompanies.map((company) => (
              <div key={company.id} className="company-card">
                {company.logo_url && (
                  <img
                    src={company.logo_url}
                    alt={company.name}
                    className="company-logo"
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                )}
                <div className="company-content">
                  <h3>{company.name}</h3>
                  {company.category && <p className="category">{company.category}</p>}
                  {company.founded && <p className="founded">Founded: {company.founded}</p>}
                  {company.description && <p className="description">{company.description}</p>}
                  {company.overview && <p className="overview">{company.overview}</p>}
                  
                  {company.solutions && company.solutions.length > 0 && (
                    <div className="solutions">
                      <strong>Solutions:</strong>
                      <ul>
                        {company.solutions.slice(0, 3).map((solution, idx) => (
                          <li key={idx}>{solution}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  <div className="company-meta">
                    <span className="country">📍 {company.country}</span>
                    {company.views && <span className="stats">👁️ {company.views} views</span>}
                    {company.bookings_count && <span className="stats">📱 {company.bookings_count} bookings</span>}
                  </div>
                  {(company.website || company.officialLink) && (
                    <a 
                      href={company.website || company.officialLink} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="website-link"
                    >
                      Visit Website
                    </a>
                  )}
                </div>
                <Link to={`/company/${company.id}`} style={{ textDecoration: "none" }}>
                  <button className="btn-view">
                    View Details
                  </button>
                </Link>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
