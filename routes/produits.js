const express = require('express');
const router = express.Router();

const authorized = require('../middleware/auth');
const validateUUID = require('../middleware/uuidValidation.js');

//controllers de produits
const afficher = require('../controllers/produits/afficher.js');
const afficherAll = require('../controllers/produits/afficherAll');
const ajouter = require('../controllers/produits/ajouter');
const supprimer = require('../controllers/produits/supprimer');
const modifier = require('../controllers/produits/modifier');


router.get('/afficher/:uuid', authorized, validateUUID, afficher);
router.get('/afficherAll', authorized, afficherAll);
router.post('/ajouter', authorized, ajouter);
router.put('/modifier/:uuid', authorized, validateUUID, modifier);
router.delete('/supprimer/:uuid', authorized, supprimer);

/**
 * @swagger
 * api/produit/afficher/{uuid}:
 *   get:
 *     summary: Afficher un produit par UUID
 *     description: Récupère les détails d'un produit spécifique en utilisant son identifiant UUID
 *     tags:
 *       - Produits
 *     parameters:
 *       - in: path
 *         name: uuid
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: L'identifiant unique du produit
 *         example: 9eca355c-1984-4601-a2bb-9a36a80f5187
 *     responses:
 *       200:
 *         description: Produit trouvé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                       description: Identifiant du produit
 *                       example: 9eca355c-1984-4601-a2bb-9a36a80f5187
 *                     nom:
 *                       type: string
 *                       description: Nom du produit
 *                       example: "Café Arabica"
 *                     prix:
 *                       type: number
 *                       format: float
 *                       description: Prix du produit
 *                       example: 10.99
 *                     description:
 *                       type: string
 *                       description: Description du produit
 *                       example: "Café de haute qualité"
 *                     stock:
 *                       type: integer
 *                       description: Quantité en stock
 *                       example: 150
 *                     photo_url:
 *                       type: string
 *                       format: uri
 *                       description: URL de la photo du produit
 *                       example: "https://example.com/images/cafe-arabica.jpg"
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       description: Date de création
 *                       example: "2024-01-15T10:30:00Z"
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       description: Date de dernière modification
 *                       example: "2024-01-15T10:30:00Z"
 *       400:
 *         description: UUID invalide
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "UUID invalide"
 *       404:
 *         description: Produit non trouvé
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Produit non trouvé"
 *       500:
 *         description: Erreur serveur interne
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Erreur serveur"
 */

/**
 * @swagger
 * api/produits:
 *   get:
 *     summary: Afficher tous les produits
 *     description: Récupère la liste complète de tous les produits, triés par date de création (plus récents en premier)
 *     tags:
 *       - Produits
 *     responses:
 *       200:
 *         description: Liste des produits récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         description: Identifiant du produit
 *                         example: 9eca355c-1984-4601-a2bb-9a36a80f5187
 *                       nom:
 *                         type: string
 *                         description: Nom du produit
 *                         example: "Café Arabica"
 *                       prix:
 *                         type: number
 *                         format: float
 *                         description: Prix du produit
 *                         example: 10.99
 *                       description:
 *                         type: string
 *                         description: Description du produit
 *                         example: "Café de haute qualité"
 *                       stock:
 *                         type: integer
 *                         description: Quantité en stock
 *                         example: 150
 *                       photo_url:
 *                         type: string
 *                         format: uri
 *                         description: URL de la photo du produit
 *                         example: "https://example.com/images/cafe-arabica.jpg"
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                         description: Date de création
 *                         example: "2024-01-15T10:30:00Z"
 *                       updated_at:
 *                         type: string
 *                         format: date-time
 *                         description: Date de dernière modification
 *                         example: "2024-01-15T10:30:00Z"
 *                 count:
 *                   type: integer
 *                   description: Nombre total de produits
 *                   example: 25
 *             examples:
 *               success:
 *                 summary: Réponse avec produits
 *                 value:
 *                   success: true
 *                   data: [
 *                     {
 *                       id: 9eca355c-1984-4601-a2bb-9a36a80f5187,
 *                       nom: "Café Arabica",
 *                       prix: 10.99,
 *                       description: "Café de haute qualité",
 *                       stock: 150,
 *                       photo_url: "https://example.com/images/cafe-arabica.jpg",
 *                       created_at: "2024-01-15T10:30:00Z",
 *                       updated_at: "2024-01-15T10:30:00Z"
 *                     },
 *                     {
 *                       id: 9eca355c-1984-4601-a2bb-9a36a80f5187,
 *                       nom: "Café Robusta",
 *                       prix: 12.99,
 *                       description: "Café robuste et corsé",
 *                       stock: 90,
 *                       photo_url: "https://example.com/images/cafe-robusta.jpg",
 *                       created_at: "2024-01-14T15:20:00Z",
 *                       updated_at: "2024-01-14T15:20:00Z"
 *                     }
 *                   ]
 *                   count: 2
 *               empty:
 *                 summary: Réponse sans produits
 *                 value:
 *                   success: true
 *                   data: []
 *                   count: 0
 *       500:
 *         description: Erreur serveur interne
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Erreur serveur"
 */

