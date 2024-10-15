package com.joaonmatos.serverless.todo.dagger;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.joaonmatos.serverless.todo.model.DynamoDbTodoRepository;
import com.joaonmatos.serverless.todo.model.TodoRepository;
import com.joaonmatos.serverless.todo.service.TodoService;
import com.joaonmatos.serverless.todo.service.TodoServiceImpl;
import dagger.Binds;
import dagger.Module;
import dagger.Provides;

@Module
public interface ImplModule {
    @Binds
    TodoRepository bindTodoRepository(DynamoDbTodoRepository impl);

    @Binds
    TodoService bindTodoService(TodoServiceImpl impl);
}
