/**
 * Converts a Zod schema to an OpenAPI 3.0-compatible JSON Schema subset
 * supported natively by the Gemini responseSchema generation configuration.
 */
export function zodToOpenApi(zodSchema: any): any {
  if (!zodSchema) return undefined;

  // Access internal _def property of the Zod type
  const def = zodSchema._def;
  if (!def) return undefined;

  const typeName = def.typeName;

  switch (typeName) {
    case 'ZodString':
      return { type: 'string' };

    case 'ZodNumber':
      return { type: 'number' };

    case 'ZodBoolean':
      return { type: 'boolean' };

    case 'ZodEnum':
      return {
        type: 'string',
        enum: def.values
      };

    case 'ZodArray':
      return {
        type: 'array',
        items: zodToOpenApi(def.type)
      };

    case 'ZodObject': {
      const properties: Record<string, any> = {};
      const required: string[] = [];

      for (const [key, value] of Object.entries(def.shape())) {
        const propSchema = zodToOpenApi(value);
        if (propSchema) {
          properties[key] = propSchema;
        }

        // Determine if field is optional/nullable
        let isOptional = false;
        let currentType = value as any;
        while (currentType && currentType._def) {
          const tName = currentType._def.typeName;
          if (tName === 'ZodOptional' || tName === 'ZodNullable') {
            isOptional = true;
            break;
          }
          currentType = currentType._def.innerType;
        }
        if (!isOptional) {
          required.push(key);
        }
      }

      return {
        type: 'object',
        properties,
        ...(required.length > 0 ? { required } : {})
      };
    }

    case 'ZodOptional':
    case 'ZodNullable':
      return zodToOpenApi(def.innerType);

    default:
      // Fallback safe value
      return { type: 'string' };
  }
}
