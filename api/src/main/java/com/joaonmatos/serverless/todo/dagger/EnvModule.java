package com.joaonmatos.serverless.todo.dagger;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import dagger.Module;
import dagger.Provides;
import jakarta.inject.Named;

import java.util.Objects;

@Module
public class EnvModule {
    @Provides
    @Named("todo.table.name")
    public String provideTodoTableName() {
        return env("TODO_TABLE_NAME");
    }

    @Provides
    @Named("kms.key.id")
    public String provideKmsKeyId() {
        return env("KMS_KEY_ID");
    }

    @Provides
    public ObjectMapper provideObjectMapper() {
        return new ObjectMapper()
                .registerModule(new JavaTimeModule())
                .configure(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS, false);
    }

    private String env(String key) {
        var value = System.getenv(key);
        return Objects.requireNonNull(value);
    }
}
