package org.example.imsbackend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class StatsData {
    private Summary summary;
    private List<ObjectCount> categoriesDistribution;
    private List<ObjectCount> categoriesMovement;
    private MovementsLast24Hours movementsLast24Hours;
    private MovementsLast7Days movementsLast7Days;

    @AllArgsConstructor
    @Setter
    @Getter
    public static class Summary {
        public long totalProducts;
        public long totalStock;
        public double totalValue;
    }

    @AllArgsConstructor
    @Setter
    @Getter
    public static class ObjectCount {
        public String name;
        public long value;
    }

    @AllArgsConstructor
    @Setter
    @Getter
    public static class MovementsLast24Hours {
        public long in;
        public long out;
        public List<ObjectCount> topUsers;
    }

    @AllArgsConstructor
    @Setter
    @Getter
    public static class MovementsLast7Days {
        public List<MovementCount> in;
        public List<MovementCount> out;
    }

    @AllArgsConstructor
    @Setter
    @Getter
    public static class MovementCount {
        public LocalDateTime date;
        public long count;
    }
}
