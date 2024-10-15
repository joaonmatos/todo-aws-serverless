package com.joaonmatos.serverless.todo.api;

import java.util.List;

public record PageDto(List<TodoDto> todos, String nextToken) {
}
