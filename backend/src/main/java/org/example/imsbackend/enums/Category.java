package org.example.imsbackend.enums;

import lombok.Getter;

@Getter
public enum Category {
    ELECTRONICS("Electronics"),
    FURNITURE("Furniture"),
    CLOTHING("Clothing"),
    FOOD("Food"),
    TOYS("Toys");

    private final String displayName;

    Category(String displayName) {
        this.displayName = displayName;
    }
}
