package com.joaonmatos.serverless.todo.api;

import java.time.Instant;
import java.util.UUID;

public record TodoDto(
        UUID id,
        String title,
        Instant createdAt
) {
}