/**
 * @swagger
 * api/produit:
 *   post:
 *     summary: Ajouter un nouveau produit
 *     description: Crée un nouveau produit dans la base de données avec les informations fournies
 *     tags:
 *       - Produits
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nom
 *               - prix
 *             properties:
 *               nom:
 *                 type: string
 *                 description: Nom du produit
 *                 example: "Café Arabica"
 *                 minLength: 1
 *               description:
 *                 type: string
 *                 description: Description détaillée du produit (optionnel)
 *                 example: "Café de haute qualité"
 *                 nullable: true
 *               prix:
 *                 type: number
 *                 format: float
 *                 description: Prix du produit
 *                 example: 10.99
 *                 minimum: 0
 *               stock:
 *                 type: integer
 *                 description: Quantité en stock (optionnel, défaut = 0)
 *                 example: 50
 *                 minimum: 0
 *               photo_url:
 *                 type: string
 *                 format: uri
 *                 description: URL de la photo du produit (optionnel)
 *                 example: "https://example.com/images/cafe-arabica.jpg"
 *           examples:
 *             produit_complet:
 *               summary: Produit avec toutes les informations
 *               value:
 *                 nom: "Café Arabica"
 *                 description: "Café de haute qualité"
 *                 prix: 10.99
 *                 stock: 25
 *                 photo_url: "https://example.com/images/cafe-arabica.jpg"
 *             produit_minimal:
 *               summary: Produit avec informations minimales
 *               value:
 *                 nom: "Café Robusta"
 *                 prix: 12.99
 *     responses:
 *       201:
 *         description: Produit créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       description: Identifiant unique du produit créé
 *                       example: 9eca355c-1984-4601-a2bb-9a36a80f5187
 *                     nom:
 *                       type: string
 *                       description: Nom du produit
 *                       example: "Café Arabica"
 *                     description:
 *                       type: string
 *                       description: Description du produit
 *                       example: "Café de haute qualité"
 *                       nullable: true
 *                     prix:
 *                       type: number
 *                       format: float
 *                       description: Prix du produit
 *                       example: 10.99
 *                     stock:
 *                       type: integer
 *                       description: Quantité en stock
 *                       example: 25
 *                     photo_url:
 *                       type: string
 *                       format: uri
 *                       description: URL de la photo du produit
 *                       example: "https://example.com/images/cafe-arabica.jpg"
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                       description: Date de création
 *                       example: "2024-01-15T10:30:00Z"
 *                     updated_at:
 *                       type: string
 *                       format: date-time
 *                       description: Date de dernière modification
 *                       example: "2024-01-15T10:30:00Z"
 *                 message:
 *                   type: string
 *                   example: "Produit créé avec succès"
 *             example:
 *               success: true
 *               data:
 *                 id: 9eca355c-1984-4601-a2bb-9a36a80f5187
 *                 nom: "Café Arabica"
 *                 description: "Café de haute qualité"
 *                 prix: 10.99
 *                 stock: 25
 *                 photo_url: "https://example.com/images/cafe-arabica.jpg"
 *                 created_at: "2024-01-15T10:30:00Z"
 *                 updated_at: "2024-01-15T10:30:00Z"
 *               message: "Produit créé avec succès"
 *       400:
 *         description: Données manquantes ou invalides
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Le nom et le prix sont requis"
 *             examples:
 *               champs_requis:
 *                 summary: Champs requis manquants
 *                 value:
 *                   success: false
 *                   message: "Le nom et le prix sont requis"
 *       500:
 *         description: Erreur serveur interne
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Erreur serveur"
 */

