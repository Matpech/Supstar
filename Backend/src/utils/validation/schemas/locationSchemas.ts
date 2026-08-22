import Joi from "joi";
import { countryCodes } from "./iso3166";

const VALID_LOCATION_TYPES = [
    'restaurant',
    'hotel',
    'bar',
    'museum',
    'activity',
    'landmark'
]

const VALID_STATUSES = [
    'to_be_visited',
    'visited',
    'favorite'
]

const VALID_SORT_OPTIONS = [
    'name',
    'average_rating',
    'price'
]

const VALID_ISO3166_CODES = Object.keys(countryCodes)

const openingTimesSingleDaySchema = Joi.object({
    open: Joi.string().regex(/^(?:[01]\d|2[0-3]):[0-5]\d$/).required(),
    close: Joi.string().regex(/^(?:[01]\d|2[0-3]):[0-5]\d$/).required()
})

export const locationCreateSchema = Joi.object({
    name: Joi.string().min(3).max(255).required(),
    category: Joi.string().valid(...VALID_LOCATION_TYPES).required(),
    price: Joi.number().min(0).required(),
    description: Joi.string().max(2000),
    opening_times: Joi.object({
        monday: openingTimesSingleDaySchema,
        tuesday: openingTimesSingleDaySchema,
        wednesday: openingTimesSingleDaySchema,
        thursday: openingTimesSingleDaySchema,
        friday: openingTimesSingleDaySchema,
        saturday: openingTimesSingleDaySchema,
        sunday: openingTimesSingleDaySchema
    }),
    tags: Joi.array().items(Joi.string().min(3).max(32)),
    status: Joi.string().valid(...VALID_STATUSES).default('visited'),

    full_address: Joi.string().min(3).max(255).required(),
    city: Joi.string().min(1).max(255).required(),
    country_code: Joi.string().length(2).valid(...VALID_ISO3166_CODES).required(),
    latitude: Joi.number().min(-90).max(90).required(),
    longitude: Joi.number().min(-180).max(180).required()
})

export const locationUpdateSchema = Joi.object({
    name: Joi.string().min(3).max(255),
    category: Joi.string().valid(...VALID_LOCATION_TYPES),
    price: Joi.number().min(0),
    description: Joi.string().max(2000),
    opening_times: Joi.object({
        monday: openingTimesSingleDaySchema,
        tuesday: openingTimesSingleDaySchema,
        wednesday: openingTimesSingleDaySchema,
        thursday: openingTimesSingleDaySchema,
        friday: openingTimesSingleDaySchema,
        saturday: openingTimesSingleDaySchema,
        sunday: openingTimesSingleDaySchema
    }),
    tags: Joi.array().items(Joi.string().min(3).max(32)),
    status: Joi.string().valid(...VALID_STATUSES),

    full_address: Joi.string().min(3).max(255),
    city: Joi.string().min(1).max(255),
    country_code: Joi.string().length(2).valid(...VALID_ISO3166_CODES),
    latitude: Joi.number().min(-90).max(90),
    longitude: Joi.number().min(-180).max(180)
})

export const galleryDeleteSchema = Joi.object({
    imageId: Joi.string().uuid().required()
})

export const locationSearchSchema = Joi.object({
    query: Joi.string().min(1).max(255),
    categories: Joi.array().items(Joi.string().valid(...VALID_LOCATION_TYPES)),
    city: Joi.string().min(1).max(255),
    country: Joi.string().length(2).valid(...VALID_ISO3166_CODES),
    minimumScore: Joi.number().min(1).max(5),
    prices: Joi.object({
        min: Joi.number().min(0),
        max: Joi.number().min(0)
    }),
    statuses: Joi.array().items(Joi.string().valid(...VALID_STATUSES)),

    sorting: Joi.object({
        sort_by: Joi.string().valid(...VALID_SORT_OPTIONS).required(),
        order: Joi.string().valid('asc', 'desc').required()
    })
})

export const locationImportSchema = Joi.array().items(locationCreateSchema)