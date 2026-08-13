import Joi from "joi";

export const sharedListCreateSchema = Joi.object({
    name: Joi.string().min(3).max(255).required(),
    description: Joi.string().max(2000)
})

export const sharedListUpdateSchema = Joi.object({
    name: Joi.string().min(3).max(255),
    description: Joi.string().max(2000)
})

export const sharedListAddMemberSchema = Joi.object({
    userId: Joi.number().positive().not(0).required(),
    role: Joi.string().valid('reader', 'commenter', 'editor').default('reader')
})

export const sharedListRemoveMemberSchema = Joi.object({
    userId: Joi.number().positive().not(0).required()
})