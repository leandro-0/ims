package org.example.imsbackend.validators;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import org.example.imsbackend.enums.Category;
import org.example.imsbackend.annotations.ValidCategory;

public class ValidCategoryValidator implements ConstraintValidator<ValidCategory, String> {
    private boolean useDisplayName;

    @Override
    public void initialize(ValidCategory constraintAnnotation) {
        this.useDisplayName = constraintAnnotation.useDisplayName();
    }

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        if (value == null) return true;

        if (useDisplayName) {
            for (Category category : Category.values()) {
                if (category.getDisplayName().equals(value)) {
                    return true;
                }
            }
        } else {
            try {
                Category.valueOf(value.toUpperCase());
                return true;
            } catch (IllegalArgumentException e) {
                return false;
            }
        }

        return false;
    }
}