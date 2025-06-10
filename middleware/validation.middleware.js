const { validateProduit, validateUpdateProduit } = require('../validators/produit.validator');

const validateRequest = (validator) => {
    return (req, res, next) => {
        const { error } = validator(req.body);
        if (error) {
            const errors = error.details.map(detail => ({
                field: detail.path[0],
                message: detail.message
            }));
            return res.status(400).json({
                success: false,
                message: 'Données invalides',
                errors
            });
        }
        next();
    };
};

const validateProduitRequest = validateRequest(validateProduit);
const validateUpdateProduitRequest = validateRequest(validateUpdateProduit);

module.exports = {
    validateProduitRequest,
    validateUpdateProduitRequest
}; 