package org.example.imsbackend.annotations;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import org.example.imsbackend.validators.ValidCategoryValidator;

import java.lang.annotation.*;

@Documented
@Constraint(validatedBy = ValidCategoryValidator.class)
@Target({ElementType.FIELD, ElementType.METHOD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
public @interface ValidCategory {
    String message() default "Invalid category";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
    boolean useDisplayName() default false;
}