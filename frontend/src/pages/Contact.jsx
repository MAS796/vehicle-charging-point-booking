import { useState } from "react";
import api from "../services/api";
import { getErrorMessage } from "../utils/error";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await api.post("/contact", formData);
      setSuccess("Thank you! We'll get back to you soon.");
      setFormData({ name: "", email: "", company: "", subject: "", message: "" });
    } catch (err) {
      setError(getErrorMessage(err, "Failed to send message"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Contact Us
          </h1>
          <p className="text-gray-400 text-lg">
            Have questions? We'd love to hear from you.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="bg-slate-800 rounded-2xl p-8 border border-cyan-500/30">
            <h2 className="text-2xl font-semibold mb-6 text-cyan-400">Send a Message</h2>

            {error && (
              <div className="mb-4 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300">
                {error}
              </div>
            )}
            {success && (
              <div className="mb-4 p-4 bg-green-500/20 border border-green-500/50 rounded-lg text-green-300">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 text-sm mb-2">Your Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm mb-2">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-gray-300 text-sm mb-2">Company (Optional)</label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-gray-300 text-sm mb-2">Subject</label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-gray-300 text-sm mb-2">Message</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-cyan-500 focus:outline-none resize-none"
                ></textarea>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg font-semibold hover:from-cyan-600 hover:to-blue-700 transition disabled:opacity-50"
              >
                {loading ? "Sending..." : "Send Message"}
              </button>
            </form>
          </div>

          {/* Contact Info */}
          <div className="space-y-8">
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <h3 className="text-lg font-semibold text-cyan-400 mb-4">📍 Head Office</h3>
              <p className="text-gray-300">
                EV Charging Network Pvt. Ltd.<br />
                123 Green Energy Park<br />
                Bangalore, Karnataka 560001<br />
                India
              </p>
            </div>

            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <h3 className="text-lg font-semibold text-cyan-400 mb-4">📞 Contact Details</h3>
              <p className="text-gray-300 mb-2">
                <strong>Phone:</strong> 100-1234-987
              </p>
              <p className="text-gray-300 mb-2">
                <strong>Email:</strong> support@evcharging.in
              </p>
              <p className="text-gray-300">
                <strong>Support:</strong> 24/7 Available
              </p>
            </div>

            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <h3 className="text-lg font-semibold text-cyan-400 mb-4">🕐 Business Hours</h3>
              <p className="text-gray-300 mb-2">
                <strong>Monday - Friday:</strong> 9:00 AM - 6:00 PM
              </p>
              <p className="text-gray-300 mb-2">
                <strong>Saturday:</strong> 10:00 AM - 4:00 PM
              </p>
              <p className="text-gray-300">
                <strong>Sunday:</strong> Closed
              </p>
            </div>

            <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-3">💼 Partner With Us</h3>
              <p className="text-gray-300 text-sm mb-4">
                Interested in installing EV charging stations at your location? 
                Get in touch with our business development team.
              </p>
              <a 
                href="mailto:partnerships@evcharging.in"
                className="inline-block px-6 py-2 bg-cyan-500 text-white rounded-lg font-medium hover:bg-cyan-600 transition"
              >
                Email Partnerships Team
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
