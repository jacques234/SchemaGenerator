// Script para generar config.js con variables de entorno de Netlify
const fs = require('fs');

const config = `// ===== Configuración de Supabase (Generado automáticamente) =====
const CONFIG = {
    SUPABASE_URL: '${process.env.SUPABASE_URL || 'https://example.supabase.co'}',
    SUPABASE_ANON_KEY: '${process.env.SUPABASE_ANON_KEY || 'your-anon-key'}'
};

export default CONFIG;
`;

fs.writeFileSync('config.js', config);
console.log('✅ config.js generado con las variables de entorno');
