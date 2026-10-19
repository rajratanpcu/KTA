package com.kta.erp.service;

import com.kta.erp.dto.ProductRequest;
import com.kta.erp.dto.ProductResponse;
import com.kta.erp.entity.Category;
import com.kta.erp.entity.Product;
import com.kta.erp.entity.Unit;
import com.kta.erp.repository.CategoryRepository;
import com.kta.erp.repository.ProductRepository;
import com.kta.erp.repository.UnitRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final UnitRepository unitRepository;

    public List<ProductResponse> getAllProducts() {
        return productRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<ProductResponse> getActiveProducts() {
        return productRepository.findByActiveTrue().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public ProductResponse getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));
        return toResponse(product);
    }

    public ProductResponse getProductBySku(String sku) {
        Product product = productRepository.findBySku(sku)
                .orElseThrow(() -> new RuntimeException("Product not found with SKU: " + sku));
        return toResponse(product);
    }

    public List<ProductResponse> searchProducts(String search) {
        return productRepository.searchProducts(search).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public ProductResponse createProduct(ProductRequest request) {
        if (productRepository.existsBySku(request.getSku())) {
            throw new RuntimeException("Product already exists with SKU: " + request.getSku());
        }

        if (request.getBarcode() != null && productRepository.existsByBarcode(request.getBarcode())) {
            throw new RuntimeException("Product already exists with barcode: " + request.getBarcode());
        }

        Product product = new Product();
        mapRequestToEntity(request, product);

        Product savedProduct = productRepository.save(product);
        return toResponse(savedProduct);
    }

    @Transactional
    public ProductResponse updateProduct(Long id, ProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));

        // Check SKU uniqueness
        if (!product.getSku().equals(request.getSku()) && productRepository.existsBySku(request.getSku())) {
            throw new RuntimeException("Product already exists with SKU: " + request.getSku());
        }

        // Check barcode uniqueness
        if (request.getBarcode() != null &&
            !request.getBarcode().equals(product.getBarcode()) &&
            productRepository.existsByBarcode(request.getBarcode())) {
            throw new RuntimeException("Product already exists with barcode: " + request.getBarcode());
        }

        mapRequestToEntity(request, product);
        Product updatedProduct = productRepository.save(product);
        return toResponse(updatedProduct);
    }

    @Transactional
    public void deleteProduct(Long id) {
        if (!productRepository.existsById(id)) {
            throw new RuntimeException("Product not found with id: " + id);
        }
        productRepository.deleteById(id);
    }

    private void mapRequestToEntity(ProductRequest request, Product product) {
        product.setSku(request.getSku());
        product.setBarcode(request.getBarcode());
        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPurchasePrice(request.getPurchasePrice());
        product.setSellingPrice(request.getSellingPrice());
        product.setGstRate(request.getGstRate());
        product.setMinStockLevel(request.getMinStockLevel());
        product.setActive(request.getActive());

        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Category not found with id: " + request.getCategoryId()));
            product.setCategory(category);
        } else {
            product.setCategory(null);
        }

        if (request.getUnitId() != null) {
            Unit unit = unitRepository.findById(request.getUnitId())
                    .orElseThrow(() -> new RuntimeException("Unit not found with id: " + request.getUnitId()));
            product.setUnit(unit);
        } else {
            product.setUnit(null);
        }
    }

    private ProductResponse toResponse(Product product) {
        ProductResponse response = new ProductResponse();
        response.setId(product.getId());
        response.setSku(product.getSku());
        response.setBarcode(product.getBarcode());
        response.setName(product.getName());
        response.setDescription(product.getDescription());
        response.setPurchasePrice(product.getPurchasePrice());
        response.setSellingPrice(product.getSellingPrice());
        response.setGstRate(product.getGstRate());
        response.setMinStockLevel(product.getMinStockLevel());
        response.setActive(product.getActive());
        response.setCreatedAt(product.getCreatedAt());
        response.setUpdatedAt(product.getUpdatedAt());

        if (product.getCategory() != null) {
            response.setCategoryId(product.getCategory().getId());
            response.setCategoryName(product.getCategory().getName());
        }

        if (product.getUnit() != null) {
            response.setUnitId(product.getUnit().getId());
            response.setUnitName(product.getUnit().getName());
            response.setUnitAbbreviation(product.getUnit().getAbbreviation());
        }

        return response;
    }
}
