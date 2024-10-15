package com.joaonmatos.serverless.todo.config.dto;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum RequestType {
    CREATE("Create"),
    UPDATE("Update"),
    DELETE("Delete");

    private final String serializedName;

    @JsonValue
    public String getSerializedName() {
        return serializedName;
    }

    @JsonCreator
    RequestType(String serializedName) {
        this.serializedName = serializedName;
    }
}
