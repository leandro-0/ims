package org.example.imsbackend.validators;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import org.example.imsbackend.annotations.ValidStockMovementType;
import org.example.imsbackend.enums.StockMovementType;

public class ValidStockMovementTypeValidator implements ConstraintValidator<ValidStockMovementType, Object> {
    @Override
    public boolean isValid(Object value, ConstraintValidatorContext context) {
        if (value == null || value instanceof StockMovementType)
            return true;
        if (!(value instanceof String))
            return false;

        try {
            StockMovementType.valueOf(((String) value).toUpperCase());
            return true;
        } catch (IllegalArgumentException e) {
            return false;
        }
    }
}