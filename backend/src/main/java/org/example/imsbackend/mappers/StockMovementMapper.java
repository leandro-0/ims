package org.example.imsbackend.mappers;

import org.example.imsbackend.dto.StockMovementDTO;
import org.example.imsbackend.models.StockMovement;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

@Mapper
public interface StockMovementMapper {
    StockMovementMapper INSTANCE = Mappers.getMapper(StockMovementMapper.class);

    StockMovement toStockMovement(StockMovementDTO stockMovementDTO);
    StockMovementDTO toDto(StockMovement stockMovement);
    Iterable<StockMovementDTO> toDto(Iterable<StockMovement> stockMovements);
}
