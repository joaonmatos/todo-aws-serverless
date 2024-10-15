package com.joaonmatos.serverless.todo;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestStreamHandler;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.joaonmatos.serverless.todo.config.dto.CloudFormationInput;
import com.joaonmatos.serverless.todo.config.dto.CloudFormationOutput;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.cloudfront.CloudFrontClient;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.ssm.SsmClient;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;

public class S3FileHandler implements RequestStreamHandler {
    private static final Logger log = LoggerFactory.getLogger(S3FileHandler.class);

    private final ObjectMapper objectMapper = new ObjectMapper();

    private final SsmClient ssmClient = SsmClient.create();
    private final S3Client s3Client = S3Client.create();
    private final CloudFrontClient cloudFrontClient = CloudFrontClient.create();

    @Override
    public void handleRequest(InputStream inputStream, OutputStream outputStream, Context context) throws IOException {
        try {
            log.info("Processing request {}", context.getAwsRequestId());
            log.info("Parsing input...");
            var request = objectMapper.readValue(inputStream, CloudFormationInput.class);
            log.info("Request type: {}", request.getRequestType());

            var props = request.getResourceProperties();
            var bucketName = props.bucketName();
            var objectKey = props.objectKey();
            var paramName = props.configParameterName();
            var distributionId = props.distributionId();

            var physicalId = switch (request.getRequestType()) {
                case CREATE, UPDATE ->
                        upsertConfig(bucketName, objectKey, paramName);
                case DELETE -> {
                    deleteConfig(bucketName, objectKey);
                    yield null;
                }
            };
            log.info("Physical ID: {}", physicalId);
            var output = new CloudFormationOutput(physicalId);

            if (distributionId != null) {
                log.info("Invalidating distribution {}", distributionId);
                cloudFrontClient.createInvalidation(i -> i.invalidationBatch(
                        b -> b.callerReference(context.getAwsRequestId())
                                .paths(p -> p.items(objectKey))
                ));
            }

            log.info("Writing response...");
            objectMapper.writeValue(outputStream, output);
        } catch (Exception e) {
            log.error("Error processing request", e);
            throw new IOException(e);
        }
    }

    private String upsertConfig(String bucketName, String objectKey, String paramName) {
        var param = ssmClient.getParameter(req -> req.name(paramName));
        var body = RequestBody.fromString(param.parameter().value(), StandardCharsets.UTF_8);
        s3Client.putObject(
                req -> req.bucket(bucketName)
                        .key(objectKey),
                body);
        return "s3://" + bucketName + "/" + objectKey;
    }

    private void deleteConfig(String bucketName, String objectKey) {
        s3Client.deleteObject(req -> req.bucket(bucketName).key(objectKey));
    }
}