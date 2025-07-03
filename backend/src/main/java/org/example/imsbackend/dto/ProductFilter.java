package org.example.imsbackend.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.imsbackend.enums.Category;

import java.util.List;

@Data
@NoArgsConstructor
public class ProductFilter {
    private String name;
    private List<Category> categories;
    private Double minPrice;
    private Double maxPrice;
    private Integer page = 0;
    private Integer size = 10;

    public ProductFilter(String name, List<Category> categories, Double minPrice, Double maxPrice,
                            Integer page, Integer size) {
        this.name = name;
        this.categories = categories;
        this.minPrice = minPrice;
        this.maxPrice = maxPrice;
        this.page = page != null ? page : 0;
        this.size = size != null ? size : 10;
    }
}