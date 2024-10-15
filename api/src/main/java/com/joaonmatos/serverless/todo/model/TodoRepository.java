package com.joaonmatos.serverless.todo.model;

import java.util.UUID;

public interface TodoRepository {
    PageEntity list(String ownerId, int limit, UUID lastEvaluatedKey, boolean sortByOldest);
    void create(TodoEntity todo);
    TodoEntity read(UUID id);
    void update(TodoEntity todo);
    void delete(UUID id);
}
