package com.joaonmatos.serverless.todo.config.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public record ResourceProperties(
                String bucketName,
                String objectKey,
                String configParameterName,
                String distributionId) {
}
