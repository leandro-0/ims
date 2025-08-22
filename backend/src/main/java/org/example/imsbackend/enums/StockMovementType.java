package org.example.imsbackend.enums;

import lombok.Getter;

@Getter
public enum StockMovementType {
    INCOMING("IN"),
    OUTGOING("OUT");

    private final String displayName;

    StockMovementType(String displayName) {
        this.displayName = displayName;
    }
}
