package org.example.imsbackend.validators;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import org.example.imsbackend.annotations.ValidCategory;
import org.example.imsbackend.enums.Category;
import org.example.imsbackend.enums.StockMovementType;

public class ValidStockMovementTypeValidator implements ConstraintValidator<ValidCategory, Object> {
    @Override
    public boolean isValid(Object value, ConstraintValidatorContext context) {
        if (value == null || value instanceof StockMovementType)
            return true;
        if (!(value instanceof String))
            return false;

        try {
            Category.valueOf(((String) value).toUpperCase());
            return true;
        } catch (IllegalArgumentException e) {
            return false;
        }
    }
}