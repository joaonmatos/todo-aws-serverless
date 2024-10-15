package com.joaonmatos.serverless.todo.service;

import java.util.UUID;

public record PaginationParams(UUID lastEvaluatedKey, boolean sortByOldest) { }
