package org.example.imsbackend.data;

import net.datafaker.Faker;
import org.example.imsbackend.enums.Category;
import org.example.imsbackend.models.Product;
import org.example.imsbackend.repositories.ProductRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import lombok.RequiredArgsConstructor;

import java.util.Locale;
import java.util.Random;

@Component
@RequiredArgsConstructor
public class DataLoader implements CommandLineRunner {
    private final ProductRepository productRepository;

    private final Faker faker = new Faker(new Locale("es"));
    private final Random random = new Random();

    @Override
    public void run(String... args) throws Exception {
        if (productRepository.count() == 0) {
            loadProductData();
            System.out.println("✅ Database initialized with fake data");
        } else {
            System.out.println("⚠️ Database already contains data, skipping initialization");
        }
    }

    private void loadProductData() {
        System.out.println("🔄 Loading fake data...");
        for (int i = 0; i < 50; i++) {
            Product product = createFakeProduct();
            productRepository.save(product);
        }
        System.out.println("✅ Fake data loaded successfully");
    }

    private Product createFakeProduct() {
        Product product = new Product();
        Category category = getRandomCategory();
        product.setCategory(category);
        product.setName(generateProductName(category));
        product.setDescription(faker.lorem().sentence(10, 20));
        product.setPrice(generateRealisticPrice(category));
        int initialStock = faker.number().numberBetween(0, 101);
        product.setInitialStock(initialStock);
        product.setStock(faker.number().numberBetween(0, initialStock + 1));
        return product;
    }

    private Category getRandomCategory() {
        Category[] categories = Category.values();
        return categories[random.nextInt(categories.length)];
    }

    private String generateProductName(Category category) {
        return switch (category) {
            case ELECTRONICS -> faker.options().option(
                    "Laptop " + faker.company().name(),
                    "Smartphone " + faker.company().name(),
                    "Tablet " + faker.company().name(),
                    "Auriculares " + faker.company().name(),
                    "Monitor " + faker.number().numberBetween(20, 32) + "\"",
                    "Teclado " + faker.options().option("Mecánico", "Inalámbrico", "Gaming"),
                    "Mouse " + faker.options().option("Óptico", "Láser", "Gaming"),
                    "Cámara " + faker.company().name(),
                    "Impresora " + faker.company().name(),
                    "Altavoces " + faker.company().name());
            case FURNITURE -> faker.options().option(
                    "Sofá " + faker.options().option("de Cuero", "Moderno", "Clásico"),
                    "Mesa " + faker.options().option("de Comedor", "de Centro", "de Trabajo"),
                    "Silla " + faker.options().option("Ejecutiva", "Ergonómica", "Reclinable"),
                    "Estantería " + faker.options().option("de Madera", "Moderna", "Industrial"),
                    "Cama " + faker.options().option("King", "Queen", "Individual"),
                    "Armario " + faker.options().option("Empotrado", "Modular", "Vintage"),
                    "Escritorio " + faker.options().option("Moderno", "Clásico", "Minimalista"),
                    "Lámpara " + faker.options().option("de Pie", "de Mesa", "Colgante"),
                    "Cómoda " + faker.options().option("de Madera", "Moderna", "Vintage"),
                    "Mesita " + faker.options().option("de Noche", "Auxiliar", "de Centro"));
            case CLOTHING -> faker.options().option(
                    "Camiseta " + faker.color().name(),
                    "Pantalón " + faker.options().option("Vaquero", "Chino", "Deportivo"),
                    "Chaqueta " + faker.options().option("de Cuero", "Deportiva", "Elegante"),
                    "Vestido " + faker.options().option("Casual", "Elegante", "de Fiesta"),
                    "Zapatos " + faker.options().option("Deportivos", "Formales", "Casuales"),
                    "Falda " + faker.options().option("Corta", "Larga", "Midi"),
                    "Suéter " + faker.color().name(),
                    "Camisa " + faker.options().option("Formal", "Casual", "de Manga Corta"),
                    "Jeans " + faker.options().option("Slim", "Regular", "Bootcut"),
                    "Abrigo " + faker.options().option("de Invierno", "Ligero", "Impermeable"));
            case FOOD -> faker.options().option(
                    "Café " + faker.options().option("Arábica", "Robusta", "Descafeinado"),
                    "Chocolate " + faker.options().option("Negro", "con Leche", "Blanco"),
                    "Miel " + faker.options().option("de Flores", "de Acacia", "Orgánica"),
                    "Aceite " + faker.options().option("de Oliva", "de Girasol", "de Coco"),
                    "Pasta " + faker.options().option("Integral", "Tradicional", "Sin Gluten"),
                    "Arroz " + faker.options().option("Basmati", "Integral", "Jazmín"),
                    "Té " + faker.options().option("Verde", "Negro", "de Hierbas"),
                    "Especias " + faker.options().option("Curry", "Pimentón", "Orégano"),
                    "Frutos Secos " + faker.options().option("Almendras", "Nueces", "Avellanas"),
                    "Conservas " + faker.options().option("de Tomate", "de Atún", "de Frutas"));
            case TOYS -> faker.options().option(
                    "Muñeca " + faker.name().firstName(),
                    "Coche " + faker.options().option("de Carreras", "Teledirigido", "Clásico"),
                    "Puzzle " + faker.number().numberBetween(100, 2000) + " piezas",
                    "Peluche " + faker.animal().name(),
                    "Construcción " + faker.options().option("Lego", "Bloques", "Magnético"),
                    "Juego " + faker.options().option("de Mesa", "Educativo", "Electrónico"),
                    "Pelota " + faker.options().option("de Fútbol", "de Básquet", "Multicolor"),
                    "Robot " + faker.options().option("Programable", "Interactivo", "Transformable"),
                    "Instrumento " + faker.options().option("Piano", "Guitarra", "Xilófono"),
                    "Arte " + faker.options().option("Pintura", "Plastilina", "Crayones"));
        };
    }

    private double generateRealisticPrice(Category category) {
        return switch (category) {
            case ELECTRONICS -> faker.number().randomDouble(2, 50, 3000);
            case FURNITURE -> faker.number().randomDouble(2, 80, 2000);
            case CLOTHING -> faker.number().randomDouble(2, 15, 200);
            case FOOD -> faker.number().randomDouble(2, 2, 50);
            case TOYS -> faker.number().randomDouble(2, 5, 150);
        };
    }
}