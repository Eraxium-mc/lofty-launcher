const express = require('express');
const app = express();
const path = require('path');
const cookieParser = require('cookie-parser');
const fs = require('fs');
const toml = require('toml');

app.use(cookieParser());
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use('/assets', express.static(path.join(__dirname, 'assets')));

let specs = {};
const specsPath = path.join(__dirname, 'views', 'specs.toml');

try {
    // Lire et parser le fichier specs.toml
    const specsFile = fs.readFileSync(specsPath, 'utf-8');
    specs = toml.parse(specsFile);
    console.log('Fichier TOML chargé avec succès.');
} catch (err) {
    console.error('Erreur lors de la lecture du fichier TOML:', err.message);
}

// Middleware pour gérer la langue
app.use((req, res, next) => {
    const defaultLang = 'fr';
    let lang = req.cookies.lang || defaultLang;
    req.lang = lang;
    res.locals.lang = lang;
    next();
});

// Route pour changer la langue
app.get('/change-lang/:lang', (req, res) => {
    const lang = req.params.lang;
    if (lang === 'fr' || lang === 'en') {
        res.cookie('lang', lang, { maxAge: 900000, httpOnly: true });
    }
    res.redirect('back');
});

// Route d'accueil
app.get('/', (req, res) => {
    const messages = {
        fr: { title: 'Page d\'accueil' },
        en: { title: 'Home Page' }
    };
    res.render('index', messages[req.lang]);
});

// Route pour MineBox
app.get('/minebox', (req, res) => {
    const lang = req.lang || 'fr';  // La langue par défaut est 'fr'
    const offers = specs[lang] ? specs[lang].offers : [];

    if (!offers || offers.length === 0) {
        console.log('No offers available for language:', lang);
    }

    res.render('minebox', { lang: lang, offers: offers });
});




// Route pour Serveurs Jeux
app.get('/srvgames', (req, res) => {
    const messages = {
        fr: { title: 'Serveurs Jeux' },
        en: { title: 'Game Servers' }
    };
    const offers = specs[req.lang] ? specs[req.lang].offers : [];  // Assurez-vous que 'offers' existe
    res.render('srvgames', { ...messages[req.lang], offers });
});

// Route pour WebCloud
app.get('/webcloud', (req, res) => {
    const messages = {
        fr: { title: 'WebCloud' },
        en: { title: 'WebCloud' }
    };
    res.render('webcloud', messages[req.lang]);
});

// Route pour VPS
app.get('/vps', (req, res) => {
    const messages = {
        fr: { title: 'VPS' },
        en: { title: 'VPS' }
    };
    res.render('vps', messages[req.lang]);
});

// Route 404
app.use((req, res, next) => {
    const errorMessages = {
        fr: { title: 'Page non trouvée', message: '404 - Page non trouvée', description: 'La page que vous recherchez n\'existe pas.' },
        en: { title: 'Page Not Found', message: '404 - Page Not Found', description: 'The page you are looking for does not exist.' }
    };
    res.status(404).render('errors/404', errorMessages[req.lang]);
});

// Route 503 (Simule une erreur 503)
app.use((err, req, res, next) => {
    console.error(err.stack);
    const errorMessages = {
        fr: { title: 'Service non disponible', message: '503 - Service non disponible', description: 'Le service est temporairement indisponible. Veuillez réessayer plus tard.' },
        en: { title: 'Service Unavailable', message: '503 - Service Unavailable', description: 'The service is temporarily unavailable. Please try again later.' }
    };
    res.status(503).render('errors/503', errorMessages[req.lang]);
});

const PORT = process.env.PORT || 3007;
app.listen(PORT, () => {
    console.log(`Le serveur fonctionne sur http://localhost:${PORT}`);
});
