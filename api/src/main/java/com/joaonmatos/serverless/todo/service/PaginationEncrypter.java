package com.joaonmatos.serverless.todo.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.inject.Inject;
import jakarta.inject.Named;
import software.amazon.awssdk.core.SdkBytes;
import software.amazon.awssdk.services.kms.KmsClient;
import software.amazon.awssdk.services.kms.model.DecryptRequest;
import software.amazon.awssdk.services.kms.model.EncryptRequest;
import software.amazon.awssdk.services.kms.model.EncryptionAlgorithmSpec;

import java.util.Base64;
import java.util.Map;

public class PaginationEncrypter {
    final private ObjectMapper objectMapper;
    final private KmsClient kmsClient;
    final private String keyId;

    @Inject
    public PaginationEncrypter(@Named("kms.key.id") String keyId, ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
        this.keyId = keyId;
        this.kmsClient = KmsClient.create();
    }

    public String encrypt(String ownerId, PaginationParams paginationParams) {
        String json;
        try {
            json = objectMapper.writeValueAsString(paginationParams);
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }
        var request = EncryptRequest.builder()
                .encryptionAlgorithm(EncryptionAlgorithmSpec.SYMMETRIC_DEFAULT)
                .encryptionContext(Map.of("ownerId", ownerId))
                .keyId(keyId)
                .plaintext(SdkBytes.fromUtf8String(json))
                .build();
        var response = kmsClient.encrypt(request);
        var buffer = response.ciphertextBlob().asByteArray();
        return Base64.getUrlEncoder().encodeToString(buffer);
    }

    public PaginationParams decrypt(String ownerId, String encryptedPaginationParams) {
        var buffer = Base64.getUrlDecoder().decode(encryptedPaginationParams);
        var request = DecryptRequest.builder()
                .encryptionAlgorithm(EncryptionAlgorithmSpec.SYMMETRIC_DEFAULT)
                .encryptionContext(Map.of("ownerId", ownerId))
                .keyId(keyId)
                .ciphertextBlob(SdkBytes.fromByteArray(buffer))
                .build();
        var response = kmsClient.decrypt(request);
        var json = response.plaintext().asUtf8String();
        try {
            return objectMapper.readValue(json, PaginationParams.class);
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }
    }
}
