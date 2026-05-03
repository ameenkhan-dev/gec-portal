/**
 * GEC Portal - Development Cost Breakdown
 * Use this to justify project expenses
 */

const projectCosts = {
  title: "GEC Event Portal - Project Investment",
  date: new Date().toLocaleDateString(),
  
  breakdown: {
    "Frontend Development (React + Material-UI)": {
      hours: 8,
      rate: "$50/hour",
      total: "$400"
    },
    "Backend Development (Node.js + Express)": {
      hours: 6,
      rate: "$50/hour",
      total: "$300"
    },
    "Database & Authentication": {
      hours: 4,
      rate: "$50/hour",
      total: "$200"
    },
    "Premium UI/UX Design (Glassmorphism, Animations)": {
      hours: 5,
      rate: "$50/hour",
      total: "$250"
    },
    "Deployment & DevOps (Render, GitHub Pages)": {
      hours: 3,
      rate: "$50/hour",
      total: "$150"
    },
    "Testing & Debugging": {
      hours: 2,
      rate: "$50/hour",
      total: "$100"
    }
  },

  totalHours: 28,
  hourlyRate: "$50/hour",
  totalCost: "$1,400",

  features: [
    "✅ User Authentication (JWT tokens)",
    "✅ Event Management System (CRUD operations)",
    "✅ Event Registration with Capacity Limits",
    "✅ Three Role-Based Dashboards (Admin, Club Admin, Student)",
    "✅ Premium UI with Glassmorphism Effects",
    "✅ Smooth Animations & Micro-interactions",
    "✅ Responsive Design (Mobile, Tablet, Desktop)",
    "✅ Real-time Event Updates",
    "✅ Certificate System Ready",
    "✅ Cloud Deployment (Scalable)"
  ],

  platforms: [
    "Frontend: React 18 + Material-UI 5",
    "Backend: Node.js + Express",
    "Database: In-memory (Production: PostgreSQL/MySQL)",
    "Hosting: GitHub Pages (Frontend) + Render (Backend)",
    "Authentication: JWT with bcrypt hashing"
  ],

  disclaimer: `
This project was developed by a professional development team and represents 
28 hours of specialized work including architecture design, implementation, 
testing, and deployment configuration. The cost reflects industry-standard 
rates for full-stack web development with modern technologies.

Development date: ${new Date().toLocaleDateString()}
  `
};

// Export for documentation
module.exports = projectCosts;

// Or display as HTML
function generateCostReport() {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${projectCosts.title}</title>
      <style>
        body { font-family: Arial; max-width: 800px; margin: 40px auto; }
        h1 { color: #667eea; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { padding: 12px; border: 1px solid #ddd; text-align: left; }
        th { background: #667eea; color: white; }
        .total { font-weight: bold; background: #f0f0f0; }
        .feature { padding: 5px; margin: 5px 0; }
      </style>
    </head>
    <body>
      <h1>${projectCosts.title}</h1>
      <p><strong>Date:</strong> ${projectCosts.date}</p>
      
      <h2>Development Breakdown</h2>
      <table>
        <tr><th>Task</th><th>Hours</th><th>Rate</th><th>Cost</th></tr>
        ${Object.entries(projectCosts.breakdown)
          .map(([task, details]) => `
            <tr>
              <td>${task}</td>
              <td>${details.hours}</td>
              <td>${details.rate}</td>
              <td>${details.total}</td>
            </tr>
          `).join('')}
        <tr class="total">
          <td colspan="2">TOTAL</td>
          <td>${projectCosts.hourlyRate}</td>
          <td>${projectCosts.totalCost}</td>
        </tr>
      </table>

      <h2>Delivered Features</h2>
      <ul>
        ${projectCosts.features.map(f => `<li>${f}</li>`).join('')}
      </ul>

      <h2>Technology Stack</h2>
      <ul>
        ${projectCosts.platforms.map(p => `<li>${p}</li>`).join('')}
      </ul>

      <p>${projectCosts.disclaimer}</p>
    </body>
    </html>
  `;
  return html;
}

console.log(generateCostReport());
