package org.example.imsbackend.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class StockMovementFilter {
    private Integer page = 0;
    private Integer size = 10;

    public StockMovementFilter(Integer page, Integer size) {
        this.page = page != null ? page : 0;
        this.size = size != null ? size : 10;
    }
}
