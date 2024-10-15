package com.joaonmatos.serverless.todo.service;

import com.fasterxml.uuid.Generators;
import com.joaonmatos.serverless.todo.api.NewTodoDto;
import com.joaonmatos.serverless.todo.api.PageDto;
import com.joaonmatos.serverless.todo.api.TodoDto;
import com.joaonmatos.serverless.todo.model.TodoEntity;
import com.joaonmatos.serverless.todo.model.TodoRepository;
import jakarta.inject.Inject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

public class TodoServiceImpl implements TodoService {
    private static final Logger log = LoggerFactory.getLogger(TodoServiceImpl.class);

    private final TodoRepository todoRepository;
    private final PaginationEncrypter paginationEncrypter;

    @Inject
    public TodoServiceImpl(TodoRepository todoRepository, PaginationEncrypter paginationEncrypter) {
        this.todoRepository = todoRepository;
        this.paginationEncrypter = paginationEncrypter;
    }


    @Override
    public PageDto list(String ownerId, Integer limit, String nextToken, Boolean sortByOldest) {
        var actualLimit = Integer.min(Integer.max(1, limit), 50);
        UUID lastEvaluatedKey = null;
        if (nextToken != null) {
            var paginationParams = paginationEncrypter.decrypt(ownerId, nextToken);
            if (!Objects.equals(paginationParams.sortByOldest(), sortByOldest)) {
                throw new IllegalArgumentException("Invalid nextToken");
            }
            lastEvaluatedKey = paginationParams.lastEvaluatedKey();
        }

        var entityPage = todoRepository.list(ownerId, actualLimit, lastEvaluatedKey, sortByOldest);

        var items = entityPage.getTodos().stream()
                .map(entity -> new TodoDto(
                        entity.getId(),
                        entity.getTitle(),
                        entity.getCreatedAt()
                )).toList();

        var newLastEvaluatedKey = entityPage.getLastEvaluatedTodoId();
        if (newLastEvaluatedKey == null) {
            return new PageDto(items, null);
        } else {
            var paginationParams = new PaginationParams(entityPage.getLastEvaluatedTodoId(), sortByOldest);
            var newNextToken = paginationEncrypter.encrypt(ownerId, paginationParams);
            return new PageDto(items, newNextToken);
        }
    }

    @Override
    public TodoDto create(String ownerId, NewTodoDto newTodo) {
        var id = Generators.timeBasedEpochGenerator().generate();
        var createdAt = Instant.now();
        var entity = new TodoEntity(id, newTodo.title(), ownerId, createdAt);
        todoRepository.create(entity);
        return new TodoDto(id, newTodo.title(), createdAt);
    }

    @Override
    public TodoDto read(String ownerId, UUID id) {
        var entity = todoRepository.read(id);
        if (!Objects.equals(entity.getOwnerId(), ownerId)) {
            throw new IllegalArgumentException("Todo not found");
        }
        return new TodoDto(entity.getId(), entity.getTitle(), entity.getCreatedAt());
    }

    @Override
    public TodoDto update(String ownerId, UUID id, NewTodoDto newTodo) {
        var entity = todoRepository.read(id);
        if (!Objects.equals(entity.getOwnerId(), ownerId)) {
            throw new IllegalArgumentException("Todo not found");
        }
        entity.setTitle(newTodo.title());
        todoRepository.update(entity);
        return new TodoDto(entity.getId(), entity.getTitle(), entity.getCreatedAt());
    }

    @Override
    public void delete(String ownerId, UUID id) {
        var entity = todoRepository.read(id);
        if (!Objects.equals(entity.getOwnerId(), ownerId)) {
            throw new IllegalArgumentException("Todo not found");
        }
        todoRepository.delete(id);
    }
}
