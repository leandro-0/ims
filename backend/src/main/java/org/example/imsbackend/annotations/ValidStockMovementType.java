package org.example.imsbackend.annotations;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import org.example.imsbackend.validators.ValidStockMovementTypeValidator;

import java.lang.annotation.*;

@Documented
@Constraint(validatedBy = ValidStockMovementTypeValidator.class)
@Target({ ElementType.FIELD, ElementType.METHOD, ElementType.PARAMETER })
@Retention(RetentionPolicy.RUNTIME)
public @interface ValidStockMovementType {
    String message() default "Invalid stock movement type";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}