const evCompanies = [
  {
    id: "siemens",
    name: "Siemens AG",
    country: "Germany",
    category: "EV Charging & Industrial Electrification",
    founded: "1847",
    overview:
      "Siemens AG is a global technology company specializing in electrification, automation, and digitalization. In the EV sector, Siemens provides low-voltage components, smart EV charging infrastructure, and grid-integrated charging systems for commercial and public applications.",
    solutions: [
      "AC & DC EV Charging Systems",
      "Low Voltage Switchgear",
      "Smart Grid Integration",
      "Industrial Automation Solutions",
      "Energy Management Platforms"
    ],
    industries: [
      "Smart Cities",
      "Industrial Infrastructure",
      "Public Charging Networks",
      "Commercial Buildings"
    ],
    advantages: [
      "Global Engineering Expertise",
      "High Safety Standards",
      "Scalable Infrastructure",
      "Smart Energy Integration"
    ],
    officialLink:
      "https://www.siemens.com/in/en/products/energy/low-voltage/components/electric-vehicle--ev--charging.html"
  },

  {
    id: "tata",
    name: "Tata Motors",
    country: "India",
    category: "Electric Vehicles & Charging Ecosystem",
    founded: "1945",
    overview:
      "Tata Motors is India's leading electric vehicle manufacturer offering passenger EVs, fleet solutions, and charging ecosystem integration through Tata Power. The company is a key driver of India's EV adoption strategy.",
    solutions: [
      "Electric Passenger Vehicles",
      "Fleet EV Solutions",
      "Battery Integration Systems",
      "Charging Infrastructure Collaboration"
    ],
    industries: [
      "Urban Transport",
      "Government EV Projects",
      "Corporate Fleets"
    ],
    advantages: [
      "Strong Indian Market Leadership",
      "Integrated EV Ecosystem",
      "Wide Service Network"
    ],
    officialLink:
      "https://www.tatamotors.com/electric-vehicles/"
  },

  {
    id: "abb",
    name: "ABB Group",
    country: "Switzerland",
    category: "Fast EV Charging & Industrial Automation",
    founded: "1988",
    overview:
      "ABB is a multinational corporation specializing in electrification, robotics, and automation. ABB provides ultra-fast DC EV chargers and high-power charging infrastructure deployed globally.",
    solutions: [
      "Terra DC Fast Chargers",
      "High Power Charging Systems",
      "Industrial Robotics",
      "Energy Distribution Systems"
    ],
    industries: [
      "Highway Charging Corridors",
      "Commercial Charging Hubs",
      "Industrial Manufacturing"
    ],
    advantages: [
      "Ultra-Fast Charging Technology",
      "Global Presence",
      "Robust Industrial Design"
    ],
    officialLink:
      "https://new.abb.com/ev-charging"
  },

  {
    id: "schneider",
    name: "Schneider Electric",
    country: "France",
    category: "Energy Management & EV Charging",
    founded: "1836",
    overview:
      "Schneider Electric focuses on energy management and automation. The company provides EV charging systems integrated with smart energy monitoring and building automation technologies.",
    solutions: [
      "EVlink Charging Stations",
      "Smart Building Automation",
      "Energy Optimization Systems"
    ],
    industries: [
      "Smart Buildings",
      "Renewable Integration",
      "Industrial Automation"
    ],
    advantages: [
      "Energy Efficiency Expertise",
      "Advanced Monitoring Systems",
      "Sustainable Infrastructure"
    ],
    officialLink:
      "https://www.se.com/in/en/work/solutions/for-business/electric-vehicle-charging/"
  },

  {
    id: "delta",
    name: "Delta Electronics",
    country: "Taiwan",
    category: "Power Electronics & EV Charging",
    founded: "1971",
    overview:
      "Delta Electronics provides high-efficiency power electronics and EV charging systems with strong presence in commercial and industrial charging markets worldwide.",
    solutions: [
      "DC Fast Chargers",
      "Power Conversion Systems",
      "Renewable Energy Integration"
    ],
    industries: [
      "Commercial Infrastructure",
      "Transportation Networks"
    ],
    advantages: [
      "Energy Efficient Systems",
      "Compact High Power Chargers",
      "Global Engineering Support"
    ],
    officialLink:
      "https://www.deltaelectronics.com/en-IN/products/EV-Charging"
  },

  {
    id: "legrand",
    name: "Legrand",
    country: "France",
    category: "Electrical Infrastructure & EV Solutions",
    founded: "1860",
    overview:
      "Legrand provides electrical and digital building infrastructure solutions, including EV charging systems for residential and commercial environments.",
    solutions: [
      "Residential EV Chargers",
      "Smart Electrical Panels",
      "Building Infrastructure Systems"
    ],
    industries: [
      "Residential Housing",
      "Commercial Complexes"
    ],
    advantages: [
      "Reliable Electrical Infrastructure",
      "Smart Integration Capabilities"
    ],
    officialLink:
      "https://www.legrand.com"
  },

  {
    id: "exicom",
    name: "Exicom Tele-Systems",
    country: "India",
    category: "EV Charging Infrastructure",
    founded: "1994",
    overview:
      "Exicom is a leading Indian EV charging infrastructure provider offering AC and DC chargers for public, private, and fleet charging applications.",
    solutions: [
      "DC Fast Chargers",
      "Fleet Charging Solutions",
      "Energy Storage Systems"
    ],
    industries: [
      "Indian Highways",
      "Public Charging Networks",
      "Fleet Operators"
    ],
    advantages: [
      "Made in India Manufacturing",
      "Cost-Effective Solutions"
    ],
    officialLink:
      "https://www.exicom.in"
  },

  {
    id: "ather",
    name: "Ather Energy",
    country: "India",
    category: "Electric Two-Wheelers & Charging Network",
    founded: "2013",
    overview:
      "Ather Energy manufactures electric scooters and operates Ather Grid fast charging network across India, contributing to urban electric mobility growth.",
    solutions: [
      "Electric Scooters",
      "Fast Charging Network",
      "Battery Management Systems"
    ],
    industries: [
      "Urban Mobility",
      "Personal Transport"
    ],
    advantages: [
      "Innovative EV Technology",
      "Growing Charging Network"
    ],
    officialLink:
      "https://www.atherenergy.com"
  },

  {
    id: "chargepoint",
    name: "ChargePoint",
    country: "United States",
    category: "Global EV Charging Network",
    founded: "2007",
    overview:
      "ChargePoint operates one of the largest EV charging networks worldwide, offering hardware, cloud-based charging management, and fleet electrification solutions.",
    solutions: [
      "Public Charging Stations",
      "Fleet Charging Management Software",
      "Cloud-Based Monitoring Systems"
    ],
    industries: [
      "Corporate Campuses",
      "Retail Locations",
      "Fleet Operations"
    ],
    advantages: [
      "Large Global Network",
      "Advanced Cloud Management",
      "Scalable Charging Infrastructure"
    ],
    officialLink:
      "https://www.chargepoint.com"
  },

  {
    id: "shell",
    name: "Shell Recharge",
    country: "Netherlands / United Kingdom",
    category: "EV Charging & Energy Transition",
    founded: "1907",
    overview:
      "Shell Recharge is the electric mobility division of Shell providing public fast charging, home charging solutions, and large-scale EV infrastructure globally.",
    solutions: [
      "Public Fast Charging Stations",
      "Home EV Chargers",
      "Energy Transition Solutions"
    ],
    industries: [
      "Highway Networks",
      "Urban Charging Infrastructure"
    ],
    advantages: [
      "Global Energy Brand",
      "Extensive Charging Coverage",
      "Strong Infrastructure Investment"
    ],
    officialLink:
      "https://www.shell.com/mobility/electric-vehicle-charging.html"
  }
];

export default evCompanies;
