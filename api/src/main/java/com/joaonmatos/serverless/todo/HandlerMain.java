package com.joaonmatos.serverless.todo;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.joaonmatos.serverless.todo.dagger.DaggerRoutesComponent;
import io.avaje.sigma.Sigma;
import io.avaje.sigma.Sigma.HttpFunction;
import io.avaje.sigma.aws.events.APIGatewayV2HttpEvent;
import io.avaje.sigma.aws.events.AWSHttpResponse;

public class HandlerMain implements RequestHandler<APIGatewayV2HttpEvent, AWSHttpResponse> {
    private final HttpFunction handler;

    public HandlerMain() {
        var routes = DaggerRoutesComponent.create().routes();
        this.handler = Sigma.create().routing(routes::register)
                .createHttpFunction();
    }

    @Override
    public AWSHttpResponse handleRequest(APIGatewayV2HttpEvent input, Context context) {
        return handler.apply(input, context);
    }
}
