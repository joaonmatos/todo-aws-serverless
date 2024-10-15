package com.joaonmatos.serverless.todo.model;

import jakarta.inject.Inject;
import jakarta.inject.Named;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbEnhancedClient;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbIndex;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbTable;
import software.amazon.awssdk.enhanced.dynamodb.Expression;
import software.amazon.awssdk.enhanced.dynamodb.Key;
import software.amazon.awssdk.enhanced.dynamodb.TableSchema;
import software.amazon.awssdk.enhanced.dynamodb.model.PutItemEnhancedRequest;
import software.amazon.awssdk.enhanced.dynamodb.model.QueryConditional;
import software.amazon.awssdk.enhanced.dynamodb.model.QueryEnhancedRequest;
import software.amazon.awssdk.enhanced.dynamodb.model.UpdateItemEnhancedRequest;
import software.amazon.awssdk.services.dynamodb.model.AttributeValue;

import java.util.ArrayList;
import java.util.Map;
import java.util.UUID;

public class DynamoDbTodoRepository implements TodoRepository {
    private static final Logger log = LoggerFactory.getLogger(DynamoDbTodoRepository.class);
    private static final TableSchema<TodoEntity> todoTableSchema = TableSchema.fromBean(TodoEntity.class);

    private final DynamoDbTable<TodoEntity> table;
    private final DynamoDbIndex<TodoEntity> ownerIx;


    @Inject
    public DynamoDbTodoRepository(@Named("todo.table.name") String tableName) {
        var ddbClient = DynamoDbEnhancedClient.create();
        this.table = ddbClient.table(tableName, todoTableSchema);
        this.ownerIx = table.index("ownerIdIndex");
    }

    @Override
    public PageEntity list(String ownerId, int limit, UUID lastEvaluatedKey, boolean sortByOldest) {
        var builder = QueryEnhancedRequest.builder()
                .queryConditional(QueryConditional.keyEqualTo(k -> k.partitionValue(ownerId)))
                .limit(limit)
                .scanIndexForward(sortByOldest);
        if (lastEvaluatedKey != null) {
            builder.exclusiveStartKey(Map.of(
                    "ownerId", AttributeValue.fromS(ownerId),
                    "id", AttributeValue.fromS(lastEvaluatedKey.toString())
            ));
        }
        var request = builder.build();
        var response = ownerIx.query(request);

        var items = new ArrayList<TodoEntity>();
        Map<String, AttributeValue> lastEvaluatedKeyResult = null;
        for (var page: response) {
            if (items.size() + page.items().size() > limit) {
                break;
            }
            items.addAll(page.items());
            lastEvaluatedKeyResult = page.lastEvaluatedKey();
        }

        UUID lastEvaluatedTodoId = null;
        if (lastEvaluatedKeyResult != null) {
            lastEvaluatedTodoId = UUID.fromString(lastEvaluatedKeyResult.get("id").s());
        }

        return new PageEntity(items, lastEvaluatedTodoId);
    }

    @Override
    public void create(TodoEntity todo) {
        var request = PutItemEnhancedRequest.builder(TodoEntity.class)
                .item(todo)
                .conditionExpression(
                        Expression.builder().expression("attribute_not_exists(id)").build()
                )
                .build();
        table.putItem(request);
    }

    @Override
    public TodoEntity read(UUID id) {
        var key = Key.builder().partitionValue(id.toString()).build();
        return table.getItem(key);
    }

    @Override
    public void update(TodoEntity todo) {
        var request = UpdateItemEnhancedRequest.builder(TodoEntity.class)
                .item(todo)
                .conditionExpression(
                        Expression.builder().expression("attribute_exists(id)").build()
                )
                .build();
        table.updateItem(request);
    }

    @Override
    public void delete(UUID id) {
        var key = Key.builder().partitionValue(id.toString()).build();
        table.deleteItem(key);
    }
}
