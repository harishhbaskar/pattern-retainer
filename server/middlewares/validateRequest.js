import { z } from 'zod';

export const validateRequest = (schema) => async (req, res, next) => {
  try {
    await schema.parseAsync({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    return next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: "Validation Error",
        errors: error.errors.map(e => ({ path: e.path.join('.'), message: e.message }))
      });
    }
    return res.status(500).json({ message: "Internal server error during validation" });
  }
};
