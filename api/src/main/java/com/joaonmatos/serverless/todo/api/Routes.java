package com.joaonmatos.serverless.todo.api;

import com.joaonmatos.serverless.todo.service.TodoService;
import io.avaje.sigma.HttpContext;
import io.avaje.sigma.Router;
import io.avaje.sigma.aws.events.APIGatewayV2HttpEvent;
import jakarta.inject.Inject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Objects;
import java.util.UUID;

public class Routes {
    private static final Logger log = LoggerFactory.getLogger(Routes.class);
    private final TodoService todoService;

    @Inject
    public Routes(TodoService todoService){
        this.todoService = todoService;
    }

    public void register(Router router) {
        router.get("/todos", this::listTodos)
                .post("/todos", this::createTodo)
                .get("/todos/{id}", this::readTodo)
                .put("/todos/{id}", this::updateTodo)
                .delete("/todos/{id}", this::deleteTodo)
                .get("/ping", this::ping);
    }

    public void listTodos(HttpContext ctx) {
        var ownerId = (String) null;
        var limit = parseInt(ctx.queryParam("limit"));
        var nextToken = ctx.queryParam("nextToken");
        var sortByOldest = Boolean.parseBoolean(ctx.queryParam("sortByOldest"));
        var page = todoService.list(ownerId, limit, nextToken, sortByOldest);
        ctx.status(200).json(page);
    }

    public void createTodo(HttpContext ctx) {
        var ownerId = (String) null;
        var newTodo = ctx.bodyAsClass(NewTodoDto.class);
        var todo = todoService.create(ownerId, newTodo);
        ctx.status(200).json(todo);
    }

    public void readTodo(HttpContext ctx) {
        var ownerId = (String) null;
        var id = parseUUID(ctx.pathParam("id"));
        Objects.requireNonNull(id);
        var todo = todoService.read(ownerId, id);
        ctx.status(200).json(todo);
    }

    public void updateTodo(HttpContext ctx) {
        var ownerId = (String) null;
        var id = parseUUID(ctx.pathParam("id"));
        Objects.requireNonNull(id);
        var newTodo = ctx.bodyAsClass(NewTodoDto.class);
        var todo = todoService.update(ownerId, id, newTodo);
        ctx.status(200).json(todo);
    }

    public void deleteTodo(HttpContext ctx) {
        var ownerId = (String) null;
        var id = parseUUID(ctx.pathParam("id"));
        Objects.requireNonNull(id);
        todoService.delete(ownerId, id);
        ctx.status(204);
    }

    public void ping(HttpContext ctx) {
        log.info("awsContext: {}; awsRequest: {}", ctx.awsContext(), request(ctx));
        ctx.status(200).text("pong");
    }

    private Integer parseInt(String nullableString) {
        if (nullableString == null) {
            return null;
        }
        return Integer.parseInt(nullableString);
    }

    private UUID parseUUID(String nullableString) {
        if (nullableString == null) {
            return null;
        }
        return UUID.fromString(nullableString);
    }

    private APIGatewayV2HttpEvent request(HttpContext ctx) {
        return ctx.awsRequest();
    }
}
