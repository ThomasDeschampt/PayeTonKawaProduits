const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Afficher un produit par id
const afficher = async (req, res) => {
    try {
        const { uuid } = req.params; // Changement de nom pour clarifier
        console.log("UUID du produit à afficher:", uuid);
        
        // Validation optionnelle de l'UUID
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(uuid)) {
            return res.status(400).json({
                success: false,
                message: 'UUID invalide'
            });
        }

        const produit = await prisma.produit.findUnique({
            where: {
                id: uuid // ← Plus de parseInt(), directement l'UUID !
            }
        });

        if (!produit) {
            return res.status(404).json({
                success: false,
                message: 'Produit non trouvé'
            });
        }

        res.json({
            success: true,
            data: produit
        });
    } catch (error) {
        console.error('Erreur:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur'
        });
    }
}

module.exports = afficher;