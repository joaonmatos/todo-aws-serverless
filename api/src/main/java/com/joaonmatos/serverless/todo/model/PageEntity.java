package com.joaonmatos.serverless.todo.model;

import java.util.List;
import java.util.Objects;
import java.util.UUID;

public class PageEntity {
    private List<TodoEntity> todos;
    private UUID lastEvaluatedTodoId;

    public PageEntity() {
    }

    public PageEntity(List<TodoEntity> todos, UUID lastEvaluatedTodoId) {
        this.todos = todos;
        this.lastEvaluatedTodoId = lastEvaluatedTodoId;
    }

    public List<TodoEntity> getTodos() {
        return todos;
    }

    public void setTodos(List<TodoEntity> todos) {
        this.todos = todos;
    }

    public UUID getLastEvaluatedTodoId() {
        return lastEvaluatedTodoId;
    }

    public void setLastEvaluatedTodoId(UUID lastEvaluatedTodoId) {
        this.lastEvaluatedTodoId = lastEvaluatedTodoId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof PageEntity that)) return false;
        return Objects.equals(todos, that.todos) && Objects.equals(lastEvaluatedTodoId, that.lastEvaluatedTodoId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(todos, lastEvaluatedTodoId);
    }

    @Override
    public String toString() {
        return "PageEntity{" +
                "todos=" + todos +
                ", lastEvaluatedKey=" + lastEvaluatedTodoId +
                '}';
    }
}
