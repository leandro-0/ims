package org.example.imsbackend.annotations;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import org.example.imsbackend.validators.ValidStockMovementActionValidator;

import java.lang.annotation.*;

@Documented
@Constraint(validatedBy = ValidStockMovementActionValidator.class)
@Target({ ElementType.FIELD, ElementType.METHOD, ElementType.PARAMETER })
@Retention(RetentionPolicy.RUNTIME)
public @interface ValidStockMovementAction {
    String message() default "Invalid stock movement action";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}