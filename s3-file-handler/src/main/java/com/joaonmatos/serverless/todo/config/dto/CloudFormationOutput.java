package com.joaonmatos.serverless.todo.config.dto;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

public class CloudFormationOutput {
    final private String physicalResourceId;

    @JsonCreator
    public CloudFormationOutput(@JsonProperty("PhysicalResourceId") String physicalResourceId) {
        this.physicalResourceId = physicalResourceId;
    }

    @JsonProperty("PhysicalResourceId")
    public String getPhysicalResourceId() {
        return physicalResourceId;
    }
}
