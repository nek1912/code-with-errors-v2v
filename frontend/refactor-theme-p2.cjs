const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

const replacements = [
  // Primary buttons & interactions
  { from: /bg-blue-600/g, to: 'bg-royal-500' },
  { from: /hover:bg-blue-500/g, to: 'hover:bg-royal-600' },
  { from: /bg-indigo-600/g, to: 'bg-royal-500' },
  { from: /hover:bg-indigo-500/g, to: 'hover:bg-royal-600' },
  { from: /text-blue-500/g, to: 'text-royal-500' },
  { from: /text-blue-400/g, to: 'text-royal-500' },
  { from: /border-blue-500/g, to: 'border-royal-500' },
  
  // Specific component updates for SOS / Alerts
  { from: /bg-red-600/g, to: 'bg-gold-500' },
  { from: /hover:bg-red-500/g, to: 'hover:bg-gold-400' },
  { from: /shadow-\[0_0_50px_rgba\(220,38,38,0\.6\)\]/g, to: 'shadow-[0_0_50px_rgba(245,158,11,0.6)]' },
  { from: /border-red-900/g, to: 'border-gold-700' },
  { from: /focus:ring-red-500/g, to: 'focus:ring-gold-500' },
  { from: /border-red-500/g, to: 'border-gold-500' },
  { from: /shadow-red-500\/50/g, to: 'shadow-gold-500/50' },
  
  // Text contrast on SOS buttons
  { from: /text-white font-bold shadow-lg transform -translate-y-4/g, to: 'text-navy-900 font-bold shadow-lg transform -translate-y-4' },
  { from: /text-4xl font-extrabold tracking-wider z-10/g, to: 'text-4xl font-extrabold tracking-wider z-10 text-navy-900' }
];

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let originalContent = content;
      
      replacements.forEach(r => {
        content = content.replace(r.from, r.to);
      });
      
      if (content !== originalContent) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated: ${fullPath}`);
      }
    }
  }
}

processDirectory(srcDir);
console.log('Premium refactor phase 2 complete.');
