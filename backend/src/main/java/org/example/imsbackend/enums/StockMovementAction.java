package org.example.imsbackend.enums;

import lombok.Getter;

@Getter
public enum StockMovementAction {
    UPDATED("Updated"),
    DELETED("Deleted"),
    INSERTED("Inserted");

    private final String displayName;

    StockMovementAction(String displayName) {
        this.displayName = displayName;
    }
}