/**
 * @swagger
 * api/produit/{id}:
 *   put:
 *     summary: Modifier un produit existant
 *     description: Met à jour les informations d'un produit spécifique. Seuls les champs fournis seront modifiés.
 *     tags:
 *       - Produits
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Identifiant unique du produit à modifier
 *         schema:
 *           type: string
 *           example: 9eca355c-1984-4601-a2bb-9a36a80f5187
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nom:
 *                 type: string
 *                 description: Nouveau nom du produit (optionnel)
 *                 example: "Café Arabica Premium"
 *               description:
 *                 type: string
 *                 description: Nouvelle description du produit (optionnel)
 *                 example: "Café de haute qualité, sélectionné à la main"
 *                 nullable: true
 *               prix:
 *                 type: number
 *                 format: float
 *                 description: Nouveau prix du produit (optionnel)
 *                 example: 13.99
 *               stock:
 *                 type: integer
 *                 description: Nouvelle quantité en stock (optionnel)
 *                 example: 30
 *               photo_url:
 *                 type: string
 *                 format: uri
 *                 description: Nouvelle URL de la photo du produit (optionnel)
 *                 example: "https://example.com/images/cafe-premium.jpg"
 *           examples:
 *             modification_complete:
 *               summary: Modification de tous les champs
 *               value:
 *                 nom: "Café Arabica Premium"
 *                 description: "Café de haute qualité, sélectionné à la main"
 *                 prix: 13.99
 *                 stock: 15
 *                 photo_url: "https://example.com/images/cafe-premium.jpg"
 *             modification_partielle:
 *               summary: Modification du prix seulement
 *               value:
 *                 prix: 14.99
 *             modification_stock:
 *               summary: Mise à jour du stock
 *               value:
 *                 stock: 100
 *     responses:
 *       200:
 *         description: Produit modifié avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       description: Identifiant du produit
 *                       example: 9eca355c-1984-4601-a2bb-9a36a80f5187
 *                     nom:
 *                       type: string
 *                       description: Nom du produit
 *                       example: "Café Arabica Premium"
 *                     description:
 *                       type: string
 *                       description: Description du produit
 *                       example: "Café de haute qualité, sélectionné à la main"
 *                       nullable: true
 *                     prix:
 *                       type: number
 *                       format: float
 *                       description: Prix du produit
 *                       example: 13.99
 *                     stock:
 *                       type: integer
 *                       description: Quantité en stock
 *                       example: 30
 *                     photo_url:
 *                       type: string
 *                       format: uri
 *                       description: URL de la photo du produit
 *                       example: "https://example.com/images/cafe-premium.jpg"
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                       description: Date de création
 *                       example: "2024-01-15T10:30:00Z"
 *                     updated_at:
 *                       type: string
 *                       format: date-time
 *                       description: Date de dernière modification
 *                       example: "2024-01-15T16:45:00Z"
 *                 message:
 *                   type: string
 *                   example: "Produit mis à jour avec succès"
 *             example:
 *               success: true
 *               data:
 *                 id: 9eca355c-1984-4601-a2bb-9a36a80f5187
 *                 nom: "Café Arabica Premium"
 *                 description: "Café de haute qualité, sélectionné à la main"
 *                 prix: 13.99
 *                 stock: 30
 *                 photo_url: "https://example.com/images/cafe-premium.jpg"
 *                 created_at: "2024-01-15T10:30:00Z"
 *                 updated_at: "2024-01-15T16:45:00Z"
 *               message: "Produit mis à jour avec succès"
 *       404:
 *         description: Produit non trouvé
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Produit non trouvé"
 *       500:
 *         description: Erreur serveur interne
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Erreur serveur"
 */


/**
 * @swagger
 * api/produit/supprimer:
 *   delete:
 *     summary: Supprimer un produit
 *     description: Supprime définitivement un produit de la base de données en utilisant son identifiant
 *     tags:
 *       - Produits
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *             properties:
 *               id:
 *                 type: string
 *                 description: Identifiant unique du produit à supprimer
 *                 example: 9eca355c-1984-4601-a2bb-9a36a80f5187
 *                 minimum: 1
 *           examples:
 *             suppression:
 *               summary: Suppression d'un produit
 *               value:
 *                 id: 9eca355c-1984-4601-a2bb-9a36a80f5187
 *     responses:
 *       200:
 *         description: Produit supprimé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Produit supprimé avec succès"
 *             example:
 *               success: true
 *               message: "Produit supprimé avec succès"
 *       404:
 *         description: Produit non trouvé
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Produit non trouvé"
 *             example:
 *               success: false
 *               message: "Produit non trouvé"
 *       500:
 *         description: Erreur serveur interne
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Erreur serveur"
 *             example:
 *               success: false
 *               message: "Erreur serveur"
 */ 

module.exports = router;
