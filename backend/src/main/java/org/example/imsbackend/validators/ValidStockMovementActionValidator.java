package org.example.imsbackend.validators;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import org.example.imsbackend.annotations.ValidStockMovementAction;
import org.example.imsbackend.enums.StockMovementAction;

public class ValidStockMovementActionValidator implements ConstraintValidator<ValidStockMovementAction, Object> {
    @Override
    public boolean isValid(Object value, ConstraintValidatorContext context) {
        if (value == null || value instanceof StockMovementAction)
            return true;
        if (!(value instanceof String))
            return false;

        try {
            StockMovementAction.valueOf(((String) value).toUpperCase());
            return true;
        } catch (IllegalArgumentException e) {
            return false;
        }
    }
}