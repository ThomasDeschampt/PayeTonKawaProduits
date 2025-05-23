const express = require('express');
const router = express.Router();

const authorized = require('../middleware/auth');

//controllers de produits
const afficher = require('../controllers/produits/afficher.js');
const afficherAll = require('../controllers/produits/afficherAll');
const ajouter = require('../controllers/produits/ajouter');
const supprimer = require('../controllers/produits/supprimer');
const modifier = require('../controllers/produits/modifier');


router.post('/afficher', authorized, afficher);
router.get('/afficherAll', authorized, afficherAll);
router.post('/ajouter', authorized, ajouter);
router.put('/modifier/:id', authorized, modifier);
router.delete('/supprimer/:id', authorized, supprimer);

module.exports = router;