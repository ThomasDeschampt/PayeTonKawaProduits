const Joi = require('joi');

const produitSchema = Joi.object({
    nom: Joi.string().required().min(3).max(100),
    description: Joi.string().required().min(10).max(500),
    prix: Joi.number().required().min(0).precision(2),
    stock: Joi.number().integer().required().min(0),
    categorie: Joi.string().required(),
    image: Joi.string().uri().optional(),
    disponible: Joi.boolean().default(true)
});

const updateProduitSchema = Joi.object({
    nom: Joi.string().min(3).max(100),
    description: Joi.string().min(10).max(500),
    prix: Joi.number().min(0).precision(2),
    stock: Joi.number().integer().min(0),
    categorie: Joi.string(),
    image: Joi.string().uri(),
    disponible: Joi.boolean()
}).min(1);

const validateProduit = (data) => {
    return produitSchema.validate(data, { abortEarly: false });
};

const validateUpdateProduit = (data) => {
    return updateProduitSchema.validate(data, { abortEarly: false });
};

module.exports = {
    validateProduit,
    validateUpdateProduit
}; 