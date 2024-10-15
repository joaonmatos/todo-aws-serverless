package com.joaonmatos.serverless.todo.service;

import com.joaonmatos.serverless.todo.api.NewTodoDto;
import com.joaonmatos.serverless.todo.api.PageDto;
import com.joaonmatos.serverless.todo.api.TodoDto;

import java.util.UUID;

public interface TodoService {
    PageDto list(String ownerId, Integer limit, String nextToken, Boolean sortByOldest);
    TodoDto create(String ownerId, NewTodoDto newTodo);
    TodoDto read(String ownerId, UUID id);
    TodoDto update(String ownerId, UUID id, NewTodoDto newTodo);
    void delete(String ownerId, UUID id);
}
