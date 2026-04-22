import { Link } from "react-router-dom";

export default function About() {
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Hero */}
      <section className="py-20 px-4 bg-gradient-to-b from-slate-800 to-slate-900">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            About EV Charging Network
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            Powering India's Electric Future
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-cyan-400 mb-6">Our Mission</h2>
              <p className="text-gray-300 text-lg leading-relaxed mb-4">
                We're building India's most reliable and accessible EV charging infrastructure. 
                Our mission is to accelerate the transition to sustainable transportation by 
                making EV charging convenient, affordable, and available everywhere.
              </p>
              <p className="text-gray-300 text-lg leading-relaxed">
                With over 500+ charging stations across 50+ cities, we're committed to 
                eliminating range anxiety and making electric vehicles a practical choice 
                for every Indian.
              </p>
            </div>
            <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-2xl p-8">
              <div className="grid grid-cols-2 gap-6 text-center">
                <div>
                  <p className="text-4xl font-bold text-cyan-400">500+</p>
                  <p className="text-gray-400">Charging Stations</p>
                </div>
                <div>
                  <p className="text-4xl font-bold text-cyan-400">50+</p>
                  <p className="text-gray-400">Cities</p>
                </div>
                <div>
                  <p className="text-4xl font-bold text-cyan-400">25K+</p>
                  <p className="text-gray-400">Happy Users</p>
                </div>
                <div>
                  <p className="text-4xl font-bold text-cyan-400">150K+</p>
                  <p className="text-gray-400">Charging Sessions</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 px-4 bg-slate-800/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-white mb-12">Our Values</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-cyan-500/50 transition">
              <div className="text-4xl mb-4">🌱</div>
              <h3 className="text-xl font-semibold text-cyan-400 mb-3">Sustainability</h3>
              <p className="text-gray-400">
                We're committed to reducing carbon emissions and creating a cleaner future 
                for generations to come.
              </p>
            </div>
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-cyan-500/50 transition">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-semibold text-cyan-400 mb-3">Innovation</h3>
              <p className="text-gray-400">
                Leveraging cutting-edge technology to deliver the fastest and most reliable 
                charging experience.
              </p>
            </div>
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-cyan-500/50 transition">
              <div className="text-4xl mb-4">🤝</div>
              <h3 className="text-xl font-semibold text-cyan-400 mb-3">Accessibility</h3>
              <p className="text-gray-400">
                Making EV charging available to everyone, everywhere, with transparent 
                pricing and easy booking.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About - Simple Version */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-6">About Us</h2>
          <p className="text-lg text-gray-300">
            We are building India's most reliable and accessible EV charging network. Our mission is to make electric vehicle charging convenient, affordable, and available everywhere. Join us in driving the future of sustainable transportation!
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-gradient-to-r from-cyan-600 to-blue-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Go Electric?</h2>
          <p className="text-cyan-100 mb-8 text-lg">
            Join thousands of EV owners who trust us for their charging needs.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link 
              to="/stations" 
              className="px-8 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition"
            >
              Find Stations
            </Link>
            <Link 
              to="/register" 
              className="px-8 py-3 bg-transparent border-2 border-white text-white rounded-lg font-semibold hover:bg-white/10 transition"
            >
              Create Account
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
