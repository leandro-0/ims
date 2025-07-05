package org.example.imsbackend.mappers;

import org.example.imsbackend.dto.ProductDTO;
import org.example.imsbackend.models.Product;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

@Mapper
public interface ProductMapper {
    ProductMapper INSTANCE = Mappers.getMapper(ProductMapper.class);

    ProductDTO toDto(Product product);
    Product toEntity(ProductDTO productDTO);
    Iterable<ProductDTO> toDto(Iterable<Product> products);
}
