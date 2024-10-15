package com.joaonmatos.serverless.todo.config.dto;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
final public class CloudFormationInput {
    final private RequestType requestType;
    final private ResourceProperties resourceProperties;
    final private String physicalResourceId;

    @JsonCreator
    public CloudFormationInput(
            @JsonProperty("RequestType") RequestType requestType,
            @JsonProperty("ResourceProperties") ResourceProperties resourceProperties,
            @JsonProperty("PhysicalResourceId") String physicalResourceId
    ) {
        this.requestType = requestType;
        this.resourceProperties = resourceProperties;
        this.physicalResourceId = physicalResourceId;
    }

    @JsonProperty("RequestType")
    public RequestType getRequestType() {
        return requestType;
    }

    @JsonProperty("ResourceProperties")
    public ResourceProperties getResourceProperties() {
        return resourceProperties;
    }

    @JsonProperty("PhysicalResourceId")
    public String getPhysicalResourceId() {
        return physicalResourceId;
    }
}
